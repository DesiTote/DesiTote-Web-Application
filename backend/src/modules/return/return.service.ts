import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { validateObjectId } from "../../utils/mongoIDValidator.js";
import { Counter } from "../order/counter.model.js";
import { Order } from "../order/order.model.js";
import { restoreStockForOrder } from "../order/stock.service.js";
import { RETURN_REASONS, RETURN_WINDOW_DAYS, ReturnReason } from "./return.constant.js";
import { Return, ReturnStatus } from "./return.mode.js";
import { any } from "zod";



function getDeliveredAt(order: any): Date | null {
    const deliveredEntry = [...order.statusHistory]
        .reverse()
        .find((h: any) => h.status === "delivered");
    return deliveredEntry ? new Date(deliveredEntry.timestamp) : null;
}

function getReturnWindowInfo(order: any) {
    const deliveredAt = getDeliveredAt(order);
    if (!deliveredAt) return { withinWindow: false, deliveredAt: null, daysRemaining: 0 };

    const daysSinceDelivery = (Date.now() - deliveredAt.getTime()) / (1000 * 60 * 60 * 24);
    // const withinWindow = daysSinceDelivery <= RETURN_WINDOW_DAYS;
    const withinWindow = true;
    //const daysRemaining = Math.max(0, Math.ceil(RETURN_WINDOW_DAYS - daysSinceDelivery));
    const daysRemaining = 3;
    return { withinWindow, deliveredAt, daysRemaining };
}

/* ────────────────────────────────────────────────────────────
 * What can still be returned from this order, per line item
 * ──────────────────────────────────────────────────────────── */
export async function getReturnableItems(orderId: string, userId: string) {
    validateObjectId(orderId, "orderId");
    validateObjectId(userId, "userId");

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) throw new ApiError(404, "Order not found or access denied");

    if (order.status !== "delivered") {
        return { eligible: false as const, reason: "not_delivered" as const, items: [] };
    }

    const { withinWindow, daysRemaining } = getReturnWindowInfo(order);
    if (!withinWindow) {
        return { eligible: false as const, reason: "window_expired" as const, items: [] };
    }

    // Only one return request allowed per order — see createReturnRequest.
    const existingReturn = await Return.findOne({ orderId });
    if (existingReturn) {
        return { eligible: false as const, reason: "already_requested" as const, items: [] };
    }

    const items = order.items
        .map((item: any) => {
            const remaining =
                item.quantity - (item.returnRequestedQuantity ?? 0) - (item.returnedQuantity ?? 0);
            return {
                productId: item.productId.toString(),
                name: item.name,
                image: item.image,
                orderedQuantity: item.quantity,
                remainingReturnable: Math.max(0, remaining),
            };
        })
        .filter((item) => item.remainingReturnable > 0);

    return { eligible: items.length > 0, daysRemaining, items };
}

/* ────────────────────────────────────────────────────────────
 * Create a batch return request
 * ──────────────────────────────────────────────────────────── */
