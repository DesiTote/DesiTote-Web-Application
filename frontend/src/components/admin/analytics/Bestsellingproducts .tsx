"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useBestSellingProducts } from "@/hooks/admin/useAnalytics";
import { BestSellingSortBy } from "@/types/admin/analytics.type";


const inr = (v: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

export default function BestSellingProducts() {
    const [sortBy, setSortBy] = useState<BestSellingSortBy>("quantity");
    const { data, isLoading, isError, refetch } = useBestSellingProducts(sortBy, 10);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Best-Selling Products</CardTitle>
                <div className="flex gap-1 rounded-lg bg-muted p-1 text-sm">
                    {(["quantity", "revenue"] as BestSellingSortBy[]).map((s) => (
                        <button
                            key={s}
                            onClick={() => setSortBy(s)}
                            className={`rounded-md px-3 py-1 capitalize transition-colors ${
                                sortBy === s ? "bg-background font-medium shadow-sm" : "text-muted-foreground"
                            }`}
                        >
                            By {s}
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                {isError ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10">
                        <p className="text-sm text-muted-foreground">Couldn't load best-sellers.</p>
                        <button onClick={() => refetch()} className="text-sm font-medium text-primary underline underline-offset-4">
                            Retry
                        </button>
                    </div>
                ) : isLoading || !data ? (
                    <div className="space-y-3">
                        {Array.from({ length: 5 }).map((_, i) => (
                            <div key={i} className="h-12 w-full animate-pulse rounded bg-muted" />
                        ))}
                    </div>
                ) : data.length === 0 ? (
                    <p className="py-6 text-center text-sm text-muted-foreground">No sales data yet.</p>
                ) : (
                    <div className="divide-y">
                        {data.map((product, i) => (
                            <div key={product.productId ?? i} className="flex items-center gap-3 py-3">
                                <span className="w-5 text-sm font-medium text-muted-foreground">{i + 1}</span>
                                {product.image && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={product.image} alt={product.name} className="h-10 w-10 rounded-md object-cover" />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{product.name}</p>
                                    <p className="text-xs text-muted-foreground">SKU: {product.sku}</p>
                                </div>
                                <div className="text-right text-sm">
                                    <p className="font-medium">
                                        {sortBy === "quantity" ? `${product.totalQuantity} sold` : inr(product.totalRevenue)}
                                    </p>
                                    <p className="text-xs text-muted-foreground">
                                        {sortBy === "quantity" ? inr(product.totalRevenue) : `${product.totalQuantity} sold`}
                                    </p>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}