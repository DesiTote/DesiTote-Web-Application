// ─── services/customer.service.ts ───────────────────────────────
import { api } from "@/lib/axios"; // adjust to your configured axios instance
import {
    AdminCustomerListParams,
    AdminCustomerListResponse,
    AdminCustomerListItem,
} from "@/types/admin/customer.type";

const BASE_URL = "/admin/customers";

interface ApiResponse<T> {
    success: boolean;
    data: T;
    message?: string;
}

export async function getAdminCustomersApi(
    params: AdminCustomerListParams
): Promise<AdminCustomerListResponse> {
    const res = await api.get<ApiResponse<AdminCustomerListResponse>>(BASE_URL, { params });
    return res.data.data;
}

export async function setCustomerBlockedApi(
    userId: string,
    blocked: boolean
): Promise<AdminCustomerListItem> {
    const res = await api.patch<ApiResponse<AdminCustomerListItem>>(
        `${BASE_URL}/${userId}/block-status`,
        { blocked }
    );
    return res.data.data;
}