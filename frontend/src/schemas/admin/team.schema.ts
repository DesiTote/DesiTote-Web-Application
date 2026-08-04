// ─── schemas/admin/team.schema.ts ────────────────────────────────
import { z } from "zod";

export const createTeamMemberSchema = z
    .object({
        fullName: z
            .string()
            .min(3, "Name must be at least 3 characters")
            .regex(/^[A-Za-z\s]+$/, "Name should only contain letters"),
        email: z.email("Enter a valid email address"),
        mobileNumber: z
            .string()
            .regex(/^[6-9]\d{9}$/, "Enter valid 10-digit mobile number"),
        password: z
            .string()
            .min(6, "Password must contain atleast 6 character")
            .regex(/[A-Z]/, "Must contain uppercase")
            .regex(/[a-z]/, "Must contain lowercase")
            .regex(/[0-9]/, "Must contain number")
            .regex(/[@$!%*?&#]/, "Must contain at least one special character (@#$...)"),
        confirmPassword: z.string().min(6, "Please confirm the password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });

export const adminResetPasswordSchema = z
    .object({
        password: z.string().min(8, "Password must be at least 8 characters"),
        confirmPassword: z.string().min(6, "Please confirm the password"),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });