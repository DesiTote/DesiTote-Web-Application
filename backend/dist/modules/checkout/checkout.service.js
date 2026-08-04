import crypto from "crypto";
import Cart from "../cart/cart.model.js";
import Product from "../product/product.model.js";
import { Address } from "../address/address.model.js"; // adjust path to your actual Address model
import { getRedis } from "../../config/redis.js";
import { ApiError } from "../../utils/ApiError.js";
import { getShippingRate } from "../../services/shiprocket.service.js";
const SESSION_TTL_SECONDS = 60 * 20; // 20 min
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
function calculatePackageWeight(items) {
    const actualProductWeight = items.reduce((sum, i) => sum + (i.weight ?? 0.2) * i.quantity, // 0.2kg fallback if a product is missing weight
    0);
    const distinctProductCount = new Set(items.map((i) => i.productId)).size;
    // Each product type packed on its own — ceil(qty/2) small bags per product
    const smallBagsCount = items.reduce((sum, i) => sum + Math.ceil(i.quantity / MAX_UNITS_PER_SMALL_BAG), 0);
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
async function readSession(sessionId, userId) {
    const redis = getRedis();
    const session = await redis.get(`checkout:${sessionId}`);
    if (!session) {
        throw new ApiError(404, "Checkout session not found or expired");
    }
    if (session.userId !== userId) {
        throw new ApiError(403, "You are not authorized to access this checkout session");
    }
    return session;
}
async function writeSession(sessionId, session) {
    const redis = getRedis();
    // refresh TTL on every write so an active checkout doesn't expire mid-flow
    await redis.set(`checkout:${sessionId}`, session, { ex: SESSION_TTL_SECONDS });
}
/* ────────────────────────────────────────────────────────────
 * Shared shipping recalculation — runs on ADDRESS change.
 * Computes BOTH payment methods' quotes together so switching
 * payment method afterward never needs another Shiprocket call.
 * ──────────────────────────────────────────────────────────── */
async function recalculateShipping(session) {
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
        const toQuote = (result) => {
            if (result.status !== "fulfilled")
                return null;
            const rate = result.value;
            return {
                courierId: rate.courierId,
                courierName: rate.courierName,
                charge: rate.totalCharge,
                chargeableWeight,
                packagingBreakdown,
                calculatedAt: Date.now(),
            };
        };
        const shippingOptions = {
            COD: toQuote(codRate),
            ONLINE: toQuote(onlineRate),
        };
        session.shippingOptions = shippingOptions;
        if (!shippingOptions.COD && !shippingOptions.ONLINE) {
            // Neither method serviceable for this pincode at all
            session.total = null;
            session.shippingError = "Delivery is not available to this pincode";
        }
        else {
            session.shippingError = null;
            // If the currently selected method isn't serviceable but the other is,
            // total stays null until the user (or frontend default) picks the serviceable one.
            const selectedQuote = session.paymentMethod ? shippingOptions[session.paymentMethod] : null;
            session.total = selectedQuote
                ? session.subtotal - session.discount + session.gstAmount + selectedQuote.charge // GST added on top of the discounted (tax-exclusive) amount
                : null;
        }
    }
    catch (err) {
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
export const createCheckoutSessionService = async (userId, selectedProductIds, buyNowItem) => {
    const redis = getRedis();
    let itemsToProcess = [];
    let source = "CART";
    console.log(buyNowItem, selectedProductIds);
    // ─── STEP 1: PARSE SOURCE (BUY NOW VS STANDARD CART) ─────────────────
    if (buyNowItem) {
        source = "BUY_NOW";
        itemsToProcess = [{ productId: buyNowItem.productId, quantity: buyNowItem.quantity }];
    }
    else {
        source = "CART";
        const cart = await Cart.findOne({ userId }).lean();
        if (!cart || !cart.items.length) {
            throw new ApiError(404, "Your shopping cart is empty");
        }
        const filteredItems = cart.items.filter((item) => selectedProductIds.includes(item.productId.toString()));
        if (!filteredItems.length) {
            throw new ApiError(400, "No valid items selected for checkout");
        }
        itemsToProcess = filteredItems.map((item) => ({
            productId: item.productId.toString(),
            quantity: item.quantity,
        }));
    }
    // ─── STEP 2: BATCH PRODUCT FETCH (AVOIDS N+1) ────────────────────────
    const productIds = itemsToProcess.map((i) => i.productId);
    const products = await Product.find({ _id: { $in: productIds } })
        .select("title price discountPrice stock thumbnail weight sku gstPercentage") // weight/sku added — needed for shipping + Shiprocket line items
        .lean();
    const productMap = new Map(products.map((p) => [p._id.toString(), p]));
    // ─── STEP 3: CONSOLIDATE SNAPSHOT, SUBTOTAL (ORIGINAL PRICE) + DISCOUNT + GST ──
    let subtotal = 0; // sum of ORIGINAL prices — what the order summary "Subtotal" row should show
    let discount = 0; // sum of item-level savings from discountPrice
    let gstAmount = 0; // 18% GST computed on (priceAtCheckout * quantity), summed — ADDED on top to reach the final bill
    const checkoutItems = [];
    for (const item of itemsToProcess) {
        const product = productMap.get(item.productId);
        if (!product) {
            throw new ApiError(404, "One or more products in your checkout do not exist");
        }
        if (product.stock < item.quantity) {
            throw new ApiError(400, `"${product.title}" is out of stock or low on inventory`);
        }
        const originalPrice = product.price;
        const priceAtCheckout = product.discountPrice ?? product.price;
        subtotal += originalPrice * item.quantity;
        discount += (originalPrice - priceAtCheckout) * item.quantity;
        gstAmount += priceAtCheckout * item.quantity * (product.gstPercentage / 100); // added on top of the tax-exclusive discounted price
        checkoutItems.push({
            productId: item.productId,
            quantity: item.quantity,
            priceAtCheckout, // actual selling price — what gets taxed and totaled
            originalPrice, // MRP — display/invoice only
            sku: product.sku ?? item.productId, // fallback to productId if the product genuinely has no SKU yet
            weight: product.weight ?? null, // stored per item so recalculation never has to re-query products
            title: product.title,
            thumbnail: product.thumbnail,
            gstPercentage: product.gstPercentage,
        });
    }
    // ─── STEP 4: AUTO-APPLY DEFAULT ADDRESS IF ONE EXISTS or take recently created ────────────────
    const defaultAddress = await Address.findOne({ userId })
        .sort({ isDefault: -1, createdAt: -1 })
        .lean();
    let deliveryAddress = null;
    let paymentMethod = null;
    if (defaultAddress) {
        deliveryAddress = {
            fullName: defaultAddress.fullName,
            mobileNumber: defaultAddress.mobileNumber,
            addressLine1: defaultAddress.addressLine1,
            addressLine2: defaultAddress?.addressLine2 || "",
            district: defaultAddress.district,
            state: defaultAddress.state,
            pincode: defaultAddress.pincode,
            country: defaultAddress.country || "India",
        };
        // Pre-select ONLINE so a Grand Total can be shown immediately without
        // waiting on a payment-method tap. User can switch to COD via the
        // PaymentMethod UI, which recalculates the total from the cached quote.
        paymentMethod = "ONLINE";
    }
    // ─── STEP 5: BUILD SESSION ────────────────────────────────────────────
    const sessionId = crypto.randomUUID();
    let sessionData = {
        userId,
        source,
        status: "INITIATED",
        items: checkoutItems,
        discount,
        subtotal,
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
export const getCheckoutSessionService = async (sessionId, userId) => {
    return readSession(sessionId, userId);
};
/* ────────────────────────────────────────────────────────────
 * PATCH: set/change delivery address
 * ──────────────────────────────────────────────────────────── */
export const updateCheckoutAddressService = async (sessionId, userId, addressId) => {
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
export const updateCheckoutPaymentMethodService = async (sessionId, userId, paymentMethod) => {
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
    session.total = session.subtotal - session.discount + session.gstAmount + quote.charge; // GST added on top of the discounted amount
    await writeSession(sessionId, session);
    return session;
};
//# sourceMappingURL=checkout.service.js.map