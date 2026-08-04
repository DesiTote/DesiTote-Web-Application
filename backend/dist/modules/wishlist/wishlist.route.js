import express from "express";
import { toggleWishlistController, getWishlistController, removeWishlistController, } from "./wishlist.controller.js";
import { isAuthenticated, restrictTo, } from "../../middlewares/auth.middleware.js";
const router = express.Router();
router.use(isAuthenticated, restrictTo("CUSTOMER"));
router.get("/", getWishlistController);
//add zod validation
router.post("/toggle", toggleWishlistController);
//add zod validation
router.delete("/:productId", removeWishlistController);
export default router;
//# sourceMappingURL=wishlist.route.js.map