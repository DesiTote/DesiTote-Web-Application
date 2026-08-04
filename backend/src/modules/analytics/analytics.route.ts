import { Router } from "express";
import {
    getRevenueTrend,
    getAverageOrderValue,
    getBestSellingProducts,
    getNewSignupsTrend,
    getMostWishlistedProducts,
} from "./analytics.controller.js";
 
import { isAuthenticated,restrictTo } from "../../middlewares/auth.middleware.js";
 
const router = Router();
 
router.use(isAuthenticated, restrictTo("ADMIN"));
 
router.get("/revenue-trend", getRevenueTrend);       
router.get("/aov", getAverageOrderValue);
router.get("/best-selling-products", getBestSellingProducts); 
router.get("/new-signups", getNewSignupsTrend);
router.get("/most-wishlisted-products", getMostWishlistedProducts);
 
export default router;
 
