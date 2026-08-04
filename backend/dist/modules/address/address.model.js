// address.model.ts
import mongoose, { Schema } from "mongoose";
const addressSchema = new Schema({
    userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        index: true,
    },
    fullName: {
        type: String,
        minlength: [3, "Name must be atleast 3 characters"],
        maxlength: [30, "Name can not exceed 30 characters"],
        required: true,
        trim: true,
    },
    mobileNumber: {
        type: String,
        minlength: [10, "Mobilenumber must be exactly 10 characters"],
        maxlength: [10, "Mobilenumber must be exactly 10 characters"],
        required: true,
    },
    pincode: {
        type: String,
        minlength: [6, "Pincode must be exactly 6 characters"],
        maxlength: [6, "Pincode must be exactly 6 characters"],
        required: true,
    },
    district: {
        type: String,
        required: true,
    },
    state: {
        type: String,
        required: true,
    },
    addressLine1: {
        type: String,
        minlength: [5, "AddressLine1 must be atleast 5 characters"],
        maxlength: [100, "AddressLine1can not exceed 100 characters"],
        required: true,
        trim: true,
    },
    addressLine2: {
        type: String,
        maxlength: [100, "AddressLine2 can not exceed 100 characters"],
        validate: {
            validator: function (v) {
                // Only validate length if a value actually exists and isn't just empty spaces
                return v === undefined || v === null || v.trim() === "" || v.trim().length >= 5;
            },
            message: "AddressLine2 must be at least 5 characters"
        },
        trim: true // It's a good idea to trim optional fields too!
    },
    landmark: {
        type: String,
        maxlength: [100, "Landmark can not exceed 100 characters"],
        validate: {
            validator: function (v) {
                return v === undefined || v === null || v.trim() === "" || v.trim().length >= 3;
            },
            message: "Landmark must be at least 3 characters"
        },
        trim: true
    },
    country: {
        type: String,
        default: "India"
    },
    isDefault: {
        type: Boolean,
        default: false,
    },
}, {
    timestamps: true,
});
addressSchema.index({ userId: 1, isDefault: -1, createdAt: -1 });
export const Address = mongoose.model("Address", addressSchema);
//# sourceMappingURL=address.model.js.map