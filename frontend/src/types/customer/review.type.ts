// ─── types/review.types.ts ─────────────────────────────────────────
export interface ReviewableOrderItem {
    productId: string;
    name: string;
    image: string;
    alreadyReviewed: boolean;
}

export interface ProductReview {
    id: string;
    rating: number;
    title: string | null;
    comment: string;
    images: string[];
    isVerifiedBuyer: boolean;
    reviewerName: string;
    createdAt: string;
}

export interface FeaturedReview {
    id: string;
    rating: number;
    title: string | null;
    comment: string;
    reviewerName: string;
    product: {
        title: string | null;
        slug: string | null;
        thumbnail: string | null;
    };
    createdAt: string;
}

export interface CreateReviewPayload {
    productId: string;
    rating: number;
    title?: string;
    comment: string;
    images?: string[];
}