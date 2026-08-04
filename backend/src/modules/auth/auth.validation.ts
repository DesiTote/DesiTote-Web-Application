import { z } from "zod";

export const registerSchema = z.object({
    fullName: z
        .string()
        .min(3, "Name must be at least 3 characters")
        .regex(/^[A-Za-z\s]+$/, "Name should only contain letters"),
    email: z
        .email()
        .transform((val) => val.toLowerCase().trim()),
    mobileNumber: z
        .string()
        .regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),
    password: z.string().regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/,
        "Password must include uppercase, lowercase, number, and special character and atleast contain 6 character."
    )
});

export const loginSchema = z.object({
    email: z
        .email()
        .transform((val) => val.toLowerCase().trim()),
    password: z.string().min(6),
});

export const verifyOtpSchema = z.object({
    email: z
        .email()
        .transform((val) => val.toLowerCase().trim()),
    otp: z.string().length(6),
    type: z.string().trim()
});

export const forgotPasswordSchema = z.object({
    email: z
        .email()
        .transform((val) => val.toLowerCase().trim()),
    password: z.string().regex(
        /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z\d]).{6,}$/,
        "Password must include uppercase, lowercase, number, and special character and atleast contain 6 character."
    ),
});

export const changePasswordSchema = z
    .object({
        currentPassword: z.string().min(1, "Current password is required"),
        password: z
            .string()
            .min(6, "Min 6 characters, with uppercase, lowercase, a number & a special character (@#$!%*?&)")
            .regex(
                /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&]).+$/,
                "Min 6 characters, with uppercase, lowercase, a number & a special character (@#$!%*?&)"
            ),
    })
    .refine((data) => data.currentPassword !== data.password, {
        message: "New password must be different from current password",
        path: ["password"],
    });