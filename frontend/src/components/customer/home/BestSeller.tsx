"use client";

import { useBestsellers } from "@/hooks/customer/useProduct";
import ProductCard from "../best-seller/BestSellerCard";

export default function BestsellersSection() {
    const { data, isLoading, isError } = useBestsellers(4);

    if (isError) return null; // fail quietly on the homepage — not worth a visible error block here

    return (
        <section className="mx-auto max-w-7xl px-6 py-16">
            <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-rose-700">
                <span className="h-px w-6 bg-slate-900" />
                From the Workshop
            </div>
            <h2 className="mb-10 font-serif text-4xl text-slate-900">Bestsellers</h2>

            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
                {isLoading || !data
                    ? Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="space-y-3">
                            <div className="aspect-[852/1280] w-full animate-pulse rounded bg-muted" />
                            <div className="h-4 w-3/4 animate-pulse rounded bg-muted" />
                            <div className="h-4 w-1/2 animate-pulse rounded bg-muted" />
                        </div>
                    ))
                    : data.map((product) => <ProductCard key={product.productId} product={product} />)}
            </div>
        </section>
    );
}