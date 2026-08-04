// components/skeletons/ProductCardSkeleton.tsx
import BaseSkeleton from "../BaseSkeleton";

export default function ProductCardSkeleton() {
  return (
    <div className="bg-white rounded-xl sm:rounded-2xl border border-slate-100 p-3 sm:p-4 flex flex-col h-full mx-auto w-full max-w-[340px] sm:max-w-none space-y-3 sm:space-y-4">
      
      {/* Image Stage Placeholder (Square on mobile, h-64 on desktop) */}
      <BaseSkeleton className="w-full aspect-square sm:h-64 rounded-lg sm:rounded-xl" />

      {/* Content Info Stack */}
      <div className="space-y-2 flex-1">
        {/* Product Title Line */}
        <BaseSkeleton className="h-4 w-2/3" />
        
        {/* Product Description Lines */}
        <div className="space-y-1 pt-1">
          <BaseSkeleton className="h-3 w-full" />
          <BaseSkeleton className="h-3 w-4/5" />
        </div>
      </div>

      {/* Price & Wishlist Row */}
      <div className="flex items-center justify-between pt-1">
        {/* Price Blocks */}
        <div className="flex items-center gap-2">
          <BaseSkeleton className="h-5 w-14" /> {/* Current Price */}
          <BaseSkeleton className="h-4 w-10" /> {/* Original Price */}
        </div>
        {/* Heart Icon Button */}
        <BaseSkeleton className="h-8 w-8 rounded-full shrink-0" />
      </div>

      {/* Add To Cart Button Area */}
      <div className="w-full pt-1">
        <BaseSkeleton className="w-full h-10 sm:h-12 rounded-lg sm:rounded-xl" />
      </div>

    </div>
  );
}