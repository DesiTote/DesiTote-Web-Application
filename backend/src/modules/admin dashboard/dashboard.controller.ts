// ─── modules/dashboard/dashboard.controller.ts ─────────────────
import { NextFunction, Request, Response } from "express";
import {
    fetchDashboardStats,
    fetchSalesOverview,
    fetchOrderStatusBreakdown,
} from "./dashboard.service.js";

export async function getDashboardStats(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await fetchDashboardStats();
        return res.status(200).json({ success: true, data });
    } catch (err: any) {
        next(err)
    }
}

export async function getSalesOverview(req: Request, res: Response, next: NextFunction) {
    try {
        const range = (req.query.range as string) === "month" ? "month" : "week";
        const data = await fetchSalesOverview(range);
        return res.status(200).json({ success: true, data });
    } catch (err: any) {
        next(err)
    }
}

export async function getOrderStatusBreakdown(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await fetchOrderStatusBreakdown();
        return res.status(200).json({ success: true, data });
    } catch (err: any) {
        next(err)
    }
}