// ─── hooks/useReturn.ts ──────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { getReturnableItemsApi, createReturnRequestApi, getOrderReturnsApi } from "@/services/customer/return.service";
import { ReturnRequestItemInput } from "@/types/customer/return.type";
import { toast } from "sonner"; // adjust to whatever toast library your project uses

export function useReturnableItems(orderId: string) {
    return useQuery({
        queryKey: ["orders", orderId, "returnable-items"],
        queryFn: () => getReturnableItemsApi(orderId),
        enabled: Boolean(orderId),
    });
}

export function useOrderReturns(orderId: string) {
    return useQuery({
        queryKey: ["orders", orderId, "returns"],
        queryFn: () => getOrderReturnsApi(orderId),
        enabled: Boolean(orderId),
    });
}

export function useCreateReturnRequest(orderId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (items: ReturnRequestItemInput[]) => createReturnRequestApi(orderId, items),
        onSuccess: () => {
            toast.success("Return requested — we'll be in touch about pickup.");
            queryClient.invalidateQueries({ queryKey: ["orders", orderId, "returnable-items"] });
            queryClient.invalidateQueries({ queryKey: ["orders", orderId, "returns"] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Couldn't submit your return request");
        },
    });
}