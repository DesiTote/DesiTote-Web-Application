import crypto from "crypto";
import Cart from "../cart/cart.model.js";
import Product from "../product/product.model.js";
import {Address} from "../address/address.model.js"; // adjust path to your actual Address model
import { getRedis } from "../../config/redis.js";
import { ApiError } from "../../utils/ApiError.js";
import { CheckoutSession, CheckoutShippingOptions, ShippingQuote } from "../../types/checkout.js";
import { getShippingRate } from "../../services/shiprocket.service.js";
import { Order } from "../order/order.model.js";
import { applyOffers, offersNow } from "../offers/applyOffers.js";
import { toOfferLines } from "../cart/cartLines.js";
import { checkoutTotals, meetsFreeShippingThreshold } from "./checkoutTotals.js";
const SESSION_TTL_SECONDS = 60 * 20; // 20 min
// Orders in these states never went through, so they do not use up the first-order discount.
const NOT_A_REAL_ORDER = ["pending_payment", "payment_failed", "cancelled", "failed"];

interface BuyNowInput {
    productId: string;
    quantity: number;
}



/* ────────────────────────────────────────────────────────────
 * Packaging weight
 *
 * Rule: each SMALL courier bag holds up to 2 units of the SAME product.
 * Different tote types are never mixed in one small bag — each product
 * type gets its own small bag(s). If the order contains more than one
 * distinct product, everything additionally goes inside one BIG courier
 * bag (which also holds the invoice). Dimensions are not considered —
 * only actual product weight + bag weight.
 * ──────────────────────────────────────────────────────────── */
const SMALL_BAG_WEIGHT_KG = 0.005; // 5 gm
const BIG_BAG_WEIGHT_KG = 0.02; // 20 gm
const MAX_UNITS_PER_SMALL_BAG = 2;

function calculatePackageWeight(items: { productId: string; quantity: number; weight?: number | null }[]) {
    const actualProductWeight = items.reduce(
        (sum, i) => sum + (i.weight ?? 0.2) * i.quantity, // 0.2kg fallback if a product is missing weight
        0
    );

    const distinctProductCount = new Set(items.map((i) => i.productId)).size;

    // Each product type packed on its own — ceil(qty/2) small bags per product
    const smallBagsCount = items.reduce(
        (sum, i) => sum + Math.ceil(i.quantity / MAX_UNITS_PER_SMALL_BAG),
        0
    );

    const usesBigBag = distinctProductCount > 1;

    const packagingWeight = smallBagsCount * SMALL_BAG_WEIGHT_KG + (usesBigBag ? BIG_BAG_WEIGHT_KG : 0);

    return {
        chargeableWeight: actualProductWeight + packagingWeight,
        packagingBreakdown: { smallBagsCount, usesBigBag },
    };
}

/* ────────────────────────────────────────────────────────────
 * Redis helpers — centralised so TTL handling is consistent
 * ──────────────────────────────────────────────────────────── */
async function readSession(sessionId: string, userId: string): Promise<CheckoutSession> {
    const redis = getRedis();
    const session: CheckoutSession | null = await redis.get(`checkout:${sessionId}`);

    if (!session) {
        throw new ApiError(404, "Checkout session not found or expired");
    }
    if (session.userId !== userId) {
        throw new ApiError(403, "You are not authorized to access this checkout session");
    }

    // Catalogue prices are now the final customer-facing prices. Normalise any
    // short-lived checkout session created before this change as well.
    if (session.gstAmount !== 0) {
        session.gstAmount = 0;
        const quote = session.paymentMethod ? session.shippingOptions?.[session.paymentMethod] : null;
        session.total = quote ? session.subtotal - session.discount + quote.charge : null;
        await writeSession(sessionId, session);
    }
    return session;
}

async function writeSession(sessionId: string, session: CheckoutSession) {
    const redis = getRedis();
    // refresh TTL on every write so an active checkout doesn't expire mid-flow
    await redis.set(`checkout:${sessionId}`, session, { ex: SESSION_TTL_SECONDS });
}

