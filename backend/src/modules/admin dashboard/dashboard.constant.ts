import { OrderStatus } from "../order/order.model.js"; // adjust to your actual order model path/export

export type DashboardOrderBucket =
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled";

export const ORDER_STATUS_BUCKET_MAP: Record<OrderStatus, DashboardOrderBucket> = {
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

// Fixed display order + colors so the frontend donut legend order/colors
// never shift around based on which statuses happen to have data.
export const ORDER_STATUS_BUCKET_ORDER: DashboardOrderBucket[] = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
];

// Statuses that should NOT count toward "Total Revenue" — orders that
// never completed payment/fulfilment, or were reversed.
export const REVENUE_EXCLUDED_STATUSES: OrderStatus[] = [
    "pending_payment",
    "payment_failed",
    "cancelled",
    "failed",
];