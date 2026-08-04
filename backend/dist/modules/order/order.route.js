// ─── route.ts ───────────────────────────────────────────────
import { Router } from "express";
import { placeOrderController, getOrderController, getRecentOrdersController, createRazorpayOrderController, verifyRazorpayPaymentController } from "./order.controller.js";
import { isAuthenticated, restrictTo } from "../../middlewares/auth.middleware.js";
import { validateCheckoutSession } from "../../middlewares/validateCheckoutSession.middleware.js";
const router = Router();
router.use(isAuthenticated, restrictTo("CUSTOMER"));
router.post("/:sessionId/place-order", validateCheckoutSession, placeOrderController);
router.get("/recent", getRecentOrdersController);
router.get("/:orderId", getOrderController);
router.post("/:sessionId/razorpay/create", validateCheckoutSession, createRazorpayOrderController);
router.post("/:orderId/razorpay/verify", verifyRazorpayPaymentController);
export default router;
//# sourceMappingURL=order.route.js.map