import mongoose, { Schema } from "mongoose";
export var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "ADMIN";
    UserRole["CUSTOMER"] = "CUSTOMER";
})(UserRole || (UserRole = {}));
const userSchema = new Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    mobileNumber: { type: String, required: true },
    role: {
        type: String,
        enum: Object.values(UserRole),
        default: UserRole.CUSTOMER,
    },
    emailVerified: { type: Boolean, default: false },
    mobileVerified: { type: Boolean, default: false },
    twoFactorEnabled: { type: Boolean, default: false },
    isAccountBlocked: { type: Boolean, default: false },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", default: null },
}, { timestamps: true });
export const User = mongoose.model("User", userSchema);
//# sourceMappingURL=auth.model.js.map