import { createReview, getReviewableOrderItems, getProductReviews, getFeaturedReviews, } from "./review.service.js";
import { ApiError } from "../../utils/ApiError.js";
export async function postCreateReview(req, res, next) {
    try {
        const userId = req.user.userId;
        if (!userId)
            throw new ApiError(401, "Not authenticated");
        const { productId, rating, title, comment, images } = req.body;
        if (!productId || rating === undefined || !comment) {
            throw new ApiError(400, "productId, rating, and comment are required");
        }
        const review = await createReview({ userId, productId, rating, title, comment, images });
        res.status(201).json({ success: true, data: review });
    }
    catch (error) {
        next(error);
    }
}
export async function getOrderReviewableItems(req, res, next) {
    try {
        const userId = req.user?.userId ?? req.user?.id;
        if (!userId)
            throw new ApiError(401, "Not authenticated");
        const data = await getReviewableOrderItems(req.params.orderId, userId);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
export async function getReviewsForProduct(req, res, next) {
    try {
        const limit = req.query.limit ? Math.min(10, Number(req.query.limit)) : 10;
        const data = await getProductReviews(req.params.productId, limit);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
export async function getHomepageFeaturedReviews(req, res, next) {
    try {
        const limit = req.query.limit ? Math.min(3, Number(req.query.limit)) : 3;
        const data = await getFeaturedReviews(limit);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=review.controller.js.map