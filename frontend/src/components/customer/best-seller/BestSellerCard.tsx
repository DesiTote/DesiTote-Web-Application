"use client";

import Link from "next/link";
import Image from "next/image";
import { StorefrontBestseller } from "@/types/customer/product.type";

const BADGE_STYLES: Record<string, string> = {
    Bestseller: "bg-slate-900 text-white",
    "Eco Pick": "bg-rose-900 text-white",
    New: "bg-amber-600 text-white",
    Limited: "bg-slate-900 text-white",
};

export default function ProductCard({ product }: { product: StorefrontBestseller }) {
    const badgeClass = BADGE_STYLES[product.badge] ?? "bg-slate-900 text-white";

    return (
        <div className="flex h-full flex-col">
            {/* Top Image Link */}
            <Link href={`/shop/${product.slug}`} className="group block">
                <div className="relative aspect-[852/1280] w-full overflow-hidden bg-muted">
                    <Image
                        src={product.thumbnail}
                        alt={product.title}
                        fill
                        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                    />

                    {product.badge && (
                        <span
                            className={`absolute left-3 top-3 rounded px-2 py-1 text-[10px] font-bold uppercase tracking-wider ${badgeClass}`}
                        >
                            {product.badge}
                        </span>
                    )}
                </div>
            </Link>

            {/* Content Container - Flex-1 expands to push the button down */}
            <div className="mt-3 flex flex-1 flex-col space-y-1">
                {/* Title (Truncated to 1 line) */}
                <Link href={`/shop/${product.slug}`}>
                    <h3 className="line-clamp-1 font-serif text-lg text-slate-900 hover:underline">
                        {product.title}
                    </h3>
                </Link>

                {/* Short Description (Truncated to 1 line) */}
                <p className="line-clamp-1 text-sm text-slate-500">
                    {product.shortDescription}
                </p>

                {/* Price */}
                <p className="text-lg font-semibold text-slate-900">
                    ₹{product.discountPrice.toLocaleString("en-IN")}
                    {product.discountPercentage > 0 && (
                        <span className="ml-2 text-sm font-normal text-slate-400 line-through">
                            ₹{product.price.toLocaleString("en-IN")}
                        </span>
                    )}
                </p>

                {/* Button Container forced to bottom */}
                <div className="mt-auto pt-3">
                    <Link
                        href={`/shop/${product.slug}`}
                        className="block w-full border border-slate-200 py-3 text-center text-sm font-medium text-slate-900 transition-colors hover:bg-slate-900 hover:text-white"
                    >
                        Shop Now
                    </Link>
                </div>
            </div>
        </div>
    );
}