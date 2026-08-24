// ─── types/return.types.ts ─────────────────────────────────────────
export const RETURN_REASONS = [
    "Defective or damaged product",
    "Wrong item received",
    "Size or fit issue",
    "Quality not as expected",
    "Changed my mind",
    "Other",
] as const;

export type ReturnReason = (typeof RETURN_REASONS)[number];

export type ReturnStatus =
    | "requested"
    | "approved"
    | "rejected"
    | "picked_up"
    | "received"
    | "refunded"
    | "cancelled";

export interface ReturnableItem {
    productId: string;
    name: string;
    image: string;
    orderedQuantity: number;
    remainingReturnable: number;
}

export interface ReturnableItemsResponse {
    eligible: boolean;
    reason?: "not_delivered" | "window_expired";
    daysRemaining?: number;
    items: ReturnableItem[];
}

export interface ReturnRequestItemInput {
    productId: string;
    quantity: number;
    reason: ReturnReason;
    note?: string;
}

export interface ReturnItem {
    productId: string;
    name: string;
    image: string;
    quantity: number;
    reason: string;
    note?: string;
}

export interface ReturnStatusHistoryEntry {
    status: ReturnStatus;
    timestamp: string;
    note?: string;
    source: "system" | "admin";
}

export interface ReturnRequest {
    _id: string;
    returnNumber: string;
    orderId: string;
    orderNumber: string;
    items: ReturnItem[];
    status: ReturnStatus;
    statusHistory: ReturnStatusHistoryEntry[];
    createdAt: string;
}

export const RETURN_STATUS_LABELS: Record<ReturnStatus, string> = {
    requested: "Requested",
    approved: "Approved",
    rejected: "Rejected",
    picked_up: "Picked Up",
    received: "Received",
    refunded: "Refunded",
    cancelled: "Cancelled",
};