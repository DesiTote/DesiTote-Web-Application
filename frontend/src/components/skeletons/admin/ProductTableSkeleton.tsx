// components/admin/products/ProductTableSkeleton.tsx
import BaseSkeleton from "@/components/skeletons/BaseSkeleton";

export default function ProductTableSkeleton() {
    return (
        <div className="bg-white rounded-xl border border-gray-100 overflow-hidden shadow-sm">
            {/* Table Header Mirror */}
            <div className="h-12 bg-gray-50 border-b flex items-center px-4 gap-6">
                <BaseSkeleton className="h-4 w-1/3" />
                <BaseSkeleton className="h-4 w-1/6" />
                <BaseSkeleton className="h-4 w-1/12" />
                <BaseSkeleton className="h-4 w-1/12" />
                <BaseSkeleton className="h-4 w-1/12" />
            </div>
            {/* Table Rows Mirror */}
            {[...Array(5)].map((_, idx) => (
                <div key={idx} className="h-20 border-b flex items-center px-4 gap-6">
                    <div className="flex items-center gap-3 w-1/3">
                        <BaseSkeleton className="w-12 h-12 rounded-lg" />
                        <div className="space-y-2 flex-1">
                            <BaseSkeleton className="h-4 w-3/4" />
                            <BaseSkeleton className="h-3 w-1/2" />
                        </div>
                    </div>
                    <BaseSkeleton className="h-4 w-1/6" />
                    <BaseSkeleton className="h-4 w-1/12" />
                    <BaseSkeleton className="h-4 w-1/12" />
                    <BaseSkeleton className="h-6 w-1/12 rounded-full" />
                </div>
            ))}
        </div>
    );
}