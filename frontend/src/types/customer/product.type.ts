export const PRODUCT_CATEGORIES = [
    "Tote Bag",
    "Tshirt",
    "Hoodie",
] as const;

export interface PublicProductCard {
    _id: string;
    slug: string;
    title: string;
    shortDescription: string;
    thumbnail: string;
    price: number;
    discountPrice?: number;
    discountPercentage: number;
    productCategory: string;
    isWishlisted: boolean; 
}

export interface ProductsPaginationMeta {
    totalItems: number;
    totalPages: number;
    currentPage: number;
    limit: number;
}

export interface GetProductsResponse {
    products: PublicProductCard[];
    pagination: ProductsPaginationMeta;
}

// types/product.type.ts
export interface GetProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string[]; // multi-select; empty/undefined = All Categories
    minPrice?: number;
    maxPrice?: number;
    sort?: "price_asc" | "price_desc" | "newest" | "default";
}

export interface SearchProductResult {
    _id: string;
    slug: string;
    title: string;
    thumbnail: string;
    price: number;
    discountPrice?: number;
}

export interface StorefrontBestseller {
    productId: string;
    slug: string;
    title: string;
    shortDescription: string;
    thumbnail: string;
    images: string[];
    price: number;
    discountPrice: number;
    discountPercentage: number;
    badge: string;
    totalSold: number;
}