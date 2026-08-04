// ─── modules/order/order-admin.controller.ts ───────────────────
import { NextFunction, Request, Response } from "express";
import { fetchAdminOrderList, AdminOrderListQuery, fetchAdminOrderById, updateOrderStatusManually } from "./order.admin.service.js";
import { ALL_ORDER_STATUSES, OrderStatusBucket } from "./order.constants.js";
import { OrderStatus, PaymentMethod } from "./order.model.js";
import { ApiError } from "../../utils/ApiError.js";

export async function getAdminOrderList(req: Request, res: Response, next: NextFunction) {
    try {
        const query: AdminOrderListQuery = {
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
            status: req.query.status as OrderStatusBucket | undefined,
            paymentMethod: req.query.paymentMethod as PaymentMethod | undefined,
            dateFrom: req.query.dateFrom as string | undefined,
            dateTo: req.query.dateTo as string | undefined,
            search: req.query.search as string | undefined,
        };

        const result = await fetchAdminOrderList(query);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

export async function getAdminOrderById(req: Request, res: Response, next: NextFunction) {
    try {
        const order = await fetchAdminOrderById(req.params.orderId as string);
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
}

export async function updateAdminOrderStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const { status, note } = req.body as { status?: OrderStatus; note?: string };

        if (!status) {
            throw new ApiError(400, "'status' is required");
        }

        // Adjust to however your project identifies the logged-in admin
        // (e.g. req.user.email, req.user.fullName, req.admin.id, etc.)
        const adminIdentifier = (req as any).user?.email ?? (req as any).user?._id ?? "admin";

        const order = await updateOrderStatusManually(req.params.orderId as string, status, note, adminIdentifier);
        res.status(200).json({ success: true, data: order });
    } catch (error) {
        next(error);
    }
}