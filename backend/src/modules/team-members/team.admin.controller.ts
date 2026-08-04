// ─── modules/auth/team-admin.controller.ts ───────────────────────
import { Request, Response, NextFunction } from "express";
import { fetchTeamMembers, createTeamMember } from "./team.admin.service.js";
import { ApiError } from "../../utils/ApiError.js";

const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&]).+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/; // adjust if you support non-Indian numbers

export async function getTeamMembers(req: Request, res: Response, next: NextFunction) {
    try {
        const data = await fetchTeamMembers();
        res.status(200).json({ success: true, data });
    } catch (error) {
        next(error);
    }
}

export async function postCreateTeamMember(req: Request, res: Response, next: NextFunction) {
    try {
        const { fullName, email, mobileNumber, password } = req.body as {
            fullName: string;
            email: string;
            mobileNumber: string;
            password: string;
        };

        
        const createdByAdminId = req.user.userId;
        if (!createdByAdminId) {
            throw new ApiError(401, "Could not determine the logged-in admin");
        }

        const data = await createTeamMember({ fullName, email, mobileNumber, password, createdByAdminId });
        res.status(201).json({ success: true, data });
    } catch (error) {
        next(error);
    }
}