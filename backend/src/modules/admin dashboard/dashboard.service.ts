// ─── modules/dashboard/dashboard.service.ts ────────────────────
import { Order } from "../order/order.model.js";           // adjust to your actual export
import { User, UserRole } from "../auth/auth.model.js";     // adjust to wherever User model lives (auth module?)
import Product from "../product/product.model.js";      // adjust to your actual export
import {
    ORDER_STATUS_BUCKET_MAP,
    ORDER_STATUS_BUCKET_ORDER,
    REVENUE_EXCLUDED_STATUSES,
} from "./dashboard.constant.js";

/* ────────────────────────────────────────────────────────────
 * Total Orders, Total Revenue, Total Users, Total Products
 * ──────────────────────────────────────────────────────────── */
export async function fetchDashboardStats() {
    const [orderAgg, totalUsers, totalProducts] = await Promise.all([
        Order.aggregate([
            {
                $facet: {
                    totalOrders: [{ $count: "count" }],
                    totalRevenue: [
                        { $match: { status: { $nin: REVENUE_EXCLUDED_STATUSES } } },
                        { $group: { _id: null, sum: { $sum: "$grandTotal" } } },
                    ],
                },
            },
        ]),
        User.countDocuments({ role: UserRole.CUSTOMER }),
        Product.countDocuments(), // add { isDeleted: false } / { isActive: true } if your schema has it
    ]);

    return {
        totalOrders: orderAgg[0]?.totalOrders[0]?.count ?? 0,
        totalRevenue: orderAgg[0]?.totalRevenue[0]?.sum ?? 0,
        totalUsers,
        totalProducts,
    };
}

/* ────────────────────────────────────────────────────────────
 * Day-wise { date, day, orders, revenue } for the sales line chart
 * range: "week" -> last 7 days (default) | "month" -> last 30 days
 * ──────────────────────────────────────────────────────────── */
export async function fetchSalesOverview(range: "week" | "month") {
    const days = range === "month" ? 30 : 7;

    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0);
    startDate.setDate(startDate.getDate() - (days - 1));

    const raw = await Order.aggregate([
        {
            $match: {
                createdAt: { $gte: startDate },
                status: { $nin: REVENUE_EXCLUDED_STATUSES },
            },
        },
        {
            $group: {
                _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                orders: { $sum: 1 },
                revenue: { $sum: "$grandTotal" },
            },
        },
    ]);

    // Fill in every day in the range (including zero-order days) so the
    // chart has no gaps, regardless of what the aggregation returned.
    const byDate = new Map(raw.map((r) => [r._id, r]));
    const result: { date: string; day: string; orders: number; revenue: number }[] = [];

    for (let i = 0; i < days; i++) {
        const d = new Date(startDate);
        d.setDate(d.getDate() + i);
        const key = d.toISOString().slice(0, 10); // YYYY-MM-DD
        const entry = byDate.get(key);

        result.push({
            date: key,
            day: d.toLocaleDateString("en-US", { weekday: "short" }), // Mon, Tue, ...
            orders: entry?.orders ?? 0,
            revenue: entry?.revenue ?? 0,
        });
    }

    return result;
}

/* ────────────────────────────────────────────────────────────
 * Bucketed order-status counts for the donut chart
 * ──────────────────────────────────────────────────────────── */
export async function fetchOrderStatusBreakdown() {
    const raw = await Order.aggregate([{ $group: { _id: "$status", count: { $sum: 1 } } }]);

    const bucketCounts: Record<string, number> = Object.fromEntries(
        ORDER_STATUS_BUCKET_ORDER.map((bucket) => [bucket, 0])
    );

    for (const row of raw) {
        const bucket = ORDER_STATUS_BUCKET_MAP[row._id as keyof typeof ORDER_STATUS_BUCKET_MAP];
        if (bucket) bucketCounts[bucket] += row.count;
    }

    return ORDER_STATUS_BUCKET_ORDER.map((status) => ({
        status,
        count: bucketCounts[status],
    }));
}