export interface GetProductsParams {
    page?: number;
    limit?: number;
    search?: string;
    category?: string;
    status?: string;
}

export interface Product {
    _id: string;
    title: string;
    slug: string;
    shortDescription: string;
    description: string;
    color: string;
    material: string;
    productCategory: string; // Updated field name
    brand: string;
    tags: string[];
    price: number;
    discountPrice: number;
    costPrice: number;
    stock: number;
    sku: string;
    lowStockThreshold: number;
    weight: number;
    dimensions: {
        length: number;
        breadth: number;
        height: number;
    };
    thumbnail: string;
    images: string[];
    isFeatured: boolean;
    isPublished: boolean;
    status: "ACTIVE" | "DRAFT" | "ARCHIVED"; // Capitalized enum status values
    createdAt: string;
    updatedAt: string;
}

export type AdminProductsResponse = Pick<Product, "_id" | "title" | "price" | "status" | "thumbnail" | "sku" | "productCategory" | "stock" | "lowStockThreshold">;

export interface AdminProductDetailResponse {
    success: boolean;
    message: string;
    data: AdminProductsResponse[]; 
    meta: {
        totalPages: number,
        totalItems: number,
        currentPage: number,
        limit: number,
    }
}

