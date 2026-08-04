// ─── types/order.types.ts ──────────────────────────────────────

export type OrderStatusBucket =
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled";

export type PaymentMethod = "COD" | "ONLINE";

export interface AdminOrderListItem {
    _id: string;
    orderNumber: string;
    customerName: string;
    billingEmail: string;
    mobileNumber: string;
    createdAt: string;
    itemsCount: number;
    grandTotal: number;
    paymentMethod: PaymentMethod;
    paymentStatus: string;
    status: string;
    statusBucket: OrderStatusBucket | null;
    awb?: string;
    courierName?: string;
    shiprocketStatus?: string;
}

export interface AdminOrderListResponse {
    orders: AdminOrderListItem[];
    pagination: {
        page: number;
        limit: number;
        total: number;
        totalPages: number;
    };
}

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

export const ALL_ORDER_STATUSES: OrderStatus[] = [
    "pending_payment",
    "payment_failed",
    "confirmed",
    "processing",
    "shipped",
    "out_for_delivery",
    "delivered",
    "cancelled",
    "return_initiated",
    "returned",
    "refunded",
    "failed",
];

export interface OrderItem {
    productId: string;
    name: string;
    sku: string;
    image: string;
    quantity: number;
    unitPrice: number;
    lineTotal: number;
}

export interface DeliveryAddress {
    fullName: string;
    mobileNumber: string;
    addressLine1: string;
    addressLine2?: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
}

export interface StatusHistoryEntry {
    status: string;
    timestamp: string;
    note?: string;
    source?: "system" | "razorpay_webhook" | "shiprocket_webhook" | "admin";
}

export interface AdminOrderDetail {
    _id: string;
    orderNumber: string;
    status: OrderStatus;
    statusBucket: OrderStatusBucket | null;
    items: OrderItem[];
    subtotal: number;
    shippingCharge: number;
    discount: number;
    gstAmount: number;
    grandTotal: number;
    currency: string;
    billingEmail: string;
    deliveryAddress: DeliveryAddress;
    payment: {
        method: PaymentMethod;
        status: string;
        razorpayOrderId?: string;
        razorpayPaymentId?: string;
        amountPaid?: number;
        paidAt?: string;
        refundStatus?: string;
        refundAmount?: string;
        refundedAt?: string;
        failureReason?: string;
    };
    shiprocket: {
        orderId?: number;
        shipmentId?: number;
        awb?: string;
        courierName?: string;
        status?: string;
        etd?: string;
        lastWebhookAt?: string;
    };
    statusHistory: StatusHistoryEntry[];
    cancelReason?: string;
    cancelledAt?: string;
    notes?: string;
    createdAt: string;
    updatedAt: string;
}

export interface AdminOrderListParams {
    page?: number;
    limit?: number;
    status?: OrderStatusBucket;
    paymentMethod?: PaymentMethod;
    dateFrom?: string;
    dateTo?: string;
    search?: string;
}