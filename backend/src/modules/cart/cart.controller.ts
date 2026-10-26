import {
    addToCartService,
    removeFromCartService,
    updateCartItemService,
    clearCartService,
    getCartService,
} from "./cart.service.js";
import { NextFunction, Request, Response } from "express";

// ➕ ADD
export const addToCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const { productId, quantity } = req.body;
        // Only a real `true` makes it a free bag; a string like "false" must not.
        const isFreeGift = req.body.isFreeGift === true;

        const cart = await addToCartService(userId, productId, quantity, undefined, isFreeGift);

        res.status(201).json({ success: true, message: "Product added to cart", cart });
    } catch (err) {
        next(err)
    }
};

// ❌ REMOVE
export const removeFromCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const productId = req.params.productId as string

        const cart = await removeFromCartService(userId, productId, req.query.free === "1");

        res.json({ success: true, message: "Product successfully removed from cart", data: cart });
    } catch (err) {
        next(err)
    }
};

// 🔄 UPDATE
export const updateCartItem = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;
        const { quantity } = req.body;
        const productId = req.params.productId as string;

        const cart = await updateCartItemService(userId, productId, quantity, req.query.free === "1");

        res.json({ success: true, data: cart });
    } catch (err) {
        next(err)
    }
};

// 🧹 CLEAR
export const clearCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;

        const cart = await clearCartService(userId);

        res.json({ success: true, cart });
    } catch (err) {
        next(err)
    }
};

// 📦 GET
export const getCart = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const userId = req.user.userId;

        const cart = await getCartService(userId);

        res.json({ success: true, data: cart });
    } catch (err) {
        next(err)
    }
};