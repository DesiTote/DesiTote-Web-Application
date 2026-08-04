import { useQuery } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { fetchPublicProducts, fetchProductSearch, fetchProductBySlug, getBestsellersApi } from "@/services/customer/product.service";
import { GetProductsParams } from "@/types/customer/product.type";

export const useProducts = (params: GetProductsParams) => {
    return useQuery({
        queryKey: ["products", params],
        queryFn: () => fetchPublicProducts(params),
        placeholderData: (prev) => prev, // keep old page's data visible while next page loads
        staleTime: 60 * 1000,
    });
};

// Debounced search-as-you-type hook for the search bar
export const useProductSearch = (rawQuery: string, delayMs = 300) => {
    const [debouncedQuery, setDebouncedQuery] = useState(rawQuery);

    useEffect(() => {
        const timeout = setTimeout(() => setDebouncedQuery(rawQuery), delayMs);
        return () => clearTimeout(timeout);
    }, [rawQuery, delayMs]);

    return useQuery({
        queryKey: ["product-search", debouncedQuery],
        queryFn: () => fetchProductSearch(debouncedQuery),
        enabled: debouncedQuery.trim().length >= 2, // matches backend's min-length guard
        staleTime: 60 * 1000,
    });
};

export const useProductBySlug = (slug: string) => {
    return useQuery({
        queryKey: ["product", slug],
        queryFn: () => fetchProductBySlug(slug),
        enabled: !!slug,
        staleTime: 60 * 1000,
    });
};

export function useBestsellers(limit: number) {
    return useQuery({
        queryKey: ["storefront", "bestsellers", limit],
        queryFn: () => getBestsellersApi(limit),
        staleTime: 10 * 60_000, // storefront content, fine to cache a few minutes
    });
}