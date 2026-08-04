"use client";

import { Card, CardContent } from "@/components/ui/card";
import { ShoppingBag, IndianRupee, Users, Package } from "lucide-react";
import { useDashboardStats } from "@/hooks/admin/useDashboard";
import { DashboardStats as DashboardStatsType } from "@/types/admin/dashboard.type";

const STAT_META = [
    {
        key: "totalOrders" as const,
        title: "Total Orders",
        icon: ShoppingBag,
        color: "text-green-600",
        bg: "bg-green-50",
        format: (v: number) => v.toLocaleString("en-IN"),
    },
    {
        key: "totalRevenue" as const,
        title: "Total Revenue",
        icon: IndianRupee,
        color: "text-purple-600",
        bg: "bg-purple-50",
        format: (v: number) =>
            new Intl.NumberFormat("en-IN", {
                style: "currency",
                currency: "INR",
                maximumFractionDigits: 0,
            }).format(v),
    },
    {
        key: "totalUsers" as const,
        title: "Total Users",
        icon: Users,
        color: "text-blue-600",
        bg: "bg-blue-50",
        format: (v: number) => v.toLocaleString("en-IN"),
    },
    {
        key: "totalProducts" as const,
        title: "Total Products",
        icon: Package,
        color: "text-orange-600",
        bg: "bg-orange-50",
        format: (v: number) => v.toLocaleString("en-IN"),
    },
];

export default function DashboardStats() {
    const { data, isLoading, isError, refetch } = useDashboardStats();

    if (isError) {
        return (
            <Card>
                <CardContent className="p-5 flex items-center justify-between">
                    <p className="text-sm text-muted-foreground">Couldn't load dashboard stats.</p>
                    <button
                        onClick={() => refetch()}
                        className="text-sm font-medium text-primary underline underline-offset-4"
                    >
                        Retry
                    </button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
            {STAT_META.map((item) => (
                <Card key={item.key}>
                    <CardContent className="p-5 flex items-center justify-between">
                        <div>
                            <p className="text-sm text-muted-foreground">{item.title}</p>

                            {isLoading || !data ? (
                                <div className="mt-2 h-8 w-24 animate-pulse rounded bg-muted" />
                            ) : (
                                <h2 className="mt-2 text-3xl font-bold">
                                    {item.format(data[item.key as keyof DashboardStatsType])}
                                </h2>
                            )}
                        </div>

                        <div className={`rounded-xl p-4 ${item.bg}`}>
                            <item.icon className={`h-7 w-7 ${item.color}`} />
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}