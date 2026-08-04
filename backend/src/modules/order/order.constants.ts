

import { OrderStatus } from "./order.model.js";

export type OrderStatusBucket =
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled";

export const ORDER_STATUS_BUCKET_MAP: Record<OrderStatus, OrderStatusBucket> = {
    pending_payment: "Pending",
    confirmed: "Pending",

    processing: "Processing",

    shipped: "Shipped",
    out_for_delivery: "Shipped",

    delivered: "Delivered",

    cancelled: "Cancelled",
    payment_failed: "Cancelled",
    failed: "Cancelled",
    return_initiated: "Cancelled",
    returned: "Cancelled",
    refunded: "Cancelled",
};

export const ORDER_STATUS_BUCKET_ORDER: OrderStatusBucket[] = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
];

export const ALL_ORDER_STATUSES: OrderStatus[] = Object.keys(ORDER_STATUS_BUCKET_MAP) as OrderStatus[];

// Reverse lookup: given a bucket, which raw statuses does it cover?
// Used to build the Mongo `$in` filter when an admin filters the
// order list by bucket (e.g. "Shipped" -> ["shipped", "out_for_delivery"]).
export function getStatusesForBucket(bucket: OrderStatusBucket): OrderStatus[] {
    return (Object.keys(ORDER_STATUS_BUCKET_MAP) as OrderStatus[]).filter(
        (status) => ORDER_STATUS_BUCKET_MAP[status] === bucket
    );
}