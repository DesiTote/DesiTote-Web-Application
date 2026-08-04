"use client";

import { useGetWishlist, useRemoveWishlist } from "@/hooks/customer/useWishList";
import QueryError from "@/components/shared/QueryError";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Heart } from "lucide-react";
import { useRouter } from "next/navigation";
import Image from "next/image";

// Brand palette: Ink Navy #1B2A41 · Canvas Cream #F5EEDE · Surface Cream #FBF8F1
// Marigold Gold #C6941E (buttons/highlights) · Brick Maroon #7A2A28 (tags/accents)
// Wishlist heart uses maroon everywhere else in the app (ProductCard,
// ProductPage) — carried that convention through here instead of rose.

export default function WishlistTab() {
    const router = useRouter();
    const {
        data: wishlist = [],
        isLoading: wishlistLoading,
        isError,
        error,
        refetch,
        isFetching,
    } = useGetWishlist();

    const { mutate: removeWishlist, isPending: removingWishlist } = useRemoveWishlist();

    if (isError) {
        return (
            <QueryError
                title="Failed loading wishlist"
                message={(error as any)?.response?.data?.message}
                retry={refetch}
                loading={isFetching}
            />
        );
    }

    return (
        <div className="bg-[#FBF8F1] rounded-2xl border border-[#1B2A41]/10 shadow-sm p-6 animate-in fade-in-50 duration-200">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-base font-bold text-[#1B2A41]">My Wishlist</h3>
                    <p className="text-xs text-[#1B2A41]/40">Your saved favorite products.</p>
                </div>
                <Badge className="bg-[#7A2A28]/10 text-[#7A2A28] border border-[#7A2A28]/15">
                    {wishlist.length} Items
                </Badge>
            </div>

            {wishlistLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {[1, 2, 3].map((item) => (
                        <div key={item} className="h-52 rounded-2xl bg-[#1B2A41]/5 animate-pulse" />
                    ))}
                </div>
            ) : wishlist.length === 0 ? (
                <div className="text-center py-10 space-y-3">
                    <div className="w-12 h-12 rounded-xl bg-[#C6941E]/15 flex items-center justify-center mx-auto text-[#C6941E]">
                        <Heart className="w-5 h-5" />
                    </div>
                    <div>
                        <h4 className="font-bold text-sm text-[#1B2A41]">Your Wishlist is Empty</h4>
                        <p className="text-xs text-[#1B2A41]/40 mt-1">Save products you love.</p>
                    </div>
                    <Button
                        onClick={() => router.push("/shop")}
                        className="bg-[#C6941E] hover:bg-[#A87A14] text-[#1B2A41] hover:text-[#FBF8F1] rounded-xl cursor-pointer"
                    >
                        Explore Designs
                    </Button>
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {wishlist.map((item: any) => {
                        const product = item.productId;
                        if (!product) return null; // guard against a product that was deleted but still referenced

                        const hasDiscount =
                            !!product.discountPrice && product.discountPrice < product.price;

                        return (
                            <div
                                key={item._id}
                                className="border border-[#1B2A41]/10 rounded-2xl overflow-hidden hover:shadow-md transition-all bg-[#FBF8F1]"
                            >
                                <div
                                    onClick={() => router.push(`/shop/${product.slug}`)}
                                    className="relative w-full aspect-[4/5] cursor-pointer bg-[#F5EEDE]"
                                >
                                    <Image
                                        src={product.thumbnail || "/images/Bag1.jpeg"}
                                        alt={product.title}
                                        fill
                                        sizes="(max-width: 768px) 100vw, (max-width: 1280px) 50vw, 33vw"
                                        className="object-cover"
                                    />
                                </div>

                                <div className="p-4 space-y-3">
                                    <h4 className="font-bold text-sm text-[#1B2A41] line-clamp-1">
                                        {product.title}
                                    </h4>
                                    <div className="flex items-center gap-2 flex-wrap">
                                        <span className="font-black text-[#1B2A41]">
                                            ₹{hasDiscount ? product.discountPrice : product.price}
                                        </span>
                                        {hasDiscount && (
                                            <>
                                                <span className="text-[#1B2A41]/35 text-sm line-through">
                                                    ₹{product.price}
                                                </span>
                                                <span className="text-[#A87A14] text-xs font-bold">
                                                    {product.discountPercentage}% OFF
                                                </span>
                                            </>
                                        )}
                                    </div>

                                    <Button
                                        disabled={removingWishlist}
                                        onClick={() => removeWishlist({ productId: product._id })}
                                        variant="outline"
                                        className="w-full rounded-xl border-[#7A2A28]/30 text-[#7A2A28] hover:bg-[#7A2A28]/10 cursor-pointer"
                                    >
                                        <Heart className="w-4 h-4 mr-2 fill-current" />
                                        Remove from Wishlist
                                    </Button>

                                </div>
                            </div>
                        );
                    })}
                </div>
            )}
        </div>
    );
}