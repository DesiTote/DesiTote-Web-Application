// ─── order.service.ts ────────────────────────────────────────
import { Order } from "./order.model.js";
import { Counter } from "./counter.model.js";
import { User } from "../auth/auth.model.js"; // adjust to your actual path
import { shiprocketClient } from "../../lib/shiprocket.js";
import { getRedis } from "../../config/redis.js";
import { getRazorpayClient, getRazorpayPublicKeyId } from "../../config/razorpay.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateObjectId } from "../../utils/mongoIDValidator.js";
import { CANCELLABLE_STATUSES, CANCEL_REASONS, CUSTOMER_STATUS_LABELS } from "../../constants/customer/order.js";
import { CancelOrderInput, CreateRazorpayOrderInput, PlaceOrderInput, VerifyRazorpayPaymentInput } from "../../types/order.js";
import crypto from "crypto"
import { EMAIL_SUBJECTS } from "../../constants/customer/email.js";
import { sendEmail } from "../../email/email.service.js";
import { orderConfirmedEmailTemplate } from "../../email/templates/order-confirmed.js";
import { orderCancelledEmailTemplate } from "../../email/templates/order-cancelled.js";
import { decrementStockForOrder, restoreStockForOrder } from "./stock.service.js";

// Read at call time, not module load — see config/loadEnv.ts.
const getShiprocketPickupLocation = () => process.env.SHIPROCKET_PICKUP_LOCATION?.trim();
const DEFAULT_PACKAGE_DIMENSIONS_CM = { length: 25, breadth: 20, height: 5 };


export async function placeOrderService(input: PlaceOrderInput) {
    const { sessionId, userId, sessionData, paymentMethod } = input;

    validateObjectId(userId, "userId");

    if (paymentMethod !== "COD") {
        throw new ApiError(400, "Use the Razorpay payment flow for online orders");
    }

    if (!sessionData.deliveryAddress) {
        throw new ApiError(400, "Please select a delivery address");
    }
    if (sessionData.shippingOptions == null) {
        throw new ApiError(400, "Shipping charge is not yet calculated for this address");
    }
    const shippingQuote = sessionData.shippingOptions[paymentMethod];
    if (!shippingQuote) {
        throw new ApiError(422, `${paymentMethod === "COD" ? "Cash on Delivery" : "Online payment"} is not available for this address`);
    }

    const grandTotal = sessionData.subtotal - sessionData.discount + sessionData.gstAmount + shippingQuote.charge;

    // ── 1. Check if order already exists for this session ─────
    const existingOrder = await Order.findOne({ sessionId });

    if (existingOrder) {
        if (existingOrder.status === "confirmed") {
            // Shiprocket push already succeeded — return the same response, don't retry
            return buildResponse(existingOrder);
        }
        if (existingOrder.status === "processing") {
            // Mid-flight right now — client should poll, not re-submit
            throw new ApiError(409, "Order is already being placed, please wait");
        }
        if (existingOrder.status === "failed") {
            // Previous Shiprocket call failed — retry only that step, on the
            // same order row. Its deliveryAddress snapshot was already taken
            // at creation time, no re-fetch needed.
            return await pushToShiprocket(existingOrder, sessionId);
        }
    }

    // ── 2. Use the session's address snapshot directly ──────────
    const deliveryAddress = sessionData.deliveryAddress;

    // ── 3. Fetch user email for the Shiprocket billing payload ─
    const user = await User.findById(userId).select("email").lean();
    const billingEmail = user?.email || "orders@desitotes.com"; // fallback, never leave undefined

    // ── 4. Create order ─────────────────────────────────────────
    // Unique index on sessionId means only one insert wins if two requests race —
    // the loser gets Mongo error code 11000, handled below.
    let order;
    try {
        order = await createOrderWithRetry({
            sessionId,
            userId,
            items: sessionData.items.map((item) => ({
                productId: item.productId,
                name: item.title,
                sku: item.sku,
                image: item.thumbnail,
                quantity: item.quantity,
                unitPrice: item.priceAtCheckout, // actual price charged — drives totals/GST, matches what Shiprocket taxes
                originalPrice: item.originalPrice, // MRP — display/invoice only, never used in totals
                gstPercentage: item.gstPercentage,
                lineTotal: item.priceAtCheckout * item.quantity,
            })),
            subtotal: sessionData.subtotal,
            shippingCharge: shippingQuote.charge,
            discount: sessionData.discount,
            gstAmount: sessionData.gstAmount,
            grandTotal,
            currency: "INR",
            deliveryAddress,
            billingEmail,
            payment: {
                method: paymentMethod,
                status: paymentMethod === "COD" ? "not_applicable" : "paid",
            },
            shiprocket: { status: "pending" },
            packageWeight: shippingQuote.chargeableWeight,
            packagingBreakdown: shippingQuote.packagingBreakdown,
            status: "processing", // order row committed, Shiprocket push about to happen
            statusHistory: [{ status: "processing", timestamp: new Date(), source: "system" }],
        });
    } catch (err: any) {
        if (err.code === 11000) {
            throw new ApiError(409, "Order is already being placed, please wait");
        }
        throw new ApiError(500, "Failed to create order");
    }
    // ── 5. Push to Shiprocket ────────────────────────────────────
    return await pushToShiprocket(order, sessionId);
}

