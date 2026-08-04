import mongoose, { Schema, Document, Mongoose } from "mongoose";

export enum UserRole {
    ADMIN = "ADMIN",
    CUSTOMER = "CUSTOMER",
}

export interface IUser extends Document {
    fullName: string;
    email: string;
    password: string;
    mobileNumber:string;
    role: UserRole;
    emailVerified: boolean;
    mobileVerified: boolean
    twoFactorEnabled: boolean;
    isAccountBlocked:boolean;
    createdBy:mongoose.Types.ObjectId;
}

const userSchema = new Schema<IUser>(
    {
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
    },
    { timestamps: true }
);

export const User = mongoose.model<IUser>("User", userSchema);