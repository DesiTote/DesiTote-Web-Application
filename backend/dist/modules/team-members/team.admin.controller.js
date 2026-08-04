import { fetchTeamMembers, createTeamMember } from "./team.admin.service.js";
import { ApiError } from "../../utils/ApiError.js";
const PASSWORD_COMPLEXITY_REGEX = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@#$!%*?&]).+$/;
const MOBILE_REGEX = /^[6-9]\d{9}$/; // adjust if you support non-Indian numbers
export async function getTeamMembers(req, res, next) {
    try {
        const data = await fetchTeamMembers();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
export async function postCreateTeamMember(req, res, next) {
    try {
        const { fullName, email, mobileNumber, password } = req.body;
        const createdByAdminId = req.user.userId;
        if (!createdByAdminId) {
            throw new ApiError(401, "Could not determine the logged-in admin");
        }
        const data = await createTeamMember({ fullName, email, mobileNumber, password, createdByAdminId });
        res.status(201).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=team.admin.controller.js.map