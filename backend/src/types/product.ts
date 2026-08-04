export interface IGetAdminProductsQuery {
    page?: string;
    limit?: string;
    search?: string;
    category?: string;
    status?: string;
}

// src/types/product.ts (add to existing file)
// types/product.ts
export interface IGetPublicProductsQuery {
    page?: string;
    limit?: string;
    search?: string;
    category?: string | string[]; // comma-separated string or array, both supported
    minPrice?: string;
    maxPrice?: string;
    sort?: "price_asc" | "price_desc" | "newest" | "default";
}

export interface IPublicProductCard {
    _id: string;
    slug: string;
    title: string;
    shortDescription: string;
    thumbnail: string;
    price: number;
    discountPrice?: number;
    discountPercentage: number;
    productCategory: string;
}