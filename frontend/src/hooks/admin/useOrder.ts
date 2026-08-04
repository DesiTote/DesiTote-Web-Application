// ─── hooks/useAdminOrders.ts ────────────────────────────────────
import { useQuery, keepPreviousData, useMutation, useQueryClient } from "@tanstack/react-query";
import { getAdminOrderByIdApi, getAdminOrdersApi, updateOrderStatusApi } from "@/services/admin/order.service";
import { AdminOrderListParams, OrderStatus } from "@/types/admin/order.type";
import { toast } from "sonner";

export function useAdminOrders(params: AdminOrderListParams) {
    return useQuery({
        queryKey: ["admin", "orders", params],
        queryFn: () => getAdminOrdersApi(params),
        placeholderData: keepPreviousData, // avoid table flicker when paging/filtering
    });
}
export function useAdminOrderDetail(orderId: string) {
    return useQuery({
        queryKey: ["admin", "orders", orderId],
        queryFn: () => getAdminOrderByIdApi(orderId),
        enabled: Boolean(orderId),
    });
}
 

export function useUpdateOrderStatus(orderId: string) {
    const queryClient = useQueryClient();
 
    return useMutation({
        mutationFn: (payload: { status: OrderStatus; note?: string }) =>
            updateOrderStatusApi(orderId, payload),
 
        onSuccess: () => {
            toast.success("Order status updated");
            queryClient.invalidateQueries({ queryKey: ["admin", "orders", orderId] });
            queryClient.invalidateQueries({ queryKey: ["admin", "orders"] }); // refresh list too
        },
 
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update order status");
        },
    });
}