// cart.routes.ts

import { Router } from "express";
import {
    addToCart,
    removeFromCart,
    updateCartItem,
    clearCart,
    getCart,
} from "./cart.controller.js";
import { isAuthenticated,restrictTo } from "../../middlewares/auth.middleware.js";

const router = Router();

// All cart routes require authentication + Customer role
router.use(isAuthenticated,restrictTo("CUSTOMER"));

// 📦 GET cart
router.get("/", getCart);

// ➕ ADD item to cart
router.post("/add", addToCart);

// 🔄 UPDATE item quantity
router.patch("/update-quantity/:productId", updateCartItem);

// ❌ REMOVE single item
router.delete("/remove-item/:productId", removeFromCart);

// 🧹 CLEAR entire cart
router.delete("/clear", clearCart);

export default router;