/* ────────────────────────────────────────────────────────────
 * Shared shipping recalculation — runs on ADDRESS change.
 * Computes BOTH payment methods' quotes together so switching
 * payment method afterward never needs another Shiprocket call.
 * ──────────────────────────────────────────────────────────── */
async function recalculateShipping(session: CheckoutSession) {
    session.gstAmount = 0;
    if (!session.deliveryAddress) {
        session.shippingOptions = null;
        session.total = null;
        session.shippingError = null;
        return session;
    }

    try {
        const { chargeableWeight, packagingBreakdown } = calculatePackageWeight(session.items);
        const declaredValue = session.subtotal - session.discount;

        const [codRate, onlineRate] = await Promise.allSettled([
            getShippingRate({
                deliveryPincode: session.deliveryAddress.pincode,
                weightKg: chargeableWeight,
                isCOD: true,
                declaredValue,
            }),
            getShippingRate({
                deliveryPincode: session.deliveryAddress.pincode,
                weightKg: chargeableWeight,
                isCOD: false,
                declaredValue,
            }),
        ]);

        // The storefront advertises free shipping above a threshold, so honour it
        // here — this is the single place a shipping charge is decided, and every
        // downstream total (session total, COD order, Razorpay amount, the figure
        // sent to Shiprocket) reads from it. Set FREE_SHIPPING_THRESHOLD to 0 to
        // charge shipping on every order.
        const freeShippingThreshold = Number(process.env.FREE_SHIPPING_THRESHOLD ?? 999);
        // A flat cushion added to every charged shipping quote. The quote is the
        // cheapest courier, but Shiprocket now assigns the best-rated one (up to
        // ~₹20 dearer, e.g. Blue Dart Pune to Bangalore), and its estimate runs a
        // few rupees under the real "Ship Now" bill. Tune with SHIPPING_BUFFER; 0 disables it.
        const shippingBuffer = Number(process.env.SHIPPING_BUFFER ?? 20);
        // Judged before the first-order 10%, because the cart drawer promised free shipping without knowing it.
        const qualifiesForFreeShipping = meetsFreeShippingThreshold(session, freeShippingThreshold);

        const toQuote = (result: PromiseSettledResult<Awaited<ReturnType<typeof getShippingRate>>>): ShippingQuote | null => {
            if (result.status !== "fulfilled") return null;
            const rate = result.value;
            return {
                courierId: rate.courierId,
                courierName: rate.courierName,
                // Zeroed when the order qualifies. The courier and the chargeable
                // weight below are kept intact — the shipment still has to be
                // booked and paid for, the customer just isn't billed for it.
                charge: qualifiesForFreeShipping ? 0 : rate.totalCharge + shippingBuffer,
                chargeableWeight,
                packagingBreakdown,
                calculatedAt: Date.now(),
            };
        };

        const shippingOptions: CheckoutShippingOptions = {
            COD: toQuote(codRate),
            ONLINE: toQuote(onlineRate),
        };

        session.shippingOptions = shippingOptions;

        if (!shippingOptions.COD && !shippingOptions.ONLINE) {
            // Neither method serviceable for this pincode at all
            session.total = null;
            session.shippingError = "Delivery is not available to this pincode";
        } else {
            session.shippingError = null;
            // If the currently selected method isn't serviceable but the other is,
            // total stays null until the user (or frontend default) picks the serviceable one.
            const selectedQuote = session.paymentMethod ? shippingOptions[session.paymentMethod] : null;
            session.total = selectedQuote
                ? session.subtotal - session.discount + selectedQuote.charge
                : null;
        }
    } catch (err) {
        session.shippingOptions = null;
        session.total = null;
        session.shippingError =
            err instanceof Error ? err.message : "Unable to calculate shipping for this address";
    }

    return session;
}

/* ────────────────────────────────────────────────────────────
 * Create checkout session
 * ──────────────────────────────────────────────────────────── */
