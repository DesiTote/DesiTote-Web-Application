export interface PlaceOrderPayload {
    sessionId: string;
    paymentMethod: "COD" | "ONLINE";
}

export interface PlaceOrderResponse {
    success: boolean;
    message: string;
    data: {
        orderId: string;
        status: string;
        shiprocket: Record<string, any>;
    };
}

// ─── types/customer/order.type.ts ──────────────────────────────

export type OrderStatus =
    | "pending_payment"
    | "payment_failed"
    | "confirmed"
    | "processing"
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "return_initiated"
    | "returned"
    | "refunded"
    | "failed";

export interface RecentOrder {
    id: string;
    orderNumber: string;
    status: OrderStatus;
    paymentMethod: "COD" | "ONLINE";
    total: number;
    createdAt: string;
    itemCount: number;
    firstItemName: string | null;
    firstItemImage: string | null;
    awb: string | null;
    courierName: string | null;
    canCancel: boolean; // computed server-side — single source of truth
}

export const CANCEL_REASONS = [
    "Ordered by mistake",
    "Found a better price elsewhere",
    "Delivery is taking too long",
    "Changed my mind",
    "Other",
] as const;

export type CancelReason = (typeof CANCEL_REASONS)[number];

export interface CancelOrderPayload {
    orderId: string;
    reason: CancelReason;
    note?: string;
}