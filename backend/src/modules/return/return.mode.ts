// ─── modules/return/return.model.ts ────────────────────────────────
import mongoose, { Schema, Document } from "mongoose";

export type ReturnStatus =
    | "requested"    // customer submitted, awaiting review
    | "approved"     // admin approved, pickup to be arranged
    | "rejected"     // admin rejected — releases the quantity hold, no restock
    | "picked_up"    // courier collected the item(s)
    | "received"     // item(s) physically back — triggers restock
    | "refunded"     // refund issued
    | "cancelled";   // customer withdrew the request before pickup

export interface IReturnItem {
    productId: mongoose.Types.ObjectId;
    name: string;
    image: string;
    quantity: number;
    reason: string;
    note?: string;
}

export interface IReturnStatusHistoryEntry {
    status: ReturnStatus;
    timestamp: Date;
    note?: string;
    source: "system" | "admin";
}

export interface IReturn extends Document {
    returnNumber: string;
    orderId: mongoose.Types.ObjectId;
    orderNumber: string;
    userId: mongoose.Types.ObjectId;

    items: IReturnItem[];
    status: ReturnStatus;
    statusHistory: IReturnStatusHistoryEntry[];

    refundAmount?: number;
    refundStatus?: "none" | "initiated" | "processed" | "failed";

    createdAt: Date;
    updatedAt: Date;
}

const ReturnItemSchema = new Schema<IReturnItem>(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true },
        name: { type: String, required: true },
        image: { type: String, required: true },
        quantity: { type: Number, required: true, min: 1 },
        reason: { type: String, required: true },
        note: { type: String },
    },
    { _id: false }
);

const ReturnStatusHistorySchema = new Schema<IReturnStatusHistoryEntry>(
    {
        status: { type: String, required: true },
        timestamp: { type: Date, required: true, default: Date.now },
        note: { type: String },
        source: { type: String, enum: ["system", "admin"], default: "system" },
    },
    { _id: false }
);

const ReturnSchema = new Schema<IReturn>(
    {
        returnNumber: { type: String, required: true, unique: true, index: true },
        orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true, index: true },
        orderNumber: { type: String, required: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true, index: true },

        items: { type: [ReturnItemSchema], required: true },

        status: {
            type: String,
            enum: ["requested", "approved", "rejected", "picked_up", "received", "refunded", "cancelled"],
            default: "requested",
            index: true,
        },
        statusHistory: { type: [ReturnStatusHistorySchema], default: [] },

        refundAmount: { type: Number },
        refundStatus: { type: String, enum: ["none", "initiated", "processed", "failed"], default: "none" },
    },
    { timestamps: true }
);

ReturnSchema.index({ orderId: 1, createdAt: -1 });

export const Return = mongoose.model<IReturn>("Return", ReturnSchema);