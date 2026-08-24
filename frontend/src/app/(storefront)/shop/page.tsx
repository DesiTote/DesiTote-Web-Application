"use client";

import { useEffect, useState } from "react";
import ProductCard from "@/components/customer/product/product-card";
import ProductCardSkeleton from "@/components/skeletons/customer/ProductCardSkeleton";
import QueryError from "@/components/shared/QueryError";
import PageContainer from "@/components/shared/PageContainer";
import ShopSidebar from "@/components/shared/ShopSidebar";
import { useAuth } from "@/context/AuthContext";
import { useProducts } from "@/hooks/customer/useProduct";
import { GetProductsParams } from "@/types/customer/product.type";
import SearchBar from "@/components/shared/SearchBar";


const DEFAULT_FILTERS: GetProductsParams = {
  page: 1,
  limit: 12,
  maxPrice: 500,
  sort: "default",
};

export default function ShopPage() {
  const { isLoggedIn } = useAuth();

  const [draftFilters, setDraftFilters] = useState<GetProductsParams>(DEFAULT_FILTERS);
  const [appliedFilters, setAppliedFilters] = useState<GetProductsParams>(DEFAULT_FILTERS);

  const { data, isLoading, isError, error, refetch,isFetching } = useProducts(appliedFilters);

  const showSkeleton = isLoading || isFetching

  // DEBOUNCE EFFECT FOR THE SEARCH BAR
  useEffect(() => {
    if (draftFilters.search === appliedFilters.search) return;

    const delayDebounceFn = setTimeout(() => {
      // RULE 1: If a user types a new search query, reset sidebar filters completely 
      // to avoid conflicting criteria that result in empty states.
      if (draftFilters.search && draftFilters.search.trim() !== "") {
        const freshSearchFilters = {
          ...DEFAULT_FILTERS, // Clears custom categories, resets max price to 500
          search: draftFilters.search,
          page: 1,
        };

        setDraftFilters(freshSearchFilters); // Sync sidebar UI inputs to default values
        setAppliedFilters(freshSearchFilters); // Trigger fresh backend fetch
      } else {
        // If they backspaced and cleared the search bar completely, just remove the text parameter
        setAppliedFilters((prev) => ({
          ...prev,
          search: "",
          page: 1,
        }));
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [draftFilters.search, appliedFilters.search]);

  // CONTINUOUS SEARCH BAR TYPING SYNC
  const handleSearchChange = (searchValue: string) => {
    setDraftFilters((prev) => ({ ...prev, search: searchValue }));
  };

  // APPLY BUTTON CLICKED IN THE SIDEBAR
  const handleApplyFilters = () => {
    setAppliedFilters({ ...draftFilters, page: 1 });
  };

  const handleClearFilters = () => {
    setDraftFilters(DEFAULT_FILTERS);
    setAppliedFilters(DEFAULT_FILTERS);
  };

  const handlePageChange = (newPage: number) => {
    setAppliedFilters((prev) => ({ ...prev, page: newPage }));
  };

  const products = data?.products ?? [];
  const pagination = data?.pagination;
  return (
    <PageContainer className="py-10 pb-24 relative">
      <div className="space-y-8">

        {/* PAGE HEADER */}
        <div className="space-y-2">
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 tracking-tight">
            Shop Eco-Friendly Tote Bags
          </h1>
          <p className="text-sm text-slate-500 font-medium">
            Discover thoughtfully designed, sustainable everyday essentials.
          </p>
        </div>

        <div className="w-full md:w-auto shrink-0">
          <SearchBar
            onSearch={handleSearchChange}
            placeholder="Search products..."
          />
        </div>

        {/* RESPONSIVE LAYOUT MATRIX */}
        <div className="flex flex-col lg:flex-row gap-8 items-start">

          {/* SIDEBAR ZONE */}
          {!isError && (
            <div className="shrink-0 lg:w-64 w-full lg:sticky lg:top-32 z-30">
              <ShopSidebar
                filters={draftFilters}
                onChange={setDraftFilters}
                onApply={handleApplyFilters}
                onClear={handleClearFilters}
                disabled={showSkeleton}
              />
            </div>
          )}

          {/* PRODUCTS GRID CONTAINER */}
          <div className="flex-1 min-w-0 w-full">

            {/* Mobile-only item counter utility shown above products */}
            {!isError && !showSkeleton && (
              <div className="w-full lg:hidden pb-4 mb-2 border-b border-slate-100">
                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                  {pagination?.totalItems ?? 0} Items Found
                </p>
              </div>
            )}

            {isError ? (
              <QueryError
                title="Unable to load product"
                message= "Oops Something went wrong"
                retry={refetch}
                loading={showSkeleton}
              />
            ) : (
              <>
                <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-6">
                  {(showSkeleton)
                    ? Array.from({ length: 8 }).map((_, index) => (
                      <ProductCardSkeleton key={`catalog-skeleton-${index}`} />
                    ))
                    : products.map((product) => (
                      <ProductCard
                        key={product._id}
                        product={product}
                        isLoggedIn={isLoggedIn}
                      />
                    ))
                  }

                  {/* EMPTY CATALOG EXCEPTION */}
                  {!showSkeleton && products.length === 0 && (
                    <div className="col-span-full bg-slate-50/50 rounded-2xl border border-dashed border-slate-200 text-center py-16 px-4">
                      <p className="font-bold text-slate-800 text-sm">No items match your choices</p>
                    </div>
                  )}
                </div>

                {/* PAGINATION */}
                {!showSkeleton && pagination && pagination.totalPages > 1 && (
                  <div className="flex items-center justify-center gap-4 mt-8">
                    <button
                      onClick={() => handlePageChange(pagination.currentPage - 1)}
                      disabled={pagination.currentPage <= 1}
                      className="text-lg cursor-pointer font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Previous
                    </button>
                    <span className="text-xs font-medium text-slate-400">
                      Page {pagination.currentPage} of {pagination.totalPages}
                    </span>
                    <button
                      onClick={() => handlePageChange(pagination.currentPage + 1)}
                      disabled={pagination.currentPage >= pagination.totalPages}
                      className="text-lg cursor-pointer font-semibold text-slate-600 disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      Next
                    </button>
                  </div>
                )}
              </>
            )}
          </div>

        </div>
      </div>
    </PageContainer>
  );
}