export async function createReturnRequest(input: {
    orderId: string;
    userId: string;
    items: { productId: string; quantity: number; reason: ReturnReason; note?: string }[];
}) {
    const { orderId, userId, items: requestedItems } = input;

    validateObjectId(orderId, "orderId");
    validateObjectId(userId, "userId");

    if (!requestedItems || requestedItems.length === 0) {
        throw new ApiError(400, "Select at least one item to return");
    }

    for (const ri of requestedItems) {
        if (!RETURN_REASONS.includes(ri.reason)) {
            throw new ApiError(400, `Invalid return reason: "${ri.reason}"`);
        }
        if (ri.reason === "Other" && !ri.note?.trim()) {
            throw new ApiError(400, "Please add a note when selecting 'Other' as the reason");
        }
        if (!ri.quantity || ri.quantity < 1) {
            throw new ApiError(400, "Return quantity must be at least 1");
        }
    }

    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) throw new ApiError(404, "Order not found or access denied");

    if (order.status !== "delivered") {
        throw new ApiError(409, "Only delivered orders can be returned");
    }

    const existingReturn = await Return.findOne({ orderId });
    if (existingReturn) {
        throw new ApiError(
            409,
            "A return has already been requested for this order. Contact support if you need to add more items."
        );
    }

    const { withinWindow } = getReturnWindowInfo(order);
    if (!withinWindow) {
        throw new ApiError(409, `The ${RETURN_WINDOW_DAYS}-day return window for this order has expired.`);
    }

    // Validate EVERY requested item against remaining returnable qty
    // BEFORE touching anything.
    const returnItems: any[] = [];
    for (const ri of requestedItems) {
        const orderItem = order.items.find((oi: any) => oi.productId.toString() === ri.productId);
        if (!orderItem) {
            throw new ApiError(400, `Product ${ri.productId} was not part of this order`);
        }

        const remaining =
            orderItem.quantity - (orderItem.returnRequestedQuantity ?? 0) - (orderItem.returnedQuantity ?? 0);

        if (ri.quantity > remaining) {
            throw new ApiError(
                409,
                `Only ${remaining} unit(s) of "${orderItem.name}" can still be returned`
            );
        }

        returnItems.push({
            productId: orderItem.productId,
            name: orderItem.name,
            image: orderItem.image,
            quantity: ri.quantity,
            reason: ri.reason,
            note: ri.note,
        });
    }

    // ── Atomically hold the requested quantities + create the Return
    // document inside one transaction — either both happen or neither.
    const session = await mongoose.startSession();
    let createdReturn;

    try {
        await session.withTransaction(async () => {
            for (const ri of requestedItems) {
                const result = await Order.updateOne(
                    { _id: order._id, "items.productId": ri.productId },
                    { $inc: { "items.$.returnRequestedQuantity": ri.quantity } },
                    { session }
                );
                if (result.matchedCount === 0) {
                    throw new ApiError(500, "Failed to reserve return quantity — please try again");
                }
            }

            const returnNumber = await generateReturnNumber(session);

            const [doc] = await Return.create(
                [
                    {
                        returnNumber,
                        orderId: order._id,
                        orderNumber: order.orderNumber,
                        userId,
                        items: returnItems,
                        status: "requested",
                        statusHistory: [{ status: "requested", timestamp: new Date(), source: "system" }],
                    },
                ],
                { session }
            );

            createdReturn = doc;
        });
    } finally {
        await session.endSession();
    }

    return createdReturn;
}

async function generateReturnNumber(session: mongoose.ClientSession) {
    const year = new Date().getFullYear();
    const counter = await Counter.findByIdAndUpdate(
        `return-${year}`,
        { $inc: { seq: 1 } },
        { new: true, upsert: true, session }
    );
    return `RET-${year}-${String(counter.seq).padStart(6, "0")}`;
}

/* ────────────────────────────────────────────────────────────
 * Customer-facing: list return requests for an order
 * ──────────────────────────────────────────────────────────── */
export async function getReturnsForOrder(orderId: string, userId: string) {
    validateObjectId(orderId, "orderId");
    validateObjectId(userId, "userId");

    return Return.find({ orderId, userId }).sort({ createdAt: -1 }).lean();
}

/* ────────────────────────────────────────────────────────────
 * Admin: transition a return's status.
 * ──────────────────────────────────────────────────────────── */
export async function updateReturnStatus(
    returnId: string,
    newStatus: ReturnStatus,
    note: string | undefined,
    adminIdentifier: string
) {
    if (!mongoose.Types.ObjectId.isValid(returnId)) {
        throw new ApiError(400, "Invalid return ID");
    }

    const returnDoc = await Return.findById(returnId);
    if (!returnDoc) throw new ApiError(404, "Return request not found");

    const previousStatus = returnDoc.status;
    returnDoc.status = newStatus;
    returnDoc.statusHistory.push({ status: newStatus, timestamp: new Date(), note, source: "admin" });
    await returnDoc.save();

    if (newStatus === "received" && previousStatus !== "received") {
        await restoreStockForOrder(
            returnDoc.items.map((i) => ({ productId: i.productId, quantity: i.quantity, name: i.name }))
        );

        for (const item of returnDoc.items) {
            await Order.updateOne(
                { _id: returnDoc.orderId, "items.productId": item.productId },
                {
                    $inc: {
                        "items.$.returnRequestedQuantity": -item.quantity,
                        "items.$.returnedQuantity": item.quantity,
                    },
                }
            );
        }
    } else if ((newStatus === "rejected" || newStatus === "cancelled") && previousStatus === "requested") {
        for (const item of returnDoc.items) {
            await Order.updateOne(
                { _id: returnDoc.orderId, "items.productId": item.productId },
                { $inc: { "items.$.returnRequestedQuantity": -item.quantity } }
            );
        }
    }

    return returnDoc;
}