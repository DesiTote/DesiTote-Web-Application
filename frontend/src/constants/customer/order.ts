export const ACCENT = "#FF407D";

export const STATUS_STYLES: Record<string, { bg: string; text: string; label: string }> = {
    pending_payment: { bg: "bg-slate-100", text: "text-slate-500", label: "Pending payment" },
    payment_failed: { bg: "bg-red-50", text: "text-red-600", label: "Payment failed" },
    confirmed: { bg: "bg-blue-50", text: "text-blue-600", label: "Confirmed" },
    processing: { bg: "bg-amber-50", text: "text-amber-600", label: "Processing" },
    shipped: { bg: "bg-indigo-50", text: "text-indigo-600", label: "Shipped" },
    out_for_delivery: { bg: "bg-indigo-50", text: "text-indigo-600", label: "Out for delivery" },
    delivered: { bg: "bg-green-50", text: "text-green-600", label: "Delivered" },
    cancelled: { bg: "bg-slate-100", text: "text-slate-500", label: "Cancelled" },
    return_initiated: { bg: "bg-orange-50", text: "text-orange-600", label: "Return initiated" },
    returned: { bg: "bg-slate-100", text: "text-slate-500", label: "Returned" },
    refunded: { bg: "bg-slate-100", text: "text-slate-500", label: "Refunded" },
    failed: { bg: "bg-red-50", text: "text-red-600", label: "Failed" },
};

export const STATUS_SUBTITLES: Record<string, string> = {
    pending_payment: "We're awaiting payment confirmation to begin processing your order.",
    payment_failed: "There was an issue processing your payment. Please try again.",
    confirmed: "We've got your order and it's already being prepared for dispatch.",
    processing: "Your order is currently being packed and prepared for shipment.",
    shipped: "Your order is on its way! Track its progress using the details below.",
    out_for_delivery: "Your package is with the courier and will arrive at your doorstep today.",
    delivered: "Your package has been delivered. We hope you love your purchase!",
    cancelled: "This order has been cancelled.",
    return_initiated: "A return request has been submitted and is currently being processed.",
    returned: "This order has been returned successfully.",
    refunded: "The refund for this order has been processed.",
    failed: "There was an issue placing your order. Please contact support if needed.",
};