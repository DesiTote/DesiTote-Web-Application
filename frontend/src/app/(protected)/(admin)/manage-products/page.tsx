"use client";

import { useState, useEffect } from "react";
import { useAdminProducts } from "@/hooks/admin/useProduct";

import ProductHeader from "@/components/admin/products/ProductHeader";
import ProductFilters from "@/components/admin/products/ProductFilters";
import ProductTable from "@/components/admin/products/ProductTable";
import ProductTableSkeleton from "@/components/skeletons/admin/ProductTableSkeleton";
import QueryError from "@/components/shared/QueryError";
import { AdminProductDetailResponse, AdminProductsResponse } from "@/types/admin/product.type";


export default function ProductsPage() {
    // 1. Local Filter States
    const [search, setSearch] = useState("");
    const [debouncedSearch, setDebouncedSearch] = useState("");
    const [category, setCategory] = useState("all");
    const [status, setStatus] = useState("all");
    const [page, setPage] = useState(1);
    const limit = 2;

    // 2. Search Input Debouncing (300ms window)
    useEffect(() => {
        const token = setTimeout(() => {
            setDebouncedSearch(search);
            setPage(1);
        }, 300);

        return () => clearTimeout(token);
    }, [search]);

    // 3. Assemble API Query Payload Matrix
    const queryParams = {
        page,
        limit,
        search: debouncedSearch,
        category: category !== "all" ? category : undefined,
        status: status !== "all" ? status.toUpperCase() : undefined,
    };

    // 4. Fire TanStack Hook - exposing 'refetch' for the retry action trigger
    const { data, isLoading, isError, isFetching, refetch } = useAdminProducts(queryParams);

    const isDisabled = isLoading || isFetching;

    return (
        <div className="space-y-8">
            <ProductHeader />

            <ProductFilters
                search={search}
                setSearch={setSearch}
                category={category}
                setCategory={(val) => { setCategory(val); setPage(1); }}
                status={status}
                setStatus={(val) => { setStatus(val); setPage(1); }}
                disabled={isDisabled || isError} // Keep disabled if an unmitigated error block status is active
            />

            {/* 5. Production Error Catch Block Configuration */}
            {isLoading ? (
                <ProductTableSkeleton />
            ) : (isError || !data?.data) ? (
                <div className="py-6 flex justify-center">
                    <QueryError
                        title="Catalog Synchronization Error"
                        message="We encountered an issue fetching the admin database metrics. Please verify your credentials or server health."
                        redirectUrl="/admin/dashboard"
                        redirectPageName="Dashboard"
                        retry={() => refetch()}
                    />
                </div>
            ) : (
                <div className={isFetching ? "opacity-60 pointer-events-none transition-opacity duration-200" : ""}>
                    <ProductTable
                        products={data.data}
                        meta={data.meta}
                        page={page}
                        setPage={setPage}
                        disabled={isDisabled}
                    />
                </div>
            )}
        </div>
    );
}