// ─── modules/review/review.model.ts ──────────────────────────────
import mongoose, { Schema, Document } from "mongoose";

export interface IReview extends Document {
    productId: mongoose.Types.ObjectId;
    userId: mongoose.Types.ObjectId;
    orderId: mongoose.Types.ObjectId;
    rating: number; // 1-5
    title?: string;
    comment: string;
    images: string[]; 
    isVerifiedBuyer: boolean;
    createdAt: Date;
    updatedAt: Date;
}

const ReviewSchema = new Schema<IReview>(
    {
        productId: { type: Schema.Types.ObjectId, ref: "Product", required: true, index: true },
        userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
        orderId: { type: Schema.Types.ObjectId, ref: "Order", required: true },
        rating: { type: Number, required: true, min: 1, max: 5 },
        title: { type: String, trim: true, maxlength: 100 },
        comment: { type: String, required: true, trim: true, maxlength: 1000 },
        images: { type: [String], default: [] },
        isVerifiedBuyer: { type: Boolean, default: true },
    },
    { timestamps: true }
);

// One review per user per product — matches "you already reviewed this"
// behavior on most e-commerce platforms, regardless of how many times
// they've bought it.
ReviewSchema.index({ userId: 1, productId: 1 }, { unique: true });

// For fetching a product's most recent reviews efficiently.
ReviewSchema.index({ productId: 1, createdAt: -1 });

export const Review = mongoose.model<IReview>("Review", ReviewSchema);