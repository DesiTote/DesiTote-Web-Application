import { NextFunction, Request, Response } from "express";
import { fetchStorefrontBestsellers, getPublicProductBySlugService, getPublicProductsService } from "./product.public.service.js";
import { getWishlistedProductIds } from "../wishlist/wishlist.service.js";


export const getPublicProducts = async (req: Request, res: Response, next: NextFunction) => {
    try {
        const result = await getPublicProductsService(req.query as any);

        // Guest — req.user was never set by optionalAuth, skip the wishlist join entirely
        if (!req.user) {
            const products = result.products.map((p) => ({ ...p, isWishlisted: false }));
            return res
                .status(200)
                .json({ success: true, message: "Products fetched successfully", data: { ...result, products } });
        }

        const productIds = result.products.map((p) => p._id.toString());
        const wishlistedSet = await getWishlistedProductIds(req.user.userId, productIds);

        const products = result.products.map((p) => ({
            ...p,
            isWishlisted: wishlistedSet.has(p._id.toString()),
        }));

        return res
            .status(200)
            .json({ success: true, message: "Products fetched successfully", data: { ...result, products } });
    } catch (error) {
        next(error)
    }
};


export const getPublicProductBySlug = async (req: Request, res: Response) => {
    const slug = req.params.slug as string;
    const product = await getPublicProductBySlugService(slug);

    if (!req.user) {
        return res
            .status(200)
            .json({ success: true, data: { ...product, isWishlisted: false }, message: "Product fetched successfully" });
    }

    const wishlistedSet = await getWishlistedProductIds(req.user.userId, [product._id.toString()]);
    return res.status(200).json({
        success: true, data:
            { ...product, isWishlisted: wishlistedSet.has(product._id.toString()) },
        message: "Product fetched successfully"
    })
        ;
};

export async function getBestsellers(req: Request, res: Response, next: NextFunction) {
    try {

        const limit = req.query.limit ? Math.min(20, Number(req.query.limit)) : 4;
        const data = await fetchStorefrontBestsellers(limit);
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
}