async function createOrderWithRetry(orderData: Record<string, any>, maxAttempts = 3) {
    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        const orderNumber = await generateOrderNumber();
        try {
            return await Order.create({ ...orderData, orderNumber });
        } catch (err: any) {
            const isOrderNumberCollision = err.code === 11000 && err.keyPattern?.orderNumber;
            if (isOrderNumberCollision && attempt < maxAttempts) {
                continue; // regenerate and retry
            }
            throw err;
        }
    }
    throw new ApiError(500, "Failed to generate a unique order number, please try again");
}

async function generateOrderNumber() {
    const year = new Date().getFullYear();
    const counter = await Counter.findByIdAndUpdate(
        `order-${year}`,
        { $inc: { seq: 1 } },
        { new: true, upsert: true }
    );

    const padded = String(counter.seq).padStart(6, "0");
    return `ORD-${year}-${padded}`;
}

function buildResponse(order: any) {
    return {
        orderId: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        shiprocket: order.shiprocket,
    };
}

function buildShiprocketPayload(order: any) {
    return {
        order_id: order._id.toString(),
        order_date: new Date().toISOString().slice(0, 10),
        pickup_location: getShiprocketPickupLocation(),

        billing_customer_name: order.deliveryAddress.fullName,
        billing_last_name: "",
        billing_address: order.deliveryAddress.addressLine1,
        billing_address_2: order.deliveryAddress.addressLine2,
        billing_city: order.deliveryAddress.district,
        billing_pincode: order.deliveryAddress.pincode,
        billing_state: order.deliveryAddress.state,
        billing_country: order.deliveryAddress.country,
        billing_phone: order.deliveryAddress.mobileNumber,
        billing_email: order.billingEmail,
        shipping_is_billing: true,

        // Shiprocket expects "COD" or "Prepaid" specifically — not "ONLINE"
        payment_method: order.payment.method === "COD" ? "COD" : "Prepaid",
        sub_total: order.subtotal + order.gstAmount,
        total_discount: order.discount,
        shipping_charges: order.shippingCharge,
        length: DEFAULT_PACKAGE_DIMENSIONS_CM.length,
        breadth: DEFAULT_PACKAGE_DIMENSIONS_CM.breadth,
        height: DEFAULT_PACKAGE_DIMENSIONS_CM.height,
        weight: order.packageWeight,

        order_items: order.items.map((item: any) => ({
            name: item.name,
            sku: item.sku,
            units: item.quantity,
            selling_price: Number((item.unitPrice * (1 + item.gstPercentage / 100)).toFixed(2)),
            discount: "",
            tax: String(item.gstPercentage),
            hsn: "",
        })),
    };
}

