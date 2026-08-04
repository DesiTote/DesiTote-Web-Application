// ─── services/analytics.service.ts ────────────────────────────────
import { api } from "@/lib/axios"; // adjust to your configured axios instance;
import { TrendRange, RevenueTrendPoint, AovData, BestSellingSortBy, BestSellingProduct, SignupTrendPoint, MostWishlistedProduct } from "@/types/admin/analytics.type";

const BASE_URL = "/admin/analytics";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export async function getRevenueTrendApi(range: TrendRange): Promise<RevenueTrendPoint[]> {
    const res = await api.get<ApiResponse<RevenueTrendPoint[]>>(`${BASE_URL}/revenue-trend`, {
        params: { range },
    });
    return res.data.data;
}

export async function getAovApi(): Promise<AovData> {
    const res = await api.get<ApiResponse<AovData>>(`${BASE_URL}/aov`);
    return res.data.data;
}

export async function getBestSellingProductsApi(
    sortBy: BestSellingSortBy,
    limit = 10
): Promise<BestSellingProduct[]> {
    const res = await api.get<ApiResponse<BestSellingProduct[]>>(
        `${BASE_URL}/best-selling-products`,
        { params: { sortBy, limit } }
    );
    return res.data.data;
}

export async function getNewSignupsTrendApi(): Promise<SignupTrendPoint[]> {
    const res = await api.get<ApiResponse<SignupTrendPoint[]>>(`${BASE_URL}/new-signups`);
    return res.data.data;
}

export async function getMostWishlistedProductsApi(limit = 10): Promise<MostWishlistedProduct[]> {
    const res = await api.get<ApiResponse<MostWishlistedProduct[]>>(
        `${BASE_URL}/most-wishlisted-products`,
        { params: { limit } }
    );
    return res.data.data;
}