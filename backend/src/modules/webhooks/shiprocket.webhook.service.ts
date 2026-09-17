import { EMAIL_SUBJECTS } from "../../constants/customer/email.js";
import { sendEmail } from "../../email/email.service.js";
import { orderDeliveredEmailTemplate } from "../../email/templates/order-delivered.js";
import { ApiError } from "../../utils/ApiError.js";
import { Order } from "../order/order.model.js";
import { mapShiprocketStatus } from "./webhook.constants.js";



export function verifyShiprocketToken(receivedToken: string | undefined): boolean {
    const SHIPROCKET_WEBHOOK_TOKEN = process.env.SHIPROCKET_WEBHOOK_TOKEN as string;

    if (!SHIPROCKET_WEBHOOK_TOKEN) {
        throw new ApiError(500, "SHIPROCKET_WEBHOOK_TOKEN is not configured");
    }
    if (!receivedToken) return false;
    return receivedToken === SHIPROCKET_WEBHOOK_TOKEN;
}

export async function processShiprocketWebhookEvent(payload: any) {
    // shiprocket.orderId is a Number in the schema, so handing Mongoose a
    // non-numeric order_id throws a CastError -> 500 -> Shiprocket retries the
    // same doomed payload forever. Their "Test Webhook" button sends exactly
    // such a sample payload. Anything we cannot read as a number is treated as
    // "no order reference" and we fall through to the AWB lookup instead.
    const rawOrderId = payload.order_id ?? payload.sr_order_id;
    const parsedOrderId = Number(rawOrderId);
    const srOrderId: number | undefined =
        rawOrderId === undefined || rawOrderId === null || rawOrderId === "" || !Number.isFinite(parsedOrderId)
            ? undefined
            : parsedOrderId;
    const awb: string | undefined = payload.awb;
    const shipmentId: number | undefined = payload.shipment_id;
    const currentStatus: string | undefined = payload.current_status ?? payload.shipment_status;
    const courierName: string | undefined = payload.courier_name;
    const scans: any[] = payload.scans ?? [];

    if (!srOrderId && !awb) {
        return { handled: false, reason: "no_order_reference_in_payload" };
    }

    let order = srOrderId
        ? await Order.findOne({ "shiprocket.orderId": srOrderId })
        : null;

    if (!order && awb) {
        order = await Order.findOne({ "shiprocket.awb": awb });
    }

    if (!order) {
        return { handled: false, reason: "order_not_found", srOrderId, awb };
    }

    const mappedStatus = mapShiprocketStatus(currentStatus ?? "");

    const updateFields: Record<string, any> = {
        "shiprocket.status": currentStatus,
        "shiprocket.courierName": courierName ?? order.shiprocket.courierName,
        "shiprocket.lastWebhookAt": new Date(),
    };

    if (awb) updateFields["shiprocket.awb"] = awb;
    if (shipmentId) updateFields["shiprocket.shipmentId"] = shipmentId;

    if (scans.length > 0) {
        updateFields["shiprocket.scans"] = scans.map((s) => ({
            date: new Date(s.date),
            activity: s.activity,
            location: s.location,
            statusLabel: s["sr-status-label"] ?? s.status,
        }));
    }

    // Was this order ALREADY delivered before this webhook? Checked before
    // the update, so a resent/duplicate "DELIVERED" webhook doesn't
    // trigger a second email — only the actual pending -> delivered
    // transition does.
    const wasAlreadyDelivered = order.status === "delivered";

    let statusChanged = false;
    if (mappedStatus && mappedStatus !== order.status) {
        updateFields.status = mappedStatus;
        statusChanged = true;

        if (mappedStatus === "return_initiated" && !order.shiprocket.rtoInitiatedAt) {
            updateFields["shiprocket.rtoInitiatedAt"] = new Date();
        }
    }

    const statusHistoryEntry = {
        status: mappedStatus ?? order.status,
        timestamp: new Date(),
        note: `Shiprocket update: "${currentStatus}"${courierName ? ` via ${courierName}` : ""}`,
        source: "shiprocket_webhook",
    };

    const updated = await Order.findByIdAndUpdate(
        order._id,
        {
            $set: updateFields,
            $push: { statusHistory: statusHistoryEntry },
        },
        { new: true }
    );

    // ── Send order-delivered email — ONLY on the actual first transition
    // to "delivered", never on a duplicate/resent webhook for an order
    // that's already marked delivered. Best-effort, never blocks the
    // webhook response.
    const justDelivered = mappedStatus === "delivered" && statusChanged && !wasAlreadyDelivered;

    if (justDelivered && updated) {
        try {
          
            await sendEmail({
                to: updated.billingEmail, // the ACTUAL customer's email
                subject: EMAIL_SUBJECTS.orderDelivered,
                html: orderDeliveredEmailTemplate({
                    name:  updated.deliveryAddress?.fullName|| "there",
                    orderId: updated._id.toString(),
                    orderNumber: updated.orderNumber.toString(),
                }),
            });
             
        } catch (emailErr) {
            console.error("[order-delivered-email] failed to send", emailErr);
        }
    }

    return {
        handled: true,
        orderId: updated!._id.toString(),
        rawStatus: currentStatus,
        mappedStatus,
        statusChanged,
    };
}