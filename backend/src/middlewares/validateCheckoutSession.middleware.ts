import { Request, Response, NextFunction } from "express";
import { getRedis } from "../config/redis.js";
import { ApiError } from "../utils/ApiError.js";
import { CheckoutSession } from "../types/checkout.js";

export const validateCheckoutSession = async (
    req: Request,
    res: Response,
    next: NextFunction
) => {
    try {
        const sessionId = req.params.sessionId as string;

        if (!sessionId) {
            throw new ApiError(
                400,
                "Session id is required"
            );
        }

        const redis = getRedis();

        const session:CheckoutSession | null = await redis.get(
            `checkout:${sessionId}`
        );

        if (!session) {
            throw new ApiError(
                404,
                "Checkout session expired or not found"
            );
        }

        if (session.userId !== req.user.userId) {
            throw new ApiError(
                403,
                "Unauthorized checkout session"
            );
        }

        // attach session for controller
        req.checkoutSession = session as CheckoutSession;

        next();
    } catch (err) {
        next(err);
    }
};