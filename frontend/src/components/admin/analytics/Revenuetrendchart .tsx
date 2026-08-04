"use client";

import { useState } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useRevenueTrend } from "@/hooks/admin/useAnalytics";
import { TrendRange } from "@/types/admin/analytics.type";
 

const inr = (v: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

export default function RevenueTrendChart() {
    const [range, setRange] = useState<TrendRange>("month");
    const { data, isLoading, isError, refetch } = useRevenueTrend(range);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Revenue Trend</CardTitle>
                <div className="flex gap-1 rounded-lg bg-muted p-1 text-sm">
                    {(["month", "quarter"] as TrendRange[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`rounded-md px-3 py-1 capitalize transition-colors ${
                                range === r ? "bg-background font-medium shadow-sm" : "text-muted-foreground"
                            }`}
                        >
                            {r}ly
                        </button>
                    ))}
                </div>
            </CardHeader>
            <CardContent>
                <div className="h-[320px]">
                    {isError ? (
                        <div className="flex h-full flex-col items-center justify-center gap-2">
                            <p className="text-sm text-muted-foreground">Couldn't load revenue trend.</p>
                            <button onClick={() => refetch()} className="text-sm font-medium text-primary underline underline-offset-4">
                                Retry
                            </button>
                        </div>
                    ) : isLoading || !data ? (
                        <div className="h-40 w-full animate-pulse rounded-lg bg-slate-200" />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) => [
                                        name === "revenue" ? inr(Number(value ?? 0)) : value,
                                        name === "revenue" ? "Revenue" : "Orders",
                                    ]}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#166534" strokeWidth={3} />
                                <Line type="monotone" dataKey="orders" stroke="#84cc16" strokeWidth={2} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}