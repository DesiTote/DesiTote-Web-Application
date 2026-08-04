// ─── modules/auth/customer-admin.route.ts ───────────────────────
import { Router } from "express";
import { getAdminCustomerList, updateCustomerBlockedStatus } from "./customer.admin.controller.js";
import { isAuthenticated, restrictTo } from "../../middlewares/auth.middleware.js";

const router = Router();

router.use(isAuthenticated, restrictTo("ADMIN"));

router.get("/", getAdminCustomerList);
router.patch("/:userId/block-status", updateCustomerBlockedStatus);

export default router;
