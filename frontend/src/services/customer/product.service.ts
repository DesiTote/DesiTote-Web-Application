import { api } from "@/lib/axios";
import { GetProductsResponse, SearchProductResult, GetProductsParams, StorefrontBestseller } from "@/types/customer/product.type";


export const fetchPublicProducts = async (
    params: GetProductsParams
): Promise<GetProductsResponse> => {
    const { data } = await api.get("/products", {
        params: {
            ...params,
            category: params.category?.length ? params.category.join(",") : undefined,
        },
    });
    return data.data;
};

export const fetchProductSearch = async (
    q: string
): Promise<{ products: SearchProductResult[] }> => {
    const { data } = await api.get("/products/search", {
        params: { q },
    });
    return data.data;
};

export const fetchProductBySlug = async (slug: string): Promise<any> => {
    const { data } = await api.get(`/products/slug/${slug}`);
    return data.data;
};

 
interface ApiResponse<T> {
    success: boolean;
    data: T;
}
 
export async function getBestsellersApi(limit: number): Promise<StorefrontBestseller[]> {
    const res = await api.get<ApiResponse<StorefrontBestseller[]>>("/products/bestsellers", {
        params: { limit },
    });
    return res.data.data;
}
 