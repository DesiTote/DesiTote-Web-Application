import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { archiveProduct, createProduct, fetchAdminProductById, fetchAdminProducts, updateProduct } from "@/services/admin/product.service";
import { ProductFormValues } from "@/schemas/admin/product.schema";
import { GetProductsParams } from "@/types/admin/product.type";
import { toast } from "sonner";

export const useCreateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (data: ProductFormValues) => createProduct(data),

        onSuccess: (responseData) => {
            console.log("Product successfully created:", responseData);

            // Invalidate existing dashboard query listings caches to trigger background refreshes
            queryClient.invalidateQueries({ queryKey: ["admin", "products"] });
        },

        onError: (error: any) => {
            console.error("Product creation network submission failure:", error);
            // Connect this boundary to toast messaging interfaces (e.g., toast.error(error.message))
        },
    });
};

export const useAdminProducts = (params: GetProductsParams) => {
    return useQuery({
        queryKey: ["admin-products", params],
        queryFn: () => fetchAdminProducts(params),
        placeholderData: keepPreviousData, // Keeps old table rows visible while new ones load
        staleTime: 1000 * 30, // Data remains "fresh" for 30 seconds
        refetchOnWindowFocus: true, // Automatically updates stock/status if admin switches tabs and returns
    });
};

export function useAdminProductById(productId: string) {
    return useQuery({
        queryKey: ["admin", "product", productId],
        queryFn: () => fetchAdminProductById(productId),
        enabled: !!productId, // Safety gate: Only runs if a valid ID string is present
        staleTime: 5 * 60 * 1000, // Optional: Keeps data fresh in cache for 5 minutes
    });
}

interface UpdateProductVariables {
    productId: string;
    data: ProductFormValues;
}

export const useUpdateProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        // Destructure parameters out of the single argument block wrapper
        mutationFn: ({ productId, data }: UpdateProductVariables) =>
            updateProduct(productId, data),

        onSuccess: (responseData, variables) => {

            // 1. Invalidate list view query caches to sync table panels
            queryClient.invalidateQueries({ queryKey: ["admin", "products"] });

            // 2. Invalidate individual detail view query cache to refresh form values
            queryClient.invalidateQueries({ queryKey: ["admin", "product", variables.productId] });
        },

        onError: (error: any) => {
        },
    });
};

export const useArchiveProduct = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (productId: string) => archiveProduct(productId),

        onSuccess: (_, productId) => {
            toast.success("Product successfully archived");

            queryClient.invalidateQueries({
                queryKey: ["admin-products"],
            });
        },

        onError: (error: any) => {
            toast.error(
                error?.response?.data.message || "Failed to archive product"
            );
        },
    });
};
