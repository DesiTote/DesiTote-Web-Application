import { fetchAverageOrderValue, fetchBestSellingProducts, fetchMostWishlistedProducts, fetchNewSignupsTrend, fetchRevenueTrend } from "./analytics.service.js";
export async function getRevenueTrend(req, res, next) {
    try {
        const range = req.query.range === "quarter" ? "quarter" : "month";
        const data = await fetchRevenueTrend(range);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
export async function getAverageOrderValue(req, res, next) {
    try {
        const data = await fetchAverageOrderValue();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
export async function getBestSellingProducts(req, res, next) {
    try {
        const sortBy = req.query.sortBy === "revenue" ? "revenue" : "quantity";
        const limit = req.query.limit ? Math.min(50, Number(req.query.limit)) : 10;
        const data = await fetchBestSellingProducts(sortBy, limit);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
export async function getNewSignupsTrend(req, res, next) {
    try {
        const data = await fetchNewSignupsTrend();
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
export async function getMostWishlistedProducts(req, res, next) {
    try {
        const limit = req.query.limit ? Math.min(50, Number(req.query.limit)) : 10;
        const data = await fetchMostWishlistedProducts(limit);
        res.status(200).json({ success: true, data });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=analytics.controller.js.map