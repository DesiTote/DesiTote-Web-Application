export type User = {
   _id: string;
  fullName: string;
  email: string;
  role: "CUSTOMER" | "ADMIN";
  emailVerified: boolean;
};

export interface ForgotPasswordPayload {
  email: string;
  otp: string;
  password: string;
}
