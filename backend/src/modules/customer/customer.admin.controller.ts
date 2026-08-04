// ─── modules/auth/customer-admin.controller.ts ──────────────────
import { NextFunction, Request, Response } from "express";
import {
    fetchAdminCustomerList,
    setCustomerBlockedStatus,
} from "./customer.admin.service.js";
import { UserRole } from "../auth/auth.model.js";
import { AdminCustomerListQuery } from "./customer.type.js";
import { ApiError } from "../../utils/ApiError.js";

export async function getAdminCustomerList(req: Request, res: Response, next: NextFunction) {
    try {
        const query: AdminCustomerListQuery = {
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
            search: req.query.search as string | undefined,
            role: req.query.role as UserRole | undefined,
            blocked:
                req.query.blocked === "true" ? true : req.query.blocked === "false" ? false : undefined,
        };

        const result = await fetchAdminCustomerList(query);
        res.status(200).json({ success: true, data: result });
    } catch (error) {
        next(error);
    }
}

export async function updateCustomerBlockedStatus(req: Request, res: Response, next: NextFunction) {
    try {
        const { blocked } = req.body as { blocked?: boolean };

        if (typeof blocked !== "boolean") {
            throw new ApiError(400, "'blocked' must be true or false");
        }

        const user = await setCustomerBlockedStatus(req.params.userId as string, blocked);
        res.status(200).json({ success: true, data: user });
    } catch (error) {
        next(error);
    }
}