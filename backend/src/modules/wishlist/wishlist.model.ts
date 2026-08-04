import mongoose, { Document, Schema } from "mongoose";

export interface IWishlist extends Document {
    userId: mongoose.Types.ObjectId;
    productId: mongoose.Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
}

const wishlistSchema = new Schema<IWishlist>(
    {
        userId: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },

        productId: {
            type: Schema.Types.ObjectId,
            ref:"Product",
            required: true,
        },
    },
    {
        timestamps: true,
    }
);

wishlistSchema.index(
    { userId: 1, productId: 1 },
    { unique: true }
);

const Wishlist = mongoose.model<IWishlist>(
    "Wishlist",
    wishlistSchema
);

export default Wishlist;