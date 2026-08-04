import mongoose, { Schema } from "mongoose";
const cartItemSchema = new Schema({
    productId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Product",
        required: true,
    },
    quantity: {
        type: Number,
        required: true,
        default: 1,
        min: [1, "Quantity must be at least 1"],
        max: [15, "Quantity cannot exceed 15"],
    },
    priceAtAdd: {
        type: Number,
        required: false,
    },
}, { _id: false });
const cartSchema = new Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
        index: true,
    },
    items: {
        type: [cartItemSchema],
        default: [],
        validate: {
            validator: (items) => items.length <= 50,
            message: "Cart cannot contain more than 50 distinct items",
        },
    },
}, {
    timestamps: true,
    toJSON: { versionKey: false },
    toObject: { versionKey: false },
});
// Corrected index field name from 'user' to 'userId'
cartSchema.index({ userId: 1, "items.productId": 1 });
export default mongoose.model("Cart", cartSchema);
//# sourceMappingURL=cart.model.js.map