// ─── services/review.service.ts ─────────────────────────────────────
import { api } from "@/lib/axios"; // adjust to your configured axios instance
import {
    ReviewableOrderItem,
    ProductReview,
    FeaturedReview,
    CreateReviewPayload,
} from "@/types/customer/review.type";

interface ApiResponse<T> {
    success: boolean;
    data: T;
}

const BASE_URL = "/reviews";

export async function createReviewApi(payload: CreateReviewPayload) {
    const res = await api.post<ApiResponse<any>>(BASE_URL, payload);
    return res.data.data;
}

export async function getOrderReviewableItemsApi(orderId: string): Promise<ReviewableOrderItem[]> {
    const res = await api.get<ApiResponse<ReviewableOrderItem[]>>(
        `${BASE_URL}/orders/${orderId}/reviewable-items`
    );
    return res.data.data;
}

export async function getProductReviewsApi(productId: string, limit = 10): Promise<ProductReview[]> {
    const res = await api.get<ApiResponse<ProductReview[]>>(`${BASE_URL}/product/${productId}`, {
        params: { limit },
    });
    return res.data.data;
}

export async function getFeaturedReviewsApi(limit = 3): Promise<FeaturedReview[]> {
    const res = await api.get<ApiResponse<FeaturedReview[]>>(`${BASE_URL}/featured`, {
        params: { limit },
    });
    return res.data.data;
}