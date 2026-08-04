// ─── modules/review/review.route.ts ────────────────────────────────
import { Router } from "express";
import { postCreateReview, getOrderReviewableItems, getReviewsForProduct, getHomepageFeaturedReviews, } from "./review.controller.js";
import { isAuthenticated, restrictTo } from "../../middlewares/auth.middleware.js";
import { validate } from "../../middlewares/validate.middleware.js";
import { createReviewSchema } from "./review.validation.js";
const router = Router();
// Public — anyone can read reviews
router.get("/product/:productId", getReviewsForProduct); // ?limit=10
router.get("/featured", getHomepageFeaturedReviews); // ?limit=3
// Protected — must be logged in
router.post("/", isAuthenticated, restrictTo("CUSTOMER"), validate(createReviewSchema), postCreateReview);
router.get("/orders/:orderId/reviewable-items", isAuthenticated, restrictTo("CUSTOMER"), getOrderReviewableItems);
export default router;
//# sourceMappingURL=review.route.js.map