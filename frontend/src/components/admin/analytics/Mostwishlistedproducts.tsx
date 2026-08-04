"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";import { useMostWishlistedProducts } from "@/hooks/admin/useAnalytics";
;

const inr = (v: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

export default function MostWishlistedProducts() {
    const { data, isLoading, isError, refetch } = useMostWishlistedProducts(10);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Most Wishlisted Products</CardTitle>
            </CardHeader>
            <CardContent>
                {isError ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10">
                        <p className="text-sm text-muted-foreground">Couldn't load wishlist data.</p>
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
                    <p className="py-6 text-center text-sm text-muted-foreground">No wishlist activity yet.</p>
                ) : (
                    <div className="divide-y">
                        {data.map((product, i) => (
                            <div key={product.productId ?? i} className="flex items-center gap-3 py-3">
                                <span className="w-5 text-sm font-medium text-muted-foreground">{i + 1}</span>
                                {product.image && (
                                    // eslint-disable-next-line @next/next/no-img-element
                                    <img src={product.image} alt={product.title} className="h-10 w-10 rounded-md object-cover" />
                                )}
                                <div className="flex-1">
                                    <p className="text-sm font-medium">{product.title}</p>
                                    {product.price !== null && (
                                        <p className="text-xs text-muted-foreground">{inr(product.price)}</p>
                                    )}
                                </div>
                                <span className="text-sm font-medium">♥ {product.wishlistCount}</span>
                            </div>
                        ))}
                    </div>
                )}
            </CardContent>
        </Card>
    );
}