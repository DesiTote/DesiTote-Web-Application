import { useQuery } from "@tanstack/react-query";
import { getSalesOverviewApi, getDashboardStatsApi, getOrderStatusApi } from "@/services/admin/dashboard.service";
import { SalesRange } from "@/types/admin/dashboard.type";

export function useDashboardStats() {
    return useQuery({
        queryKey: ["admin", "dashboard", "stats"],
        queryFn: getDashboardStatsApi,
        staleTime: 5*60_000,       // treat data as fresh for 1 min
        refetchInterval: 5*60_000, // poll every 1 min for "real-time"-ish feel
    });
}
export function useSalesOverview(range: SalesRange = "week") {
    return useQuery({
        queryKey: ["admin", "dashboard", "sales-overview", range],
        queryFn: () => getSalesOverviewApi(range),
        staleTime: 5*60_000,
        refetchInterval: 5*60_000,
    });
}

export function useOrderStatus() {
    return useQuery({
        queryKey: ["admin", "dashboard", "order-status"],
        queryFn: getOrderStatusApi,
        staleTime: 5*60_000,
        refetchInterval: 5*60_000,
    });
}
