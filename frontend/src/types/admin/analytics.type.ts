// ─── types/analytics.types.ts ────────────────────────────────────

export type TrendRange = "month" | "quarter";

export interface RevenueTrendPoint {
    label: string; // "Jan 26" or "Q1 2026"
    revenue: number;
    orders: number;
}

export interface AovData {
    overallAov: number;
    totalOrders: number;
    totalRevenue: number;
    trend: { label: string; aov: number }[];
}

export type BestSellingSortBy = "quantity" | "revenue";

export interface BestSellingProduct {
    productId: string | null;
    name: string;
    sku: string;
    image: string;
    totalQuantity: number;
    totalRevenue: number;
    orderCount: number;
}

export interface SignupTrendPoint {
    label: string;
    signups: number;
}

export interface MostWishlistedProduct {
    productId: string | null;
    title: string;
    image: string | null;
    price: number | null;
    wishlistCount: number;
}