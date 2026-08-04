// ─── types/dashboard.types.ts ──────────────────────────────────

export interface DashboardStats {
    totalOrders: number;
    totalRevenue: number;
    totalUsers: number;
    totalProducts: number;
}

export interface SalesOverviewPoint {
    date: string;   // "2026-07-14"
    day: string;    // "Mon"
    orders: number;
    revenue: number;
}

export type OrderStatusBucket =
    | "Pending"
    | "Processing"
    | "Shipped"
    | "Delivered"
    | "Cancelled";

export interface OrderStatusPoint {
    status: OrderStatusBucket;
    count: number;
}

export type SalesRange = "week" | "month";