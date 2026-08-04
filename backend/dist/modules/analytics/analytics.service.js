import { Order } from "../order/order.model.js";
import { User, UserRole } from "../auth/auth.model.js"; // adjust filename if different
import { REVENUE_EXCLUDED_STATUSES } from "../admin dashboard/dashboard.constant.js";
import Wishlist from "../wishlist/wishlist.model.js";
export async function fetchRevenueTrend(range) {
    const periods = range === "quarter" ? 8 : 12; // 8 quarters (~2yr) or 12 months (~1yr)
    const startDate = new Date();
    if (range === "quarter") {
        startDate.setMonth(startDate.getMonth() - periods * 3 + 1, 1);
    }
    else {
        startDate.setMonth(startDate.getMonth() - periods + 1, 1);
    }
    startDate.setHours(0, 0, 0, 0);
    const groupId = range === "quarter"
        ? {
            year: { $year: "$createdAt" },
            quarter: { $ceil: { $divide: [{ $month: "$createdAt" }, 3] } },
        }
        : {
            year: { $year: "$createdAt" },
            month: { $month: "$createdAt" },
        };
    const raw = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                status: { $nin: REVENUE_EXCLUDED_STATUSES },
            },
        },
        {
            $group: {
                _id: groupId,
                revenue: { $sum: "$grandTotal" },
                orders: { $sum: 1 },
            },
        },
        { $sort: { "_id.year": 1, "_id.month": 1, "_id.quarter": 1 } },
    ]);
    // Fill gaps so every period in range shows up even with 0 orders
    const result = [];
    if (range === "quarter") {
        for (let i = 0; i < periods; i++) {
            const d = new Date(startDate);
            d.setMonth(d.getMonth() + i * 3);
            const year = d.getFullYear();
            const quarter = Math.ceil((d.getMonth() + 1) / 3);
            const match = raw.find((r) => r._id.year === year && r._id.quarter === quarter);
            result.push({
                label: `Q${quarter} ${year}`,
                revenue: match?.revenue ?? 0,
                orders: match?.orders ?? 0,
            });
        }
    }
    else {
        for (let i = 0; i < periods; i++) {
            const d = new Date(startDate);
            d.setMonth(d.getMonth() + i);
            const year = d.getFullYear();
            const month = d.getMonth() + 1;
            const match = raw.find((r) => r._id.year === year && r._id.month === month);
            result.push({
                label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
                revenue: match?.revenue ?? 0,
                orders: match?.orders ?? 0,
            });
        }
    }
    return result;
}
export async function fetchAverageOrderValue() {
    const [overall] = await Order.aggregate([
        { $match: { status: { $nin: REVENUE_EXCLUDED_STATUSES } } },
        {
            $group: {
                _id: null,
                totalRevenue: { $sum: "$grandTotal" },
                totalOrders: { $sum: 1 },
            },
        },
    ]);
    const months = 6;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const trendRaw = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                status: { $nin: REVENUE_EXCLUDED_STATUSES },
            },
        },
        {
            $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                revenue: { $sum: "$grandTotal" },
                orders: { $sum: 1 },
            },
        },
    ]);
    const trend = [];
    for (let i = 0; i < months; i++) {
        const d = new Date(startDate);
        d.setMonth(d.getMonth() + i);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const match = trendRaw.find((r) => r._id.year === year && r._id.month === month);
        const aov = match && match.orders > 0 ? match.revenue / match.orders : 0;
        trend.push({ label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }), aov: Math.round(aov) });
    }
    const overallAov = overall && overall.totalOrders > 0 ? Math.round(overall.totalRevenue / overall.totalOrders) : 0;
    return {
        overallAov,
        totalOrders: overall?.totalOrders ?? 0,
        totalRevenue: overall?.totalRevenue ?? 0,
        trend,
    };
}
export async function fetchBestSellingProducts(sortBy, limit) {
    const sortField = sortBy === "quantity" ? "totalQuantity" : "totalRevenue";
    const rows = await Order.aggregate([
        { $match: { status: { $nin: REVENUE_EXCLUDED_STATUSES } } },
        { $unwind: "$items" },
        {
            $group: {
                _id: "$items.productId",
                name: { $first: "$items.name" },
                sku: { $first: "$items.sku" },
                image: { $first: "$items.image" },
                totalQuantity: { $sum: "$items.quantity" },
                totalRevenue: { $sum: "$items.lineTotal" },
                orderCount: { $sum: 1 },
            },
        },
        { $sort: { [sortField]: -1 } },
        { $limit: limit },
    ]);
    return rows.map((r) => ({
        productId: r._id?.toString() ?? null,
        name: r.name,
        sku: r.sku,
        image: r.image,
        totalQuantity: r.totalQuantity,
        totalRevenue: r.totalRevenue,
        orderCount: r.orderCount,
    }));
}
export async function fetchNewSignupsTrend() {
    const months = 12;
    const startDate = new Date();
    startDate.setMonth(startDate.getMonth() - months + 1, 1);
    startDate.setHours(0, 0, 0, 0);
    const raw = await User.aggregate([
        { $match: { createdAt: { $gte: startDate }, role: UserRole.CUSTOMER } },
        {
            $group: {
                _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
                signups: { $sum: 1 },
            },
        },
    ]);
    const result = [];
    for (let i = 0; i < months; i++) {
        const d = new Date(startDate);
        d.setMonth(d.getMonth() + i);
        const year = d.getFullYear();
        const month = d.getMonth() + 1;
        const match = raw.find((r) => r._id.year === year && r._id.month === month);
        result.push({
            label: d.toLocaleDateString("en-US", { month: "short", year: "2-digit" }),
            signups: match?.signups ?? 0,
        });
    }
    return result;
}
export async function fetchMostWishlistedProducts(limit) {
    const rows = await Wishlist.aggregate([
        {
            $group: {
                _id: "$productId",
                wishlistCount: { $sum: 1 },
            },
        },
        { $sort: { wishlistCount: -1 } },
        { $limit: limit },
        {
            $lookup: {
                from: "products", // adjust if your Product model uses a custom collection name
                localField: "_id",
                foreignField: "_id",
                as: "product",
            },
        },
        { $unwind: { path: "$product", preserveNullAndEmptyArrays: true } },
        {
            $project: {
                _id: 0,
                productId: "$_id",
                wishlistCount: 1,
                title: "$product.title",
                image: { $first: "$product.images" }, // adjust if the field is singular `image` instead
                price: "$product.price",
            },
        },
    ]);
    return rows.map((r) => ({
        productId: r.productId?.toString() ?? null,
        title: r.title ?? "Unknown product", // null if the product was deleted but wishlist entries remain
        image: r.image ?? null,
        price: r.price ?? null,
        wishlistCount: r.wishlistCount,
    }));
}
//# sourceMappingURL=analytics.service.js.map