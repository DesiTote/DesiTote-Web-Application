import Wishlist from "./wishlist.model.js";
import { ApiError } from "../../utils/ApiError.js";
import { validateObjectId } from "../../utils/mongoIDValidator.js";
import { computeDiscountPercentage } from "../../utils/calculateDiscount.js";
/* ───────────────── TOGGLE WISHLIST ───────────────── */
export const toggleWishlistService = async (userId, productId) => {
    validateObjectId(userId, "userId");
    validateObjectId(productId, "productId");
    const existing = await Wishlist.findOne({
        userId: userId,
        productId: productId,
    });
    /* REMOVE */
    if (existing) {
        await Wishlist.deleteOne({
            _id: existing._id,
        });
        return {
            action: "removed",
            message: "Removed from wishlist",
        };
    }
    /* ADD */
    await Wishlist.create({
        userId,
        productId,
    });
    return {
        action: "added",
        message: "Added to wishlist",
    };
};
/* ───────────────── GET WISHLIST ───────────────── */
export const getWishlistService = async (userId) => {
    validateObjectId(userId, "userId");
    const wishlist = await Wishlist.find({ userId })
        .populate({
        path: "productId",
        select: "title slug thumbnail price discountPrice productCategory status",
    })
        .sort({ createdAt: -1 })
        .lean();
    // Discount % isn't a stored field — compute it the same way as everywhere else,
    // so wishlist cards show consistent numbers with the shop grid
    return wishlist.map((entry) => {
        const product = entry.productId;
        if (!product)
            return entry; // product may have been deleted since being wishlisted
        return {
            ...entry,
            productId: {
                ...product,
                discountPercentage: computeDiscountPercentage(product.price, product.discountPrice),
            },
        };
    });
};
export const getWishlistedProductIds = async (userId, productIds) => {
    if (productIds.length === 0)
        return new Set();
    const entries = await Wishlist.find({
        userId,
        productId: { $in: productIds },
    })
        .select("productId")
        .lean();
    return new Set(entries.map((e) => e.productId.toString()));
};
/* ───────────────── REMOVE ITEM ───────────────── */
export const removeWishlistService = async (userId, productId) => {
    validateObjectId(userId, "userId");
    validateObjectId(productId, "productId");
    const deleted = await Wishlist.findOneAndDelete({
        userId,
        productId,
    });
    if (!deleted) {
        throw new ApiError(404, "Wishlist item not found");
    }
    return {
        message: "Wishlist item removed",
    };
};
//# sourceMappingURL=wishlist.service.js.map