import React from "react";
import BaseSkeleton from "@/components/skeletons/BaseSkeleton"; // Adjust import path to match your layout structure
import PageContainer from "@/components/shared/PageContainer";

export function OrderConfirmationSkeleton() {
    return (
        <PageContainer>
            <div className="w-full space-y-6">
                {/* Header Splash Area */}
                <div className="flex flex-col items-center text-center space-y-4 py-4">
                    <BaseSkeleton className="w-16 h-16 rounded-full" />
                    <BaseSkeleton className="h-7 w-52" />
                    <BaseSkeleton className="h-4 w-80 max-w-xs sm:max-w-md" />
                    <BaseSkeleton className="h-6 w-36 rounded-md" />
                </div>

                {/* Main Content Layout Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

                    {/* Left Side: Order Items and Financial Ledger Summary */}
                    <div className="md:col-span-2 space-y-4">
                        {/* Items Card */}
                        <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4 shadow-sm">
                            <BaseSkeleton className="h-5 w-32 mb-2" />
                            <div className="space-y-4 divide-y divide-border">
                                {[1, 2].map((i) => (
                                    <div key={i} className="flex justify-between items-start pt-3 first:pt-0">
                                        <div className="space-y-2 w-2/3">
                                            <BaseSkeleton className="h-4 w-full" />
                                            <BaseSkeleton className="h-3 w-1/4" />
                                        </div>
                                        <BaseSkeleton className="h-4 w-16" />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Pricing Ledger Card */}
                        <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-4 shadow-sm">
                            <div className="flex justify-between">
                                <BaseSkeleton className="h-4 w-16" />
                                <BaseSkeleton className="h-4 w-12" />
                            </div>
                            <div className="flex justify-between">
                                <BaseSkeleton className="h-4 w-20" />
                                <BaseSkeleton className="h-4 w-12" />
                            </div>
                            <div className="pt-3 border-t flex justify-between">
                                <BaseSkeleton className="h-5 w-24" />
                                <BaseSkeleton className="h-5 w-16" />
                            </div>
                        </div>
                    </div>

                    {/* Right Side: Shipping & Fulfillment Delivery Properties */}
                    <div className="space-y-4">
                        {/* Address Details Card */}
                        <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-3 shadow-sm">
                            <BaseSkeleton className="h-5 w-36 mb-1" />
                            <div className="space-y-2">
                                <BaseSkeleton className="h-4 w-1/2" />
                                <BaseSkeleton className="h-4 w-full" />
                                <BaseSkeleton className="h-4 w-3/4" />
                                <BaseSkeleton className="h-3 w-1/3 pt-1" />
                            </div>
                        </div>

                        {/* Payment Status Method Container */}
                        <div className="rounded-xl border bg-card p-4 sm:p-6 space-y-3 shadow-sm">
                            <BaseSkeleton className="h-5 w-28" />
                            <BaseSkeleton className="h-5 w-24 rounded" />
                            <div className="space-y-2 pt-1">
                                <BaseSkeleton className="h-3 w-full" />
                                <BaseSkeleton className="h-3 w-5/6" />
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </PageContainer>
    );
}