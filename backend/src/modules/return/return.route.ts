// ─── modules/return/return.route.ts ────────────────────────────────
import { Router } from "express";
import { getOrderReturnableItems, postCreateReturnRequest, getOrderReturns } from "./return.controller.js";
import { isAuthenticated,restrictTo } from "../../middlewares/auth.middleware.js";

const router = Router();

router.get("/:orderId/returnable-items", isAuthenticated,restrictTo("CUSTOMER"),  getOrderReturnableItems);
router.post("/:orderId/returns", isAuthenticated,restrictTo("CUSTOMER"), postCreateReturnRequest);
router.get("/:orderId/returns", isAuthenticated,restrictTo("CUSTOMER"), getOrderReturns);

export default router;

 