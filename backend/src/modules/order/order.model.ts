// ─── models/order.model.ts ───────────────────────────────────
import mongoose, { Schema, Document } from "mongoose";

/* ────────────────────────────────────────────────────────────
 * Sub-types
 * ──────────────────────────────────────────────────────────── */

export interface IOrderItem {
    productId: mongoose.Types.ObjectId;
    name: string;
    sku: string;
    image: string;
    quantity: number;
    unitPrice: number;
    originalPrice?: number;
    gstPercentage: number;
    lineTotal: number;
    returnRequestedQuantity: number;
    returnedQuantity: number;
}

export interface IDeliveryAddress {
    fullName: string;
    mobileNumber: string;
    addressLine1: string;
    addressLine2?: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
}

export type OrderStatus =
    | "pending_payment"   // razorpay order created, payment not completed yet
    | "payment_failed"    // payment declined / abandoned — order kept for retry
    | "confirmed"         // payment verified (ONLINE) or order accepted (COD)
    | "processing"        // shiprocket order/AWB being created
    | "shipped"
    | "out_for_delivery"
    | "delivered"
    | "cancelled"
    | "return_initiated"  // RTO triggered
    | "returned"          // RTO delivered back to seller
    | "refunded"
    | "failed";           // unrecoverable error (e.g. shiprocket order creation failed after retries)

export type PaymentMethod = "COD" | "ONLINE";
export type PaymentStatus =
    | "not_applicable"     // COD orders — nothing to collect upfront
    | "pending"
    | "authorized"
    | "paid"
    | "failed"
    | "refunded"
    | "partially_refunded";

export interface IPayment {
    method: PaymentMethod;
    status: PaymentStatus;

    // Razorpay identifiers
    razorpayOrderId?: string;      // rzp order, created before checkout widget is shown
    razorpayPaymentId?: string;    // set once payment succeeds
    razorpaySignature?: string;    // used once for HMAC verification, kept for audit

    amountPaid?: number;           // in paise, actual amount captured by Razorpay
    currency?: string;             // e.g. "INR"
    paidAt?: Date;

    // Refunds — needed for RTO on prepaid orders / cancellations
    refundId?: string;
    refundAmount?: number;
    refundStatus?: "none" | "initiated" | "processed" | "failed";
    refundedAt?: Date;

    // Failure / retry tracking
    failureReason?: string;
    attempts?: number;
    processedWebhookEventIds?: string[]; // guards against double-processing razorpay webhooks
}

export interface IShiprocketInfo {
    orderId?: number;              // sr_order_id
    shipmentId?: number;
    awb?: string;
    courierName?: string;
    status?: string;               // last known shipment_status / current_status
    etd?: Date;
    pickupScheduledDate?: Date;
    labelUrl?: string;
    manifestUrl?: string;
    rtoInitiatedAt?: Date;
    lastWebhookAt?: Date;
    scans?: {
        date: Date;
        activity: string;
        location?: string;
        statusLabel?: string;
    }[];
}

export interface IStatusHistoryEntry {
    status: string;
    timestamp: Date;
    note?: string;
    source?: "system" | "razorpay_webhook" | "shiprocket_webhook" | "admin";
}

/* ────────────────────────────────────────────────────────────
 * Order document
 * ──────────────────────────────────────────────────────────── */

export interface IOrder extends Document {
    orderNumber: string;           // human-readable, e.g. ORD-2026-00123
    sessionId: string;             // unique — idempotency key for order creation
    userId: mongoose.Types.ObjectId;

    status: OrderStatus;
    items: IOrderItem[];

    subtotal: number;
    shippingCharge: number;
    discount: number;
    gstAmount: number; // 18% GST, summed across items at (priceAtCheckout * qty)
    grandTotal: number;
    currency: string;

    billingEmail: string;

    deliveryAddress: IDeliveryAddress;
    payment: IPayment;
    shiprocket: IShiprocketInfo;
    statusHistory: IStatusHistoryEntry[];

    // The EXACT weight declared to the courier — must match what was used to
    // generate the quoted shipping charge, not recomputed later.
    packageWeight: number; // kg
    packagingBreakdown: { smallBagsCount: number; usesBigBag: boolean };

    cancelReason?: string;
    cancelledAt?: Date;
    /** Guards against giving the same units back twice if an order is moved
     *  into "cancelled" more than once. */
    stockRestored?: boolean;
    notes?: string;

    createdAt: Date;
    updatedAt: Date;
}

/* ────────────────────────────────────────────────────────────
 * Schema
 * ──────────────────────────────────────────────────────────── */

const OrderItemSchema = new Schema<IOrderItem>(
    {
        productId: { type: Schema.Types.ObjectId, required: true, ref: "Product" },
        name: { type: String, required: true },
        sku: { type: String, required: true },
        image: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        originalPrice: { type: Number, min: 0 },
        gstPercentage: { type: Number, required: true, min: 0, max: 100 },
        unitPrice: { type: Number, required: true },
        lineTotal: { type: Number, required: true },
        returnRequestedQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },
        returnedQuantity: {
            type: Number,
            default: 0,
            min: 0,
        },
    },
    { _id: false }
);

const DeliveryAddressSchema = new Schema<IDeliveryAddress>(
    {
        fullName: { type: String, required: true },
        mobileNumber: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String },
        district: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: "India" },
    },
    { _id: false }
);

const PaymentSchema = new Schema<IPayment>(
    {
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
    },
    { _id: false }
);

const ShiprocketInfoSchema = new Schema<IShiprocketInfo>(
    {
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
    },
    { _id: false }
);

const StatusHistorySchema = new Schema<IStatusHistoryEntry>(
    {
        status: { type: String, required: true },
        timestamp: { type: Date, required: true, default: Date.now },
        note: { type: String },
        source: {
            type: String,
            enum: ["system", "razorpay_webhook", "shiprocket_webhook", "admin"],
            default: "system",
        },
    },
    { _id: false }
);

const OrderSchema = new Schema<IOrder>(
    {
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
        stockRestored: { type: Boolean, default: false },
        notes: { type: String },
    },
    { timestamps: true }
);

/* ────────────────────────────────────────────────────────────
 * Indexes for common queries
 * ──────────────────────────────────────────────────────────── */

OrderSchema.index({ userId: 1, createdAt: -1 });
OrderSchema.index({ status: 1, createdAt: -1 });


export const Order = mongoose.model<IOrder>("Order", OrderSchema);