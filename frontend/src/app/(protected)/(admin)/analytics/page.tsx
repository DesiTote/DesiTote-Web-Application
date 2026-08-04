import AovCard from "@/components/admin/analytics/Aovcard";
import BestSellingProducts from "@/components/admin/analytics/Bestsellingproducts ";
import MostWishlistedProducts from "@/components/admin/analytics/Mostwishlistedproducts";
import NewSignupsChart from "@/components/admin/analytics/NewSignupsChart";
import RevenueTrendChart from "@/components/admin/analytics/Revenuetrendchart ";


export const metadata = {
    title: "Analytics",
};

export default function AnalyticsPage() {
    return (
        <div className="space-y-6 p-6">
            <div>
                <h1 className="text-2xl font-bold">Analytics</h1>
                <p className="text-sm text-muted-foreground">Sales trends, product performance, and growth.</p>
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <div className="lg:col-span-2">
                    <RevenueTrendChart />
                </div>
                <AovCard />
            </div>

            <div className="grid gap-6 lg:grid-cols-3">
                <BestSellingProducts />
                <MostWishlistedProducts />
                <NewSignupsChart />
            </div>
        </div>
    );
}