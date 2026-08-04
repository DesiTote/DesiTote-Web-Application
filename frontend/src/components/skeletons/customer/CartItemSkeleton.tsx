"use client";

import BaseSkeleton from "@/components/skeletons/BaseSkeleton";

interface CartItemSkeletonProps {
    count?: number;
}

export default function CartItemSkeleton({ count = 2 }: CartItemSkeletonProps) {
    return (
        <>
            {Array.from({ length: count }).map((_, idx) => (
                <div 
                    key={idx} 
                    className="bg-white border border-slate-200 rounded-2xl p-4 sm:p-5 shadow-sm animate-pulse"
                >
                    <div className="flex gap-4 items-start">
                        {/* Checkbox Skeleton */}
                        <BaseSkeleton className="w-5 h-5 rounded-md mt-2 shrink-0" />
                        
                        {/* Image Frame Skeleton */}
                        <BaseSkeleton className="w-24 h-24 sm:w-28 sm:h-28 rounded-xl shrink-0" />
                        
                        {/* Content Split Engine */}
                        <div className="flex-1 min-w-0 flex flex-col md:flex-row justify-between gap-4">
                            {/* Product Info Metadata */}
                            <div className="flex-1 space-y-3">
                                <BaseSkeleton className="h-5 w-1/2 rounded-lg" />
                                <BaseSkeleton className="h-4 w-3/4 rounded-lg" />
                                <div className="flex items-center gap-3 pt-2">
                                    <BaseSkeleton className="h-6 w-20 rounded-lg" />
                                    <BaseSkeleton className="h-5 w-24 rounded-lg" />
                                </div>
                            </div>
                            
                            {/* Right Actions Block */}
                            <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-4 pt-3 md:pt-0">
                                <BaseSkeleton className="w-8 h-8 rounded-lg" />
                                <div className="flex items-center gap-2">
                                    <BaseSkeleton className="w-24 h-8 rounded-lg" />
                                </div>
                            </div>
                        </div>
                    </div>
                    
                    {/* Item Subtotal Footer */}
                    <div className="flex justify-end mt-4 pt-3 border-t border-slate-100">
                        <div className="space-y-1.5 flex flex-col items-end">
                            <BaseSkeleton className="h-3 w-14 rounded" />
                            <BaseSkeleton className="h-5 w-20 rounded-lg" />
                        </div>
                    </div>
                </div>
            ))}
        </>
    );
}