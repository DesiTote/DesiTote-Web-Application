// ─── modules/webhooks/webhook.constants.ts ──────────────────────
export const SHIPROCKET_STATUS_MAP = {
    "NEW": "processing",
    "PICKUP SCHEDULED": "processing",
    "PICKUP GENERATED": "processing",
    "PICKED UP": "shipped",
    "IN TRANSIT": "shipped",
    "SHIPPED": "shipped",
    "OUT FOR DELIVERY": "out_for_delivery",
    "DELIVERED": "delivered",
    "CANCELLED": "cancelled",
    "CANCELED": "cancelled",
    "RTO INITIATED": "return_initiated",
    "RTO IN TRANSIT": "return_initiated",
    "RTO DELIVERED": "returned",
    "UNDELIVERED": "return_initiated",
    "LOST": "failed",
};
export function mapShiprocketStatus(rawStatus) {
    if (!rawStatus)
        return null;
    const normalized = rawStatus.trim().toUpperCase();
    return SHIPROCKET_STATUS_MAP[normalized] ?? null;
}
//# sourceMappingURL=webhook.constants.js.map