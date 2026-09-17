import express from "express";
import * as controller from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import {
  registerSchema,
  loginSchema,
  verifyOtpSchema,
  forgotPasswordSchema,
  changePasswordSchema,
} from "./auth.validation.js";

import {
  isAuthenticated,
  restrictTo,
} from "../../middlewares/auth.middleware.js";
import { optionalAuth } from "../../middlewares/optionalAuth.js";
import { rateLimit } from "../../middlewares/rateLimit.middleware.js";

const router = express.Router();

/* ================= PER-IP RATE LIMITS ================= */
// Generous ceilings — a real visitor never approaches these. They exist to
// stop one machine cycling through emails or hammering an endpoint, on top of
// the per-email caps the OTP and login services already enforce.
const otpLimiter = rateLimit({ name: "auth-otp", limit: 8, windowSeconds: 600 });      // OTP / forgot-password
const loginLimiter = rateLimit({ name: "auth-login", limit: 20, windowSeconds: 600 });  // password attempts
const registerLimiter = rateLimit({ name: "auth-register", limit: 12, windowSeconds: 600 });

/* ================= PUBLIC ROUTES ================= */
router.post("/register", registerLimiter, validate(registerSchema), controller.register);
router.post("/send-otp", otpLimiter, controller.sendOTP)
router.post("/verify-otp", otpLimiter, validate(verifyOtpSchema), optionalAuth, controller.verify);
router.post("/login", loginLimiter, validate(loginSchema), controller.login);
router.post("/verify-2fa", otpLimiter, validate(verifyOtpSchema), controller.verify2FA);
router.post("/forgot-password", otpLimiter, validate(forgotPasswordSchema), controller.forgotPasswordController)

/* ================= PROTECTED ROUTES ================= */

// Get current logged-in user
router.get("/profile", isAuthenticated, controller.getProfile);
router.patch("/change-password", isAuthenticated, validate(changePasswordSchema), controller.changePasswordController);


router.post(
  "/logout",
  isAuthenticated,
  controller.logOutUserController
);

// Example: Only Admin can access
router.get(
  "/admin-only",
  isAuthenticated,
  restrictTo("ADMIN"),
  controller.adminOnly
);

export default router;