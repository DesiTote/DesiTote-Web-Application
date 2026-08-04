import BaseSkeleton from "../BaseSkeleton";

export default function ProductDetailSkeleton() {
    return (
        <div className="container mx-auto py-6 lg:py-10 px-4">
            {/* Back Button */}
            <BaseSkeleton className="h-9 w-28 mb-6 lg:mb-8" />

            <div className="grid gap-10 lg:grid-cols-2 items-start">
                {/* Gallery */}
                <div className="space-y-4">
                    <BaseSkeleton className="aspect-square w-full rounded-3xl" />
                    <div className="flex gap-3">
                        <BaseSkeleton className="h-20 w-20 rounded-xl shrink-0" />
                        <BaseSkeleton className="h-20 w-20 rounded-xl shrink-0" />
                        <BaseSkeleton className="h-20 w-20 rounded-xl shrink-0" />
                        <BaseSkeleton className="h-20 w-20 rounded-xl shrink-0" />
                    </div>
                </div>

                {/* Details */}
                <div className="space-y-6">
                    {/* Category badge + title */}
                    <div className="space-y-3">
                        <BaseSkeleton className="h-6 w-24 rounded-full" />
                        <BaseSkeleton className="h-9 lg:h-10 w-full max-w-md" />
                        <BaseSkeleton className="h-9 lg:h-10 w-2/3 max-w-xs" />
                    </div>

                    {/* Price row */}
                    <div className="flex items-center gap-3">
                        <BaseSkeleton className="h-9 lg:h-10 w-24" />
                        <BaseSkeleton className="h-6 w-16" />
                        <BaseSkeleton className="h-6 w-20 rounded-full" />
                    </div>

                    {/* Short description */}
                    <div className="space-y-2">
                        <BaseSkeleton className="h-4 w-full" />
                        <BaseSkeleton className="h-4 w-5/6" />
                    </div>

                    {/* Stock badge */}
                    <BaseSkeleton className="h-6 w-40 rounded-full" />

                    <div className="h-px w-full bg-slate-100" />

                    {/* Quantity selector */}
                    <BaseSkeleton className="h-12 w-36 rounded-xl" />

                    {/* Action buttons */}
                    <div className="space-y-3 pt-2">
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                            <BaseSkeleton className="h-12 rounded-xl" />
                            <BaseSkeleton className="h-12 rounded-xl" />
                        </div>
                        <BaseSkeleton className="h-12 w-full rounded-xl" />
                    </div>

                    <div className="h-px w-full bg-slate-100" />

                    {/* Specs panel */}
                    <div className="space-y-3">
                        <BaseSkeleton className="h-6 w-36" />
                        <div className="grid grid-cols-2 gap-y-4 border p-4 rounded-xl bg-neutral-50/50">
                            <BaseSkeleton className="h-4 w-16" />
                            <BaseSkeleton className="h-4 w-20 justify-self-end sm:justify-self-start" />
                            <BaseSkeleton className="h-4 w-16" />
                            <BaseSkeleton className="h-4 w-24 justify-self-end sm:justify-self-start" />
                            <BaseSkeleton className="h-4 w-16" />
                            <BaseSkeleton className="h-4 w-14 justify-self-end sm:justify-self-start" />
                        </div>
                    </div>

                    <div className="h-px w-full bg-slate-100" />

                    {/* Why shop with us */}
                    <div className="space-y-3">
                        <BaseSkeleton className="h-6 w-40" />
                        <div className="grid gap-3">
                            <BaseSkeleton className="h-16 rounded-xl" />
                            <BaseSkeleton className="h-16 rounded-xl" />
                            <BaseSkeleton className="h-16 rounded-xl" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}