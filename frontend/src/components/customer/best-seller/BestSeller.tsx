"use client";

import { useBestsellers } from "@/hooks/customer/useProduct";
import ProductCard from "./BestSellerCard";


export default function BestsellersPageContent() {
    const { data, isLoading, isError, refetch } = useBestsellers(10);

    return (
        <div className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-rose-700">
                <span className="h-px w-6 bg-slate-900" />
                From the Workshop
            </div>
            <h1 className="mb-10 font-serif text-4xl text-slate-900">Bestsellers</h1>

            {isError ? (
                <div className="flex flex-col items-center gap-2 py-16">
                    <p className="text-sm text-slate-500">Couldn't load bestsellers.</p>
                    <button onClick={() => refetch()} className="text-sm font-medium text-rose-700 underline">
                        Retry
                    </button>
                </div>
            ) : (
                <div className="grid grid-cols-2 gap-6 md:grid-cols-3 lg:grid-cols-4">
                    {isLoading || !data
                        ? Array.from({ length: 10 }).map((_, i) => (
                            <div key={i} className="space-y-3">
                                <div className="aspect-[852/1280] w-full animate-pulse rounded bg-muted" />
                                <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                                <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                            </div>
                        ))
                        : data.map((product) => <ProductCard key={product.productId} product={product} />)}
                </div>
            )}
        </div>
    );
}