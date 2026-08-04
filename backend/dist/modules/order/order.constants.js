export const ORDER_STATUS_BUCKET_MAP = {
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
export const ORDER_STATUS_BUCKET_ORDER = [
    "Pending",
    "Processing",
    "Shipped",
    "Delivered",
    "Cancelled",
];
export const ALL_ORDER_STATUSES = Object.keys(ORDER_STATUS_BUCKET_MAP);
// Reverse lookup: given a bucket, which raw statuses does it cover?
// Used to build the Mongo `$in` filter when an admin filters the
// order list by bucket (e.g. "Shipped" -> ["shipped", "out_for_delivery"]).
export function getStatusesForBucket(bucket) {
    return Object.keys(ORDER_STATUS_BUCKET_MAP).filter((status) => ORDER_STATUS_BUCKET_MAP[status] === bucket);
}
//# sourceMappingURL=order.constants.js.map