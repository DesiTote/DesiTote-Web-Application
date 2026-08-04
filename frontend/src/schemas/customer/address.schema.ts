import { z } from "zod";

export const createAddressSchema = z.object({
    fullName: z
        .string()
        .trim()
        .min(3, { message: "Full name must be at least 3 characters" })
        .max(30, { message: "Full name cannot exceed 30 characters" }),

    mobileNumber: z
        .string()
        .regex(/^[6-9]\d{9}$/, "Invalid mobile number"), // Quick syntax for regex strings

    pincode: z
        .string()
        .regex(/^\d{6}$/, "Invalid pincode"),

    addressLine1: z
        .string()
        .trim()
        .min(5, { message: "Street address must be at least 5 characters" })
        .max(100, { message: "Address is too long" }),

    addressLine2: z
        .string()
        .trim()
        .min(5, "Flat/Floor details must be at least 5 characters")
        .max(100)
        .optional()
        .or(z.literal("")), // Allows the field to be empty without failing .min()

    landmark: z
        .string()
        .trim()
        .min(3, "Landmark must be at least 3 characters")
        .max(100)
        .optional()
        .or(z.literal("")),

    isDefault: z.boolean(),
});

export type CreateAddressInput =
    z.infer<typeof createAddressSchema>;