export const CANCEL_REASONS = [
    "Ordered by mistake",
    "Found a better price elsewhere",
    "Delivery is taking too long",
    "Changed my mind",
    "Other",
];
export const CANCELLABLE_STATUSES = ["confirmed", "processing"]; // NOT "shipped" or anything after it
export const CUSTOMER_STATUS_LABELS = {
    pending_payment: "Awaiting Payment",
    payment_failed: "Payment Failed",
    confirmed: "Order Confirmed",
    processing: "Preparing Your Order",
    shipped: "Shipped",
    out_for_delivery: "Out for Delivery",
    delivered: "Delivered",
    cancelled: "Cancelled",
    return_initiated: "Return in Progress",
    returned: "Returned",
    refunded: "Refunded",
    failed: "Order Failed",
};
//# sourceMappingURL=order.js.map