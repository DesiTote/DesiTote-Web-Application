// ─── services/dashboard.service.ts ─────────────────────────────
import { api } from "@/lib/axios"; // adjust to wherever your configured axios instance lives
import {
    DashboardStats,
    SalesOverviewPoint,
    OrderStatusPoint,
    SalesRange,
} from "@/types/admin/dashboard.type";

const BASE_URL = "/admin/dashboard";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export async function getDashboardStatsApi(): Promise<DashboardStats> {
    const res = await api.get<ApiResponse<DashboardStats>>(`${BASE_URL}/stats`);
    return res.data.data;
}

export async function getSalesOverviewApi(range: SalesRange = "week"): Promise<SalesOverviewPoint[]> {
    const res = await api.get<ApiResponse<SalesOverviewPoint[]>>(`${BASE_URL}/sales-overview`, {
        params: { range },
    });
    return res.data.data;
}

export async function getOrderStatusApi(): Promise<OrderStatusPoint[]> {
    const res = await api.get<ApiResponse<OrderStatusPoint[]>>(`${BASE_URL}/order-status`);
    return res.data.data;
}