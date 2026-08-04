// ─── services/order.service.ts ─────────────────────────────────
import { api } from "@/lib/axios"; // adjust to your configured axios instance
import { AdminOrderDetail, AdminOrderListParams, AdminOrderListResponse, OrderStatus } from "@/types/admin/order.type";

const BASE_URL = "/admin/orders";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export async function getAdminOrdersApi(params: AdminOrderListParams): Promise<AdminOrderListResponse> {
    const res = await api.get<ApiResponse<AdminOrderListResponse>>(BASE_URL, { params });
    return res.data.data;
}

export async function getAdminOrderByIdApi(orderId: string): Promise<AdminOrderDetail> {
    const res = await api.get<ApiResponse<AdminOrderDetail>>(`${BASE_URL}/${orderId}`);
    return res.data.data;
}
 
export async function updateOrderStatusApi(
    orderId: string,
    payload: { status: OrderStatus; note?: string }
): Promise<AdminOrderDetail> {
    const res = await api.patch<ApiResponse<AdminOrderDetail>>(`${BASE_URL}/${orderId}/status`, payload);
    return res.data.data;
}