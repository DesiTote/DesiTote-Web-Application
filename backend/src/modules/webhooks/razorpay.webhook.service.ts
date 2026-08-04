// ─── modules/webhooks/razorpay.webhook.service.ts ────────────────
import crypto from "crypto";
import { ApiError } from "../../utils/ApiError.js";
import { Order } from "../order/order.model.js";
import { pushToShiprocket } from "../order/order.service.js";


export function verifyRazorpaySignature(rawBody: string, signatureHeader: string | undefined): boolean {
    const RAZORPAY_WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET as string;
    if (!signatureHeader) return false;
    if (!RAZORPAY_WEBHOOK_SECRET) {
        throw new ApiError(500, "RAZORPAY_WEBHOOK_SECRET is not configured");
    }

    const expectedSignature = crypto
        .createHmac("sha256", RAZORPAY_WEBHOOK_SECRET)
        .update(rawBody)
        .digest("hex");

    // Timing-safe comparison — prevents timing attacks that could be used
    // to guess the correct signature byte-by-byte.
    const expectedBuffer = Buffer.from(expectedSignature, "utf8");
    const receivedBuffer = Buffer.from(signatureHeader, "utf8");

    if (expectedBuffer.length !== receivedBuffer.length) return false;
    return crypto.timingSafeEqual(expectedBuffer, receivedBuffer);
}

/* ────────────────────────────────────────────────────────────
 * STEP 2–5 — Process the verified event
 * ──────────────────────────────────────────────────────────── */
export async function processRazorpayWebhookEvent(payload: any) {
    const eventId: string = payload.id; // Razorpay's unique event id, e.g. "evt_..."
    const eventType: string = payload.event; // e.g. "payment.captured"

    // Razorpay's payload shape nests the actual entity under
    // payload.payload.payment.entity / payload.payload.order.entity /
    // payload.payload.refund.entity depending on event type.
    const paymentEntity = payload.payload?.payment?.entity;
    const refundEntity = payload.payload?.refund?.entity;

    const razorpayOrderId: string | undefined = paymentEntity?.order_id ?? refundEntity?.notes?.razorpayOrderId;

    if (!razorpayOrderId) {
        // Nothing we can look up an order by — acknowledge so Razorpay
        // doesn't keep retrying an event that will never resolve.
        return { handled: false, reason: "no_order_reference" };
    }

    const order = await Order.findOne({ "payment.razorpayOrderId": razorpayOrderId });
    if (!order) {
        return { handled: false, reason: "order_not_found" };
    }

    // ── STEP 2: Idempotency guard ─────────────────────────────
    // Razorpay retries webhooks on any non-2xx response, and can also
    // occasionally send true duplicates. processedWebhookEventIds
    // already exists on your schema for exactly this purpose.
    if (order.payment.processedWebhookEventIds?.includes(eventId)) {
        return { handled: true, duplicate: true };
    }

    // ── STEP 3–4: Apply the event ─────────────────────────────
    switch (eventType) {
        case "payment.captured": {
            order.payment.status = "paid";
            order.payment.razorpayPaymentId = paymentEntity.id;
            order.payment.amountPaid = paymentEntity.amount; // paise
            order.payment.currency = paymentEntity.currency;
            order.payment.paidAt = new Date();

            // NOTE: deliberately NOT setting order.status = "confirmed" or
            // pushing a "confirmed" statusHistory entry here — that
            // transition belongs to pushToShiprocket() below (the same
            // shared function your client-side verifyRazorpayPaymentService
            // uses), including its atomic claim against double-pushing to
            // Shiprocket. Doing it here too would race/duplicate that.
            order.statusHistory.push({
                status: order.status, // unchanged for now — pushToShiprocket flips it on success
                timestamp: new Date(),
                note: `Payment captured via Razorpay webhook (${paymentEntity.id})`,
                source: "razorpay_webhook",
            });

            order.payment.processedWebhookEventIds = [
                ...(order.payment.processedWebhookEventIds ?? []),
                eventId,
            ];
            await order.save();

            // Push to Shiprocket using the SAME shared function your normal
            // checkout flow uses. Its atomic claim on shiprocket.status means
            // if the client-side callback already pushed this order (or is
            // mid-push right now), this call safely no-ops instead of
            // creating a duplicate Shiprocket order.
            try {
                await pushToShiprocket(order, order.sessionId);
            } catch (err) {
                // pushToShiprocket already recorded the failure on the order
                // itself (status: "failed", shiprocket.status: "failed").
                // Don't let this bubble up into a 5xx response to Razorpay —
                // the PAYMENT half of this event succeeded; only the
                // shipment push failed, which needs a separate retry (e.g.
                // an admin "retry shipment" action), not a Razorpay webhook
                // redelivery of an event that already did its job.
                console.error(
                    "[razorpay-webhook] pushToShiprocket failed after payment.captured",
                    err
                );
            }

            return { handled: true, orderId: order._id.toString(), eventType };
        }

        case "payment.failed": {
            order.payment.status = "failed";
            order.payment.failureReason = paymentEntity?.error_description ?? "Payment failed";

            if (order.status === "pending_payment") {
                order.status = "payment_failed";
            }

            order.statusHistory.push({
                status: "payment_failed",
                timestamp: new Date(),
                note: order.payment.failureReason,
                source: "razorpay_webhook",
            });
            break;
        }

        case "refund.processed": {
            order.payment.refundStatus = "processed";
            order.payment.refundId = refundEntity.id;
            order.payment.refundAmount = refundEntity.amount;
            order.payment.refundedAt = new Date();

            order.statusHistory.push({
                status: order.status, // refund doesn't necessarily change order status
                timestamp: new Date(),
                note: `Refund processed via Razorpay (${refundEntity.id})`,
                source: "razorpay_webhook",
            });
            break;
        }

        case "refund.failed": {
            order.payment.refundStatus = "failed";
            order.statusHistory.push({
                status: order.status,
                timestamp: new Date(),
                note: "Refund attempt failed — needs manual follow-up",
                source: "razorpay_webhook",
            });
            break;
        }

        default: {
            // Unrecognized event type — acknowledge without changing anything.
            // Still record that we saw it, so a resend doesn't reprocess it
            // once you DO add a handler for this event type later — actually
            // that's a trade-off; see note below.
            return { handled: false, reason: "unhandled_event_type", eventType };
        }
    }

    // ── STEP 5: Record this event as processed ────────────────
    order.payment.processedWebhookEventIds = [...(order.payment.processedWebhookEventIds ?? []), eventId];

    await order.save();

    return { handled: true, orderId: order._id.toString(), eventType };
}