// ─── modules/review/review.controller.ts ──────────────────────────
import { Request, Response, NextFunction } from "express";
import {
    createReview,
    getReviewableOrderItems,
    getProductReviews,
    getFeaturedReviews,
} from "./review.service.js";
import { ApiError } from "../../utils/ApiError.js";

export async function postCreateReview(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = req.user.userId as string;
        if (!userId) throw new ApiError(401, "Not authenticated");
        const { productId, rating, title, comment, images } = req.body as {
            productId?: string;
            rating?: number;
            title?: string;
            comment?: string;
            images?: string[];
        };

        if (!productId || rating === undefined || !comment) {
            throw new ApiError(400, "productId, rating, and comment are required");
        }

        const review = await createReview({ userId, productId, rating, title, comment, images });
        res.status(201).json({ success: true, data: review });
    } catch (error) {
        next(error);
    }
}

export async function getOrderReviewableItems(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = (req as any).user?.userId ?? (req as any).user?.id;
        if (!userId) throw new ApiError(401, "Not authenticated");

        const data = await getReviewableOrderItems(req.params.orderId as string, userId);
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

export async function getReviewsForProduct(req: Request, res: Response, next: NextFunction) {
    try {
        const limit = req.query.limit ? Math.min(10, Number(req.query.limit)) : 10;
        const data = await getProductReviews(req.params.productId as string, limit);
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

export async function getHomepageFeaturedReviews(req: Request, res: Response, next: NextFunction) {
    try {
        const limit = req.query.limit ? Math.min(3, Number(req.query.limit)) : 3;
        const data = await getFeaturedReviews(limit);
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
}