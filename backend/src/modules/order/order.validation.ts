// ─── order.validation.ts ────────────────────────────────────────
import { z } from "zod";
import { CANCEL_REASONS } from "../../constants/customer/order.js";

export const PlaceOrderSchema = z.object({
    paymentMethod: z.enum(["COD", "ONLINE"], {
        error: () => "paymentMethod must be COD or ONLINE",
    }),
});

export const VerifyRazorpayPaymentSchema = z.object({
    razorpayOrderId: z.string().min(1, "razorpayOrderId is required"),
    razorpayPaymentId: z.string().min(1, "razorpayPaymentId is required"),
    razorpaySignature: z.string().min(1, "razorpaySignature is required"),
});

export const CancelOrderSchema = z
    .object({
        reason: z.enum(CANCEL_REASONS, {
            error: () => "Please select a valid cancellation reason",
        }),
        note: z.string().trim().max(500).optional(),
    })
    .refine((data) => data.reason !== "Other" || !!data.note?.trim(), {
        message: "Please tell us a bit more so we can improve",
        path: ["note"],
    });