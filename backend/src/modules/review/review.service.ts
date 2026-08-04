// ─── modules/review/review.service.ts ─────────────────────────────
import mongoose from "mongoose";
import { ApiError } from "../../utils/ApiError.js";
import { Order } from "../order/order.model.js";
import Product from "../product/product.model.js";
import { Review } from "./review.model.js";

/* ────────────────────────────────────────────────────────────
 * Eligibility check — reused internally by createReview so the
 * server never trusts a client's claim that they're allowed to review.
 * ──────────────────────────────────────────────────────────── */
export async function checkReviewEligibility(userId: string, productId: string) {
    const existingReview = await Review.findOne({ userId, productId });
    if (existingReview) {
        return { eligible: false as const, reason: "already_reviewed" as const };
    }

    const deliveredOrder = await Order.findOne({
        userId,
        status: "delivered",
        "items.productId": productId,
    }).sort({ createdAt: -1 });

    if (!deliveredOrder) {
        return { eligible: false as const, reason: "not_delivered" as const };
    }

    return { eligible: true as const, orderId: deliveredOrder._id.toString() };
}


async function recalculateProductRating(productId: string) {
    const [stats] = await Review.aggregate([
        { $match: { productId: new mongoose.Types.ObjectId(productId) } },
        { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } },
    ]);

    await Product.findByIdAndUpdate(productId, {
        averageRating: stats ? Math.round(stats.avg * 10) / 10 : 0,
        reviewCount: stats?.count ?? 0,
    });
}

/* ────────────────────────────────────────────────────────────
 * Create a review — re-checks eligibility server-side regardless
 * of what the order-tab UI already gated on client-side.
 * ──────────────────────────────────────────────────────────── */
export async function createReview(input: {
    userId: string;
    productId: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
}) {
    if (input.rating < 1 || input.rating > 5) {
        throw new ApiError(400, "Rating must be between 1 and 5");
    }
    if (!input.comment?.trim()) {
        throw new ApiError(400, "Please write a review before submitting");
    }

    const eligibility = await checkReviewEligibility(input.userId, input.productId);

    if (!eligibility.eligible) {
        throw new ApiError(
            403,
            eligibility.reason === "already_reviewed"
                ? "You've already reviewed this product"
                : "You can only review products from orders that have been delivered"
        );
    }

    const review = await Review.create({
        productId: input.productId,
        userId: input.userId,
        orderId: eligibility.orderId,
        rating: input.rating,
        title: input.title?.trim() || undefined,
        comment: input.comment.trim(),
        images: input.images ?? [],
        isVerifiedBuyer: true,
    });

    await recalculateProductRating(input.productId);

    return review;
}

/* ────────────────────────────────────────────────────────────
 * Order-tab: which items in a delivered order can still be reviewed
 * ──────────────────────────────────────────────────────────── */
export async function getReviewableOrderItems(orderId: string, userId: string) {
    const order = await Order.findOne({ _id: orderId, userId });
    if (!order) {
        throw new ApiError(404, "Order not found or access denied");
    }
    if (order.status !== "delivered") {
        throw new ApiError(400, "Reviews are only available once an order has been delivered");
    }

    const productIds = order.items.map((i) => i.productId);
    const existingReviews = await Review.find({ userId, productId: { $in: productIds } })
        .select("productId")
        .lean();
    const reviewedSet = new Set(existingReviews.map((r) => r.productId.toString()));

    return order.items.map((item) => ({
        productId: item.productId.toString(),
        name: item.name,
        image: item.image,
        alreadyReviewed: reviewedSet.has(item.productId.toString()),
    }));
}

/* ────────────────────────────────────────────────────────────
 * Product page — top N reviews for a specific product
 * ──────────────────────────────────────────────────────────── */
export async function getProductReviews(productId: string, limit = 10) {
    const reviews = await Review.find({ productId })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("userId", "fullName")
        .lean();

    return reviews.map((r: any) => ({
        id: r._id.toString(),
        rating: r.rating,
        title: r.title ?? null,
        comment: r.comment,
        images: r.images ?? [],
        isVerifiedBuyer: r.isVerifiedBuyer,
        reviewerName: r.userId?.fullName ?? "Anonymous",
        createdAt: r.createdAt,
    }));
}

/* ────────────────────────────────────────────────────────────
 * Homepage — top N featured reviews across the whole store
 * (4+ star, most recent) for social proof
 * ──────────────────────────────────────────────────────────── */
export async function getFeaturedReviews(limit = 3) {
    const reviews = await Review.find({ rating: { $gte: 4 } })
        .sort({ createdAt: -1 })
        .limit(limit)
        .populate("userId", "fullName")
        .populate("productId", "title slug thumbnail")
        .lean();

    return reviews.map((r: any) => ({
        id: r._id.toString(),
        rating: r.rating,
        title: r.title ?? null,
        comment: r.comment,
        reviewerName: r.userId?.fullName ?? "Anonymous",
        product: {
            title: r.productId?.title ?? null,
            slug: r.productId?.slug ?? null,
            thumbnail: r.productId?.thumbnail ?? null,
        },
        createdAt: r.createdAt,
    }));
}