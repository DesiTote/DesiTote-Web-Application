import { api } from "@/lib/axios";
import { z } from "zod";
import { loginSchema, otpProp, registerSchema } from "@/schemas/customer/auth.scheama";
import { ForgotPasswordPayload } from "@/types/auth.types";

type RegisterFormData = z.infer<typeof registerSchema>;
type LoginFormData = z.infer<typeof loginSchema>;

type OtpRequestData = z.infer<typeof otpProp>

export const registerUser = (data: RegisterFormData) => {
  return api.post("/auth/register", data);
};

export const loginUser = (data: LoginFormData) => {
  return api.post("/auth/login", data);
};
export const logOutUser = () => {
  return api.post("/auth/logout");
}
// 🔹 Send OTP
export const sendOtp = ({ email, type }: OtpRequestData) => {
  return api.post("/auth/send-otp", { email, type });
};

// 🔹 Verify OTP
export const verifyOtp = (data: { email: string; otp: string,type:string }) => {
  return api.post("/auth/verify-otp", data);
};

// Fetch user

export const getMe = async () => {
  const res = await api.get("/auth/profile");
  return res.data.user; // ✅ only return user
}

export const forgotPasswordService = (payload: ForgotPasswordPayload) => {
  return api.post("/auth/forgot-password", payload);
};

export const changePasswordService = (payload: { currentPassword: string; password: string }) => {
  return api.patch("/auth/change-password", payload);
};