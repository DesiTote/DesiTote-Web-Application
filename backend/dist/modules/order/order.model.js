// ─── models/order.model.ts ───────────────────────────────────
import mongoose, { Schema } from "mongoose";
/* ────────────────────────────────────────────────────────────
 * Schema
 * ──────────────────────────────────────────────────────────── */
const OrderItemSchema = new Schema({
    productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
    name: { type: String, required: true },
    sku: { type: String, required: true },
    image: { type: String, required: true },
    quantity: { type: Number, required: true, min: 1 },
    originalPrice: { type: Number, min: 0 },
    gstPercentage: { type: Number, required: true, min: 0, max: 100 },
    unitPrice: { type: Number, required: true },
    lineTotal: { type: Number, required: true },
}, { _id: false });
const DeliveryAddressSchema = new Schema({
    fullName: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    addressLine1: { type: String, required: true },
    addressLine2: { type: String },
    district: { type: String, required: true },
    state: { type: String, required: true },
    pincode: { type: String, required: true },
    country: { type: String, default: "India" },
}, { _id: false });
const PaymentSchema = new Schema({
    method: { type: String, enum: ["COD", "ONLINE"], required: true },
    status: {
        type: String,
        enum: ["not_applicable", "pending", "authorized", "paid", "failed", "refunded", "partially_refunded"],
        default: "pending",
    },
    razorpayOrderId: { type: String, index: true },
    razorpayPaymentId: { type: String, index: true },
    razorpaySignature: { type: String },
    amountPaid: { type: Number },
    currency: { type: String, default: "INR" },
    paidAt: { type: Date },
    refundId: { type: String },
    refundAmount: { type: Number },
    refundStatus: { type: String, enum: ["none", "initiated", "processed", "failed"], default: "none" },
    refundedAt: { type: Date },
    failureReason: { type: String },
    attempts: { type: Number, default: 0 },
    processedWebhookEventIds: { type: [String], default: [] },
}, { _id: false });
const ShiprocketInfoSchema = new Schema({
    orderId: { type: Number },
    shipmentId: { type: Number },
    awb: { type: String, index: true },
    courierName: { type: String },
    status: { type: String },
    etd: { type: Date },
    pickupScheduledDate: { type: Date },
    labelUrl: { type: String },
    manifestUrl: { type: String },
    rtoInitiatedAt: { type: Date },
    lastWebhookAt: { type: Date },
    scans: [
        {
            date: { type: Date },
            activity: { type: String },
            location: { type: String },
            statusLabel: { type: String },
        },
    ],
}, { _id: false });
const StatusHistorySchema = new Schema({
    status: { type: String, required: true },
    timestamp: { type: Date, required: true, default: Date.now },
    note: { type: String },
    source: {
        type: String,
        enum: ["system", "razorpay_webhook", "shiprocket_webhook", "admin"],
        default: "system",
    },
}, { _id: false });
const OrderSchema = new Schema({
    orderNumber: {
        type: String,
        required: true,
        unique: true,
        index: true,
    },
    sessionId: {
        type: String,
        required: true,
        unique: true, // idempotency guard — one order per checkout session
        index: true,
    },
    userId: { type: Schema.Types.ObjectId, required: true, index: true, ref: "User" },
    status: {
        type: String,
        enum: [
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
        ],
        default: "pending_payment",
        index: true,
    },
    items: { type: [OrderItemSchema], required: true },
    subtotal: { type: Number, required: true },
    shippingCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    gstAmount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    currency: { type: String, default: "INR" },
    billingEmail: { type: String, required: true },
    deliveryAddress: { type: DeliveryAddressSchema, required: true },
    payment: { type: PaymentSchema, required: true },
    shiprocket: { type: ShiprocketInfoSchema, default: () => ({ status: "pending" }) },
    statusHistory: { type: [StatusHistorySchema], default: [] },
    packageWeight: { type: Number, required: true },
    packagingBreakdown: {
        smallBagsCount: { type: Number, required: true },
        usesBigBag: { type: Boolean, required: true },
    },
    cancelReason: { type: String },
    cancelledAt: { type: Date },
    notes: { type: String },
}, { timestamps: true });
/* ────────────────────────────────────────────────────────────
 * Indexes for common queries
 * ──────────────────────────────────────────────────────────── */
OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });
export const Order = mongoose.model("Order", OrderSchema);
//# sourceMappingURL=order.model.js.map