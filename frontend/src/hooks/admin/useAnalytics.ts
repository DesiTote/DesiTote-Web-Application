// ─── hooks/useAnalytics.ts ─────────────────────────────────────────
import { useQuery } from "@tanstack/react-query";
import { TrendRange, BestSellingSortBy } from "@/types/admin/analytics.type";
import { getRevenueTrendApi, getAovApi, getBestSellingProductsApi, getNewSignupsTrendApi, getMostWishlistedProductsApi } from "@/services/admin/analytics.service";
;

const STALE_TIME = 10 * 60_000; // analytics data doesn't need to be second-fresh

export function useRevenueTrend(range: TrendRange) {
    return useQuery({
        queryKey: ["admin", "analytics", "revenue-trend", range],
        queryFn: () => getRevenueTrendApi(range),
        staleTime: STALE_TIME,
    });
}

export function useAov() {
    return useQuery({
        queryKey: ["admin", "analytics", "aov"],
        queryFn: getAovApi,
        staleTime: STALE_TIME,
    });
}

export function useBestSellingProducts(sortBy: BestSellingSortBy, limit = 10) {
    return useQuery({
        queryKey: ["admin", "analytics", "best-selling-products", sortBy, limit],
        queryFn: () => getBestSellingProductsApi(sortBy, limit),
        staleTime: STALE_TIME,
    });
}

export function useNewSignupsTrend() {
    return useQuery({
        queryKey: ["admin", "analytics", "new-signups"],
        queryFn: getNewSignupsTrendApi,
        staleTime: STALE_TIME,
    });
}

export function useMostWishlistedProducts(limit = 10) {
    return useQuery({
        queryKey: ["admin", "analytics", "most-wishlisted-products", limit],
        queryFn: () => getMostWishlistedProductsApi(limit),
        staleTime: STALE_TIME,
    });
}