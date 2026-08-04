import { fetchDashboardStats, fetchSalesOverview, fetchOrderStatusBreakdown, } from "./dashboard.service.js";
export async function getDashboardStats(req, res, next) {
    try {
        const data = await fetchDashboardStats();
        return res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
export async function getSalesOverview(req, res, next) {
    try {
        const range = req.query.range === "month" ? "month" : "week";
        const data = await fetchSalesOverview(range);
        return res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
export async function getOrderStatusBreakdown(req, res, next) {
    try {
        const data = await fetchOrderStatusBreakdown();
        return res.status(200).json({ success: true, data });
    }
    catch (err) {
        next(err);
    }
}
//# sourceMappingURL=dashboard.controller.js.map