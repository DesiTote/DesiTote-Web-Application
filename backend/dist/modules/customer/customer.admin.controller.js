import { fetchAdminCustomerList, setCustomerBlockedStatus, } from "./customer.admin.service.js";
import { ApiError } from "../../utils/ApiError.js";
export async function getAdminCustomerList(req, res, next) {
    try {
        const query = {
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
            search: req.query.search,
            role: req.query.role,
            blocked: req.query.blocked === "true" ? true : req.query.blocked === "false" ? false : undefined,
        };
        const result = await fetchAdminCustomerList(query);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
export async function updateCustomerBlockedStatus(req, res, next) {
    try {
        const { blocked } = req.body;
        if (typeof blocked !== "boolean") {
            throw new ApiError(400, "'blocked' must be true or false");
        }
        const user = await setCustomerBlockedStatus(req.params.userId, blocked);
        res.status(200).json({ success: true, data: user });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=customer.admin.controller.js.map