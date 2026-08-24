// ─── modules/return/return.controller.ts ───────────────────────────
import { Request, Response, NextFunction } from "express";
import { ApiError } from "../../utils/ApiError.js";
import { getReturnableItems, createReturnRequest, getReturnsForOrder } from "./return.service.js";


export async function getOrderReturnableItems(req: Request, res: Response, next: NextFunction) {
    try {
        console.log("calling")
        const userId = (req as any).user?.userId ?? (req as any).user?.id;
        if (!userId) throw new ApiError(401, "Not authenticated");

        const data = await getReturnableItems(req.params.orderId as string, userId);
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

export async function postCreateReturnRequest(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = (req as any).user?.userId ?? (req as any).user?.id;
        if (!userId) throw new ApiError(401, "Not authenticated");

        const { items } = req.body as {
            items?: { productId: string; quantity: number; reason: string; note?: string }[];
        };

        if (!items || !Array.isArray(items) || items.length === 0) {
            throw new ApiError(400, "Select at least one item to return");
        }

        const data = await createReturnRequest({
            orderId: req.params.orderId as string,
            userId,
            items: items as any,
        });
        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

export async function getOrderReturns(req: Request, res: Response, next: NextFunction) {
    try {
        const userId = (req as any).user?.userId ?? (req as any).user?.id;
        if (!userId) throw new ApiError(401, "Not authenticated");

        const data = await getReturnsForOrder(req.params.orderId as string, userId);
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
}