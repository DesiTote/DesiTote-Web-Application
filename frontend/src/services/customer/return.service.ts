// ─── services/return.service.ts ─────────────────────────────────────
import { api } from "@/lib/axios"; // adjust to your configured axios instance
import { ReturnableItemsResponse, ReturnRequestItemInput, ReturnRequest } from "@/types/customer/return.type";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

export async function getReturnableItemsApi(orderId: string): Promise<ReturnableItemsResponse> {
    const res = await api.get<ApiResponse<ReturnableItemsResponse>>(
        `/orders/${orderId}/returnable-items`
    );
    return res.data.data;
}

export async function createReturnRequestApi(
    orderId: string,
    items: ReturnRequestItemInput[]
): Promise<ReturnRequest> {
    const res = await api.post<ApiResponse<ReturnRequest>>(`/orders/${orderId}/returns`, {
        items,
    });
    return res.data.data;
}

export async function getOrderReturnsApi(orderId: string): Promise<ReturnRequest[]> {
    const res = await api.get<ApiResponse<ReturnRequest[]>>(`/orders/${orderId}/returns`);
    return res.data.data;
}