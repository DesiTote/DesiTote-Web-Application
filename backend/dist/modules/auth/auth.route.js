import express from "express";
import * as controller from "./auth.controller.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { registerSchema, loginSchema, verifyOtpSchema, forgotPasswordSchema, changePasswordSchema, } from "./auth.validation.js";
import { isAuthenticated, restrictTo, } from "../../middlewares/auth.middleware.js";
import { optionalAuth } from "../../middlewares/optionalAuth.js";
const router = express.Router();
/* ================= PUBLIC ROUTES ================= */
router.post("/register", validate(registerSchema), controller.register);
router.post("/send-otp", controller.sendOTP);
router.post("/verify-otp", validate(verifyOtpSchema), optionalAuth, controller.verify);
router.post("/login", validate(loginSchema), controller.login);
router.post("/verify-2fa", validate(verifyOtpSchema), controller.verify2FA);
router.post("/forgot-password", validate(forgotPasswordSchema), controller.forgotPasswordController);
/* ================= PROTECTED ROUTES ================= */
// Get current logged-in user
router.get("/profile", isAuthenticated, controller.getProfile);
router.patch("/change-password", isAuthenticated, validate(changePasswordSchema), controller.changePasswordController);
router.post("/logout", isAuthenticated, controller.logOutUserController);
// Example: Only Admin can access
router.get("/admin-only", isAuthenticated, restrictTo("ADMIN"), controller.adminOnly);
export default router;
//# sourceMappingURL=auth.route.js.map