export const createCheckoutSessionService = async (
    userId: string,
    selectedProductIds: string[],
    buyNowItem?: BuyNowInput
) => {
    const redis = getRedis();
    let itemsToProcess: Array<{ productId: string; quantity: number; isFreeGift: boolean }> = [];
    let source: "CART" | "BUY_NOW" = "CART";

    // ─── STEP 1: PARSE SOURCE (BUY NOW VS STANDARD CART) ─────────────────
    if (buyNowItem) {
        source = "BUY_NOW";
        itemsToProcess = [{ productId: buyNowItem.productId, quantity: buyNowItem.quantity, isFreeGift: false }];
    } else {
        source = "CART";
        const cart = await Cart.findOne({ userId }).lean();
        if (!cart || !cart.items.length) {
            throw new ApiError(404, "Your shopping cart is empty");
        }

        const paidItems = cart.items.filter(
            (item) => item.isFreeGift !== true && selectedProductIds.includes(item.productId.toString())
        );

        if (!paidItems.length) {
            throw new ApiError(400, "No valid items selected for checkout");
        }

        // Free bags are never picked one by one: they all come along, and applyOffers keeps as many as the selected totes earn.
        const freeItems = cart.items.filter((item) => item.isFreeGift === true);

        itemsToProcess = [...paidItems, ...freeItems].map((item) => ({
            productId: item.productId.toString(),
            quantity: item.quantity,
            isFreeGift: item.isFreeGift === true,
        }));
    }

    // ─── STEP 2: BATCH PRODUCT FETCH (AVOIDS N+1) ────────────────────────
    const productIds = itemsToProcess.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } })
        .select("title price discountPrice stock thumbnail weight sku gstPercentage tags") // weight/sku for shipping + Shiprocket line items, tags for the free-bag design group
        .lean();

    const productMap = new Map(products.map((p) => [p._id.toString(), p]));

    // ─── STEP 3: PRICE THROUGH THE ONE OFFER, SNAPSHOT ITEMS, SUBTOTAL + DISCOUNT ──
    for (const item of itemsToProcess) {
        if (!productMap.has(item.productId)) {
            throw new ApiError(404, "One or more products in your checkout do not exist");
        }
    }

    // Two checkouts opened side by side before either is paid could both get the first-order discount.
    const hasPastOrder = await Order.exists({ userId, status: { $nin: NOT_A_REAL_ORDER } });
    const result = applyOffers(toOfferLines(itemsToProcess, productMap), {
        now: offersNow(),
        isFirstOrder: !hasPastOrder,
    });

    // A tote can be in the order both paid and free, so stock has to cover the two together.
    const unitsWanted = new Map<string, number>();
    for (const line of result.lines) {
        unitsWanted.set(line.productId, (unitsWanted.get(line.productId) ?? 0) + line.quantity);
    }

    // Built from the priced lines, so a free bag applyOffers dropped is simply absent and a partly kept one has its kept quantity.
    const checkoutItems = result.lines.map((line) => {
        const product = productMap.get(line.productId)!;

        if (product.stock < unitsWanted.get(line.productId)!) {
            throw new ApiError(400, `"${product.title}" is out of stock or low on inventory`);
        }

        return {
            productId: line.productId,
            quantity: line.quantity,
            isFreeGift: line.isFreeGift,
            priceAtCheckout: line.unitPrice, // actual selling price: 0 for a free bag
            originalPrice: product.price, // MRP — display/invoice only
            sku: product.sku ?? line.productId, // fallback to productId if the product genuinely has no SKU yet
            weight: product.weight ?? null, // stored per item so recalculation never has to re-query products
            title: product.title,
            thumbnail: product.thumbnail,
            gstPercentage: product.gstPercentage,
        };
    });

    // subtotal is the sum of ORIGINAL prices; discount is the sale markdown, free bags and first-order 10% together.
    const { subtotal, discount } = checkoutTotals(
        checkoutItems.map((i) => ({ originalPrice: i.originalPrice, unitPrice: i.priceAtCheckout, quantity: i.quantity })),
        result.orderLevelDiscount
    );
    const gstAmount = 0; // Catalogue prices are final; tax is not added at checkout.

    // ─── STEP 4: AUTO-APPLY DEFAULT ADDRESS IF ONE EXISTS or take recently created ────────────────
    const defaultAddress = await Address.findOne({ userId })
        .sort({ isDefault: -1, createdAt: -1 })
        .lean();
 

    let deliveryAddress = null;
    let paymentMethod: "COD" | "ONLINE" | null = null;

    if (defaultAddress) {
        deliveryAddress = {
            fullName: defaultAddress.fullName,
            mobileNumber: defaultAddress.mobileNumber,
            addressLine1: defaultAddress.addressLine1,
            addressLine2: defaultAddress?.addressLine2 || "",
            district: defaultAddress.district,
            state: defaultAddress.state,
            pincode: defaultAddress.pincode,
            country: defaultAddress.country ||"India",
        };
        // Pre-select ONLINE so a Grand Total can be shown immediately without
        // waiting on a payment-method tap. User can switch to COD via the
        // PaymentMethod UI, which recalculates the total from the cached quote.
        paymentMethod = "ONLINE";
    }

    // ─── STEP 5: BUILD SESSION ────────────────────────────────────────────
    const sessionId = crypto.randomUUID();
    let sessionData: CheckoutSession = {
        userId,
        source,
        status: "INITIATED",
        items: checkoutItems,
        discount,
        subtotal,
        offer: result.offerSaving === 0 ? null : result.offer,
        offerSaving: result.offerSaving,
        removedFreeLines: result.removedFreeLines,
        gstAmount: Math.round(gstAmount * 100) / 100,
        deliveryAddress,
        paymentMethod,
        shippingOptions: null,
        shippingError: null,
        total: null,
    };

    // Address (and default COD selection) auto-applied → calculate both quotes
    // right away so the frontend gets a real total on first load.
    if (deliveryAddress) {
        sessionData = await recalculateShipping(sessionData);
    }

    await redis.set(`checkout:${sessionId}`, sessionData, { ex: SESSION_TTL_SECONDS });

    return { sessionId };
};

