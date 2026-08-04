import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { setCustomerBlockedApi } from "@/services/admin/customer.service";
import { toast } from "sonner";
import { getAdminCustomersApi } from "@/services/admin/customer.service";
import { AdminCustomerListParams } from "@/types/admin/customer.type";

export function useAdminCustomers(params: AdminCustomerListParams) {
    return useQuery({
        queryKey: ["admin", "customers", params],
        queryFn: () => getAdminCustomersApi(params),
        placeholderData: keepPreviousData,
    });
}

export function useSetCustomerBlocked() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ userId, blocked }: { userId: string; blocked: boolean }) =>
            setCustomerBlockedApi(userId, blocked),

        onSuccess: (_data, variables) => {
            toast.success(variables.blocked ? "Customer blocked" : "Customer unblocked");
            queryClient.invalidateQueries({ queryKey: ["admin", "customers"] });
        },

        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Failed to update customer status");
        },
    });
}
