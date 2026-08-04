// ─── modules/dashboard/dashboard.route.ts ──────────────────────
import { Router } from "express";
import { getDashboardStats, getSalesOverview, getOrderStatusBreakdown, } from "./dashboard.controller.js";
import { isAuthenticated, restrictTo, } from "../../middlewares/auth.middleware.js";
const router = Router();
router.use(isAuthenticated, restrictTo("ADMIN"));
router.get("/stats", getDashboardStats);
router.get("/sales-overview", getSalesOverview);
router.get("/order-status", getOrderStatusBreakdown);
export default router;
// In your main routes index (wherever you mount address/auth/cart/etc.):
// import dashboardRoutes from "./modules/dashboard/dashboard.route";
//# sourceMappingURL=dashboard.route.js.map