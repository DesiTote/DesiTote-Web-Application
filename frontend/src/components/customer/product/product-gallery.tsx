"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";

interface Props {
    images: string[];
    active: string;
    setActive: (img: string) => void;
    title: string;
}

export default function ProductGallery({
    images,
    active,
    setActive,
    title,
}: Props) {

    return (
        <div className="flex flex-col lg:flex-row gap-10 items-start">

            {/* Main Featured Image Container */}
            {/* Stays order-1 on mobile (on top) and now also order-1 on desktop (left side) */}
            <div className="relative w-full flex-1 lg:max-w-[450px] aspect-square rounded-3xl overflow-hidden border bg-muted order-1">
                <Image
                    src={active}
                    alt={title}
                    fill
                    priority
                    sizes="(max-width: 768px) 100vw, 450px"
                    className="object-cover transition duration-500 hover:scale-105"
                />
            </div>

            {/* Thumbnail Navigation */}
            {/* order-2 on mobile (below image) and now also order-2 on desktop (right of image, left of text) */}
            <div className="flex lg:flex-col gap-3 order-2 overflow-x-auto lg:overflow-y-auto max-w-full lg:max-h-[450px] shrink-0 py-1 no-scrollbar">
                {images.map((img, index) => (
                    <button
                        key={`${img}-${index}`}
                        onClick={() => setActive(img)}
                        className={cn(
                            "relative h-16 w-16 lg:h-20 lg:w-20 rounded-xl border overflow-hidden cursor-pointer transition shrink-0",
                            active === img
                                ? "border-pink-600 ring-2 ring-pink-500"
                                : "hover:border-pink-400"
                        )}
                    >
                        <Image
                            src={img}
                            alt={`${title} thumbnail ${index + 1}`}
                            fill
                            sizes="(max-width: 1024px) 64px, 80px"
                            className="object-cover"
                        />
                    </button>
                ))}
            </div>

        </div>
    );
}