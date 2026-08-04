import {
    Request,
    Response,
    NextFunction,
} from "express";

import {
    toggleWishlistService,
    getWishlistService,
    removeWishlistService,
} from "./wishlist.service.js";

export const toggleWishlistController =
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        try {

            const userId = req.user.userId;
            const productId = req.body.productId;
            const result =
                await toggleWishlistService(
                    userId,
                    productId
                );

            res.status(200).json({
                success: true,
                ...result,
            });

        } catch (error) {
            next(error);
        }
    };

export const getWishlistController =
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        try {

            const userId = req.user.userId;

            const wishlist =
                await getWishlistService(
                    userId
                );

            res.status(200).json({
                success: true,
                data: wishlist,
            });

        } catch (error) {
            next(error);
        }
    };

export const removeWishlistController =
    async (
        req: Request,
        res: Response,
        next: NextFunction
    ) => {

        try {

            const userId = req.user.userId;
            const productId = req.params.productId as string;

            const result =
                await removeWishlistService(
                    userId,
                    productId
                );

            res.status(200).json({
                success: true,
                ...result,
            });

        } catch (error) {
            next(error);
        }
    };