// ─── modules/order/order-admin.route.ts ────────────────────────
import { Router } from "express";
import { getAdminOrderById, getAdminOrderList, updateAdminOrderStatus } from "./order.admin.controller.js";
import { isAuthenticated, restrictTo } from "../../middlewares/auth.middleware.js";
const router = Router();
router.use(isAuthenticated, restrictTo("ADMIN"));
router.get("/", getAdminOrderList);
router.get("/:orderId", getAdminOrderById);
router.patch("/:orderId/status", updateAdminOrderStatus);
export default router;
//# sourceMappingURL=order.admin.route.js.map