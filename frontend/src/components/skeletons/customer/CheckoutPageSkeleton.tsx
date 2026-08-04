import BaseSkeleton from "../BaseSkeleton";
import PageContainer from "@/components/shared/PageContainer";

export default function CheckoutPageSkeleton() {
    return (
        <PageContainer>
            <div className="min-h-screen py-8">
                <div className="grid grid-cols-1 xl:grid-cols-[1.9fr_420px] gap-8">

                    {/* LEFT */}
                    <div className="space-y-6">

                        {/* Address Section */}
                        <div className="border border-[#1B2A41]/10 rounded-xl p-6 space-y-4">
                            <BaseSkeleton className="h-6 w-48" />

                            <BaseSkeleton className="h-12 w-full" />
                            <BaseSkeleton className="h-12 w-full" />
                            <BaseSkeleton className="h-12 w-full" />
                            <BaseSkeleton className="h-12 w-full" />
                        </div>

                        {/* Payment Section */}
                        <div className="border border-[#1B2A41]/10 rounded-xl p-6 space-y-4">
                            <BaseSkeleton className="h-6 w-40" />

                            <BaseSkeleton className="h-14 w-full" />
                            <BaseSkeleton className="h-14 w-full" />
                        </div>

                    </div>

                    {/* RIGHT */}
                    <div>
                        <div className="border border-[#1B2A41]/10 rounded-xl p-6 space-y-4 xl:sticky xl:top-24">

                            <BaseSkeleton className="h-6 w-32" />

                            <BaseSkeleton className="h-4 w-full" />
                            <BaseSkeleton className="h-4 w-full" />
                            <BaseSkeleton className="h-4 w-3/4" />

                            <BaseSkeleton className="h-px w-full" />

                            <BaseSkeleton className="h-6 w-full" />

                            <BaseSkeleton className="h-12 w-full rounded-lg" />

                        </div>
                    </div>

                </div>
            </div>
        </PageContainer>
    );
}