/* ────────────────────────────────────────────────────────────
 * Get checkout session
 * ──────────────────────────────────────────────────────────── */
export const getCheckoutSessionService = async (sessionId: string, userId: string) => {
    return readSession(sessionId, userId);
};

/* ────────────────────────────────────────────────────────────
 * PATCH: set/change delivery address
 * ──────────────────────────────────────────────────────────── */
export const updateCheckoutAddressService = async (
    sessionId: string,
    userId: string,
    addressId: string
) => {
    const session = await readSession(sessionId, userId);

    const address = await Address.findOne({ _id: addressId, userId }).lean();
    if (!address) {
        throw new ApiError(404, "Address not found");
    }

    session.deliveryAddress = {
        fullName: address.fullName,
        mobileNumber: address.mobileNumber,
        addressLine1: address.addressLine1,
        addressLine2: address.addressLine2,
        district: address.district,
        state: address.state,
        pincode: address.pincode,
        country: address.country || "India",
    };

    const updated = await recalculateShipping(session);
    await writeSession(sessionId, updated);

    return updated;
};

/* ────────────────────────────────────────────────────────────
 * PATCH: set/change payment method
 * No Shiprocket call here — both quotes were already computed
 * together when the address was set. This just switches the total.
 * ──────────────────────────────────────────────────────────── */
export const updateCheckoutPaymentMethodService = async (
    sessionId: string,
    userId: string,
    paymentMethod: "COD" | "ONLINE"
) => {
    if (paymentMethod !== "COD" && paymentMethod !== "ONLINE") {
        throw new ApiError(400, "Invalid payment method");
    }

    const session = await readSession(sessionId, userId);

    if (!session.deliveryAddress || !session.shippingOptions) {
        throw new ApiError(400, "Please select a delivery address first");
    }

    const quote = session.shippingOptions[paymentMethod];
    if (!quote) {
        throw new ApiError(422, `${paymentMethod === "COD" ? "Cash on Delivery" : "Online payment"} is not available for this address`);
    }

    session.paymentMethod = paymentMethod;
    session.gstAmount = 0;
    session.total = session.subtotal - session.discount + quote.charge;

    await writeSession(sessionId, session);
    return session;
};
