import { fetchAdminOrderList, fetchAdminOrderById, updateOrderStatusManually } from "./order.admin.service.js";
import { ApiError } from "../../utils/ApiError.js";
export async function getAdminOrderList(req, res, next) {
    try {
        const query = {
            page: req.query.page ? Number(req.query.page) : undefined,
            limit: req.query.limit ? Number(req.query.limit) : undefined,
            status: req.query.status,
            paymentMethod: req.query.paymentMethod,
            dateFrom: req.query.dateFrom,
            dateTo: req.query.dateTo,
            search: req.query.search,
        };
        const result = await fetchAdminOrderList(query);
        res.status(200).json({ success: true, data: result });
    }
    catch (error) {
        next(error);
    }
}
export async function getAdminOrderById(req, res, next) {
    try {
        const order = await fetchAdminOrderById(req.params.orderId);
        res.status(200).json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
}
export async function updateAdminOrderStatus(req, res, next) {
    try {
        const { status, note } = req.body;
        if (!status) {
            throw new ApiError(400, "'status' is required");
        }
        // Adjust to however your project identifies the logged-in admin
        // (e.g. req.user.email, req.user.fullName, req.admin.id, etc.)
        const adminIdentifier = req.user?.email ?? req.user?._id ?? "admin";
        const order = await updateOrderStatusManually(req.params.orderId, status, note, adminIdentifier);
        res.status(200).json({ success: true, data: order });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=order.admin.controller.js.map