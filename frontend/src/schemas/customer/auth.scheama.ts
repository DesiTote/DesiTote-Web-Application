import { z } from "zod";

export const registerSchema = z.object({
  fullName: z
    .string()
    .min(3, "Name must be at least 3 characters")
    .regex(/^[A-Za-z\s]+$/, "Name should only contain letters"),

  email: z.email().transform((val) => val.toLowerCase().trim()),

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
});

export const loginSchema = z.object({
  email: z.email().transform((val) => val.toLowerCase().trim()),
  password: z
    .string()
    .min(6, "Password must contain atleast 6 character")
})

export const otpProp = z.object({
  email: z.email().transform((val) => val.toLowerCase().trim()),
  type: z
    .string().trim()
    .min(1, "Type must contain 1 character"),
  otp: z
    .string()
    .trim()
    .length(6, "OTP must be exactly 6 digits")
    .optional(),
})

export const emailSchema = z.object({
  email: z.email().transform((val) => val.toLowerCase().trim()),
});

export const otpSchema = z.object({
  otp: z
    .string()
    .min(6, "Enter the 6-digit code")
    .max(6, "Enter the 6-digit code")
    .regex(/^\d{6}$/, "Code must be numeric"),
});

export const resetSchema = z
  .object({
    password: z
      .string()
      .min(6, "Password must contain atleast 6 character")
      .regex(/[A-Z]/, "Must contain uppercase")
      .regex(/[a-z]/, "Must contain lowercase")
      .regex(/[0-9]/, "Must contain number")
      .regex(/[@$!%*?&#]/, "Must contain at least one special character (@#$...)"),
    confirmPassword: z.string().min(1, "Please confirm your password"),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  });

// schemas/customer/auth.schema.ts
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
    confirmPassword: z.string(),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: "Passwords do not match",
    path: ["confirmPassword"],
  })
  .refine((data) => data.currentPassword !== data.password, {
    message: "New password must be different from current password",
    path: ["password"],
  });