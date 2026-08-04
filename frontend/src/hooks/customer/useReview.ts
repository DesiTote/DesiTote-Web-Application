// ─── hooks/useReview.ts ──────────────────────────────────────────────
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
    createReviewApi,
    getOrderReviewableItemsApi,
    getProductReviewsApi,
    getFeaturedReviewsApi,
} from "@/services/customer/review.service";
import { CreateReviewPayload } from "@/types/customer/review.type";
import { toast } from "sonner";  

export function useOrderReviewableItems(orderId: string) {
    return useQuery({
        queryKey: ["reviews", "reviewable-items", orderId],
        queryFn: () => getOrderReviewableItemsApi(orderId),
        enabled: Boolean(orderId),
    });
}

export function useProductReviews(productId: string, limit = 10) {
    return useQuery({
        queryKey: ["reviews", "product", productId, limit],
        queryFn: () => getProductReviewsApi(productId, limit),
        enabled: Boolean(productId),
    });
}

export function useFeaturedReviews(limit = 3) {
    return useQuery({
        queryKey: ["reviews", "featured", limit],
        queryFn: () => getFeaturedReviewsApi(limit),
        staleTime: 15 * 60_000,
    });
}

export function useCreateReview(orderId: string) {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CreateReviewPayload) => createReviewApi(payload),
        onSuccess: () => {
            toast.success("Thanks for your review!");
            queryClient.invalidateQueries({ queryKey: ["reviews", "reviewable-items", orderId] });
        },
        onError: (err: any) => {
            toast.error(err?.response?.data?.message || "Couldn't submit your review");
        },
    });
}