export async function getOrderService(orderId: string, userId: string) {
    validateObjectId(orderId, "orderId");
    validateObjectId(userId, "userId");

    const order = await Order.findOne({ _id: orderId, userId });

    if (!order) {
        throw new ApiError(404, "Order not found or access denied.");
    }

    const trackingTimeline = (order.shiprocket?.scans ?? [])
        .map((scan) => ({
            date: scan.date,
            activity: scan.activity,
            location: scan.location ?? null,
        }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

    const hasShipment = Boolean(order.shiprocket?.awb);

    return {
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        statusLabel: CUSTOMER_STATUS_LABELS[order.status] ?? order.status,
        paymentMethod: order.payment.method,
        subtotal: order.subtotal,
        discount: order.discount,
        gstAmount: order.gstAmount,
        shippingCharges: order.shippingCharge || 0,
        total: order.grandTotal,
        createdAt: order.createdAt,
        items: order.items.map((item) => ({
            productId: item.productId,
            name: item.name,
            sku: item.sku,
            quantity: item.quantity,
            image: item.image,
            price: item.unitPrice,
        })),
        shippingAddress: order.deliveryAddress,

        // ── Tracking info — only meaningful once a shipment exists ──
        tracking: hasShipment
            ? {
                awb: order.shiprocket.awb,
                courierName: order.shiprocket.courierName ?? null,
                estimatedDelivery: order.shiprocket.etd ?? null,
                lastUpdatedAt: order.shiprocket.lastWebhookAt ?? null,
                // Secondary/fallback link — verify Shiprocket's current
                // public tracking URL format before relying on this.
                externalTrackingUrl: `https://shiprocket.co/tracking/${order.shiprocket.awb}`,
                timeline: trackingTimeline,
            }
            : null,
    };
}

function isOrderCancellable(status: string): boolean {
    return CANCELLABLE_STATUSES.includes(status);
}

export async function getRecentOrdersService(userId: string, limit = 10) {
    validateObjectId(userId, "userId");

    const orders = await Order.find({ userId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .select("orderNumber status payment.method grandTotal items createdAt shiprocket.awb shiprocket.courierName")
        .lean();

    return orders.map((order: any) => ({
        id: order._id,
        orderNumber: order.orderNumber,
        status: order.status,
        paymentMethod: order.payment?.method,
        total: order.grandTotal,
        createdAt: order.createdAt,
        itemCount: order.items?.length ?? 0,
        firstItemName: order.items?.[0]?.name ?? null,
        firstItemImage: order.items?.[0]?.image ?? null,
        awb: order.shiprocket?.awb ?? null,
        courierName: order.shiprocket?.courierName ?? null,
        canCancel: isOrderCancellable(order.status),
    }));
}

export async function cancelOrderService(input: CancelOrderInput) {
    const { orderId, userId, reason, note } = input;

    validateObjectId(orderId, "orderId");
    validateObjectId(userId, "userId");

    if (!CANCEL_REASONS.includes(reason as any)) {
        throw new ApiError(400, "Invalid cancellation reason");
    }
    if (reason === "Other" && !note?.trim()) {
        throw new ApiError(400, "Please tell us a bit more so we can improve");
    }

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
        throw new ApiError(404, "Order not found or access denied.");
    }

    if (order.status === "cancelled") {
        // Already cancelled — idempotent response rather than an error, in
        // case of a double-click or a retried request.
        return buildResponse(order);
    }

    if (!isOrderCancellable(order.status)) {
        throw new ApiError(
            409,
            order.status === "shipped" ||
                order.status === "out_for_delivery" ||
                order.status === "delivered"
                ? "This order has already shipped and can no longer be cancelled. You can request a return instead."
                : "This order can't be cancelled right now."
        );
    }

    // Cancel with the courier if a Shiprocket order was actually created.
    // Best-effort — if Shiprocket's cancel call fails (e.g. it JUST shipped
    // in the last few seconds), we still record the cancellation on our side
    // and flag it, rather than blocking the customer's cancel request.
    let shiprocketCancelError: string | null = null;
    if (order.shiprocket?.orderId) {
        try {
            await shiprocketClient.cancelOrder(order.shiprocket.orderId);
        } catch (err: any) {
            shiprocketCancelError = err?.message || "Shiprocket cancellation failed";
        }
    }

    // ONLINE orders that were already paid need a refund. The actual Razorpay
    // refund call isn't wired up yet (see Razorpay webhook/payment flow) —
    // this marks intent so a background job / support flow can pick it up.
    const needsRefund = order.payment.method === "ONLINE" && order.payment.status === "paid";

    const updated = await Order.findByIdAndUpdate(
        order._id,
        {
            status: "cancelled",
            cancelReason: reason === "Other" ? note : reason,
            cancelledAt: new Date(),
            ...(needsRefund
                ? { "payment.refundStatus": "initiated" } // TODO: trigger actual Razorpay refund here
                : {}),
            ...(shiprocketCancelError
                ? { "shiprocket.status": `cancel_failed: ${shiprocketCancelError}` }
                : order.shiprocket?.orderId
                    ? { "shiprocket.status": "cancelled" }
                    : {}),
            $push: {
                statusHistory: {
                    status: "cancelled",
                    timestamp: new Date(),
                    note: reason === "Other" ? note : reason,
                    source: "system",
                },
            },
        },
        { new: true }
    );

    // Same two gaps the admin path had: the units the order took were never
    // given back, and the customer was told nothing. stockRestored is what
    // stops a retried cancel handing the same units out twice.
    if (updated && !updated.stockRestored) {
        await restoreStockForOrder(
            updated.items.map((item) => ({
                productId: item.productId,
                quantity: item.quantity,
                name: item.name || "item",
            }))
        );
        updated.stockRestored = true;
        await updated.save();
    }

    if (updated?.billingEmail) {
        // Best effort: the order is cancelled and the stock is back by now.
        try {
            await sendEmail({
                to: updated.billingEmail,
                subject: EMAIL_SUBJECTS.orderCancelled,
                html: orderCancelledEmailTemplate({
                    name: updated.deliveryAddress?.fullName || "there",
                    orderNumber: updated.orderNumber.toString(),
                    paymentMethod: updated.payment?.method,
                }),
            });
        } catch (err) {
            console.error(`[order] cancellation email failed for ${updated.orderNumber}`, err);
        }
    }

    return {
        ...buildResponse(updated),
        refundInitiated: needsRefund,
    };
}

export async function createRazorpayOrderService(input: CreateRazorpayOrderInput) {
    const { sessionId, userId, sessionData } = input;

    validateObjectId(userId, "userId");

    if (!sessionData.deliveryAddress) {
        throw new ApiError(400, "Please select a delivery address");
    }
    if (sessionData.shippingOptions == null) {
        throw new ApiError(400, "Shipping charge is not yet calculated for this address");
    }
    const shippingQuote = sessionData.shippingOptions.ONLINE;
    if (!shippingQuote) {
        throw new ApiError(422, "Online payment is not available for this address");
    }

    const grandTotal = sessionData.subtotal - sessionData.discount + sessionData.gstAmount + shippingQuote.charge;

    // ── Idempotency: same session, different possible prior states ──
    const existingOrder = await Order.findOne({ sessionId });

    const RAZORPAY_PUBLIC_KEY_ID = getRazorpayPublicKeyId();
    const razorpayClient = getRazorpayClient();

    if (existingOrder) {
        if (existingOrder.status === "confirmed") {
            throw new ApiError(409, "This order has already been placed");
        }
        if (existingOrder.payment.status === "paid") {
            // Verified already (maybe the webhook beat the client callback to it) —
            // nothing left to pay, the confirm step just hasn't finished yet.
            throw new ApiError(409, "Payment already received for this order, please wait");
        }
        if (existingOrder.payment.razorpayOrderId && existingOrder.status === "pending_payment") {
            // User refreshed/reopened Checkout before paying — reuse the same
            // Razorpay order instead of creating a new one for the same cart.
            return {
                orderId: existingOrder._id,
                razorpayOrderId: existingOrder.payment.razorpayOrderId,
                keyId: RAZORPAY_PUBLIC_KEY_ID,
                amount: Math.round(grandTotal * 100),
                currency: "INR",
            };
        }
        // status === "payment_failed" (or similar) falls through to retry below,
        // reusing the same Mongo order row via a fresh Razorpay order attempt.
    }

    const deliveryAddress = existingOrder?.deliveryAddress ?? sessionData.deliveryAddress;
    const user = await User.findById(userId).select("email").lean();
    const billingEmail = existingOrder?.billingEmail ?? user?.email ?? "orders@desitotes.com";

    // ── Create the Razorpay order first — if this fails, we haven't
    // committed anything to our own DB yet for a fresh attempt.
    let razorpayOrder;
    try {
        razorpayOrder = await razorpayClient.orders.create({
            amount: Math.round(grandTotal * 100), // paise
            currency: "INR",
            receipt: sessionId,
            notes: { sessionId, userId },
        });
    } catch (err: any) {
        throw new ApiError(502, "Unable to initiate payment, please try again");
    }

    let order;
    if (existingOrder) {
        // Retry after a previous failed attempt — same order row, new Razorpay order
        order = await Order.findByIdAndUpdate(
            existingOrder._id,
            {
                status: "pending_payment",
                "payment.razorpayOrderId": razorpayOrder.id,
                "payment.status": "pending",
                "payment.attempts": (existingOrder.payment.attempts || 0) + 1,
                $push: {
                    statusHistory: { status: "pending_payment", timestamp: new Date(), source: "system" },
                },
            },
            { new: true }
        );
    } else {
        try {
            order = await createOrderWithRetry({
                sessionId,
                userId,
                items: sessionData.items.map((item) => ({
                    productId: item.productId,
                    name: item.title,
                    sku: item.sku,
                    image: item.thumbnail,
                    quantity: item.quantity,
                    unitPrice: item.priceAtCheckout,
                    gstPercentage: item.gstPercentage,
                    originalPrice: item.originalPrice,
                    lineTotal: item.priceAtCheckout * item.quantity,
                })),
                subtotal: sessionData.subtotal,
                shippingCharge: shippingQuote.charge,
                discount: sessionData.discount,
                gstAmount: sessionData.gstAmount,
                grandTotal,
                currency: "INR",
                deliveryAddress,
                billingEmail,
                payment: {
                    method: "ONLINE",
                    status: "pending",
                    razorpayOrderId: razorpayOrder.id,
                    attempts: 1,
                },
                shiprocket: { status: "pending" },
                packageWeight: shippingQuote.chargeableWeight,
                packagingBreakdown: shippingQuote.packagingBreakdown,
                status: "pending_payment",
                statusHistory: [{ status: "pending_payment", timestamp: new Date(), source: "system" }],
            });
        } catch (err: any) {
            if (err.code === 11000) {
                throw new ApiError(409, "Order is already being placed, please wait");
            }
            throw new ApiError(500, "Failed to create order");
        }
    }

    return {
        orderId: order?._id,
        razorpayOrderId: razorpayOrder.id,
        keyId: RAZORPAY_PUBLIC_KEY_ID,
        amount: Math.round(grandTotal * 100),
        currency: "INR",
    };
}

export async function verifyRazorpayPaymentService(input: VerifyRazorpayPaymentInput) {
    const { orderId, userId, razorpayOrderId, razorpayPaymentId, razorpaySignature } = input;

    validateObjectId(orderId, "orderId");
    validateObjectId(userId, "userId");

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
        throw new ApiError(404, "Order not found or access denied.");
    }

    // Idempotent: webhook and client callback can both arrive for the same
    // payment — if it's already verified/confirmed, just return the result.
    if (order.payment.status === "paid") {
        return buildResponse(order);
    }

    if (order.payment.razorpayOrderId !== razorpayOrderId) {
        throw new ApiError(400, "This payment does not match the order it was made for");
    }

    const isValid = verifyRazorpaySignature(razorpayOrderId, razorpayPaymentId, razorpaySignature);

    if (!isValid) {
        await Order.findByIdAndUpdate(order._id, {
            status: "payment_failed",
            "payment.status": "failed",
            "payment.failureReason": "Signature verification failed",
            $push: {
                statusHistory: {
                    status: "payment_failed",
                    timestamp: new Date(),
                    note: "Signature verification failed",
                    source: "system",
                },
            },
        });
        throw new ApiError(400, "Payment verification failed. If money was deducted, it will be refunded automatically.");
    }

    const paidOrder = await Order.findByIdAndUpdate(
        order._id,
        {
            "payment.status": "paid",
            "payment.razorpayPaymentId": razorpayPaymentId,
            "payment.razorpaySignature": razorpaySignature,
            "payment.paidAt": new Date(),
            $push: {
                statusHistory: { status: "confirmed", timestamp: new Date(), note: "Payment verified", source: "system" },
            },
        },
        { new: true }
    );

    return await pushToShiprocket(paidOrder, order.sessionId);
}

function verifyRazorpaySignature(razorpayOrderId: string, razorpayPaymentId: string, signature: string): boolean {
    const secret = process.env.RAZORPAY_KEY_SECRET as string;
    const expected = crypto
        .createHmac("sha256", secret)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

    // Constant-time comparison — avoids leaking info via response-time
    // differences on a byte-by-byte string compare.
    const expectedBuf = Buffer.from(expected);
    const actualBuf = Buffer.from(signature);
    if (expectedBuf.length !== actualBuf.length) return false;
    return crypto.timingSafeEqual(expectedBuf, actualBuf);
}

export async function pushToShiprocket(order: any, sessionId: string) {
    const claimed = await Order.findOneAndUpdate(
        { _id: order._id, "shiprocket.status": { $in: ["pending", "failed"] } },
        { "shiprocket.status": "pushing" },
        { new: true }
    );
    if (!claimed) {
        const current = await Order.findById(order._id);
        return buildResponse(current);
    }

    order = claimed;

    // ── Decrement stock BEFORE calling Shiprocket ──────────────────
    // If any item lacks stock, this throws and we never create a
    // shipment for stock we don't have. Order is marked failed so the
    // customer sees a clear error rather than a silent hang.
    try {
        await decrementStockForOrder(
            order.items.map((item: any) => ({
                productId: item.productId,
                quantity: item.quantity,
                name: item.name,
            }))
        );
    } catch (stockErr: any) {
        await Order.findByIdAndUpdate(order._id, {
            status: "failed",
            "shiprocket.status": "failed",
            "shiprocket.error": stockErr?.message || "Insufficient stock",
            $push: {
                statusHistory: {
                    status: "failed",
                    timestamp: new Date(),
                    note: stockErr?.message,
                    source: "system",
                },
            },
        });
        throw stockErr;
    }

    try {
        const payload = buildShiprocketPayload(order);
        const srResponse = await shiprocketClient.createOrder(payload);

        const updated = await Order.findByIdAndUpdate(
            order._id,
            {
                status: "confirmed",
                "shiprocket.status": "created",
                "shiprocket.orderId": srResponse.order_id,
                "shiprocket.shipmentId": srResponse.shipment_id,
                $push: {
                    statusHistory: { status: "confirmed", timestamp: new Date(), source: "system" },
                },
            },
            { new: true }
        );

        // Everything below is best-effort. By this point payment is taken, stock
        // is decremented and the shipment exists — letting a failed email or a
        // Redis blip throw would mark a good order "failed", and the retry path
        // would create a duplicate shipment and decrement stock a second time.
        try {
            await getRedis().del(`checkout:${sessionId}`);
        } catch (err) {
            console.error(`[order] could not clear checkout session ${sessionId}`, err);
        }

        try {
            await sendEmail({
                to: updated!.billingEmail,
                subject: EMAIL_SUBJECTS.orderConfirmed,
                html: orderConfirmedEmailTemplate({
                    name: updated!.deliveryAddress?.fullName || "there",
                    orderId: updated!._id.toString(),
                    orderNumber: updated!.orderNumber.toString(),
                }),
            });
        } catch (err) {
            console.error(`[order] confirmation email failed for ${updated!.orderNumber}`, err);
        }

        return buildResponse(updated);
    } catch (err: any) {
        await Order.findByIdAndUpdate(order._id, {
            status: "failed",
            "shiprocket.status": "failed",
            "shiprocket.error": err?.message || "Shiprocket error",
            $push: {
                statusHistory: {
                    status: "failed",
                    timestamp: new Date(),
                    note: err?.message,
                    source: "system",
                },
            },
        });

        throw new ApiError(502, "Failed to create shipment, please try again");
    }
}