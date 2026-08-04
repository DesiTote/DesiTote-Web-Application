"use client";

import { useState } from "react";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    ResponsiveContainer,
    CartesianGrid,
} from "recharts";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useSalesOverview } from "@/hooks/admin/useDashboard";
import { SalesRange } from "@/types/admin/dashboard.type";

export default function SalesOverview() {
    const [range, setRange] = useState<SalesRange>("week");
    const { data, isLoading, isError, refetch } = useSalesOverview(range);

    return (
        <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0">
                <CardTitle>Sales Overview</CardTitle>

                <div className="flex gap-1 rounded-lg bg-muted p-1 text-sm">
                    {(["week", "month"] as SalesRange[]).map((r) => (
                        <button
                            key={r}
                            onClick={() => setRange(r)}
                            className={`rounded-md px-3 py-1 capitalize transition-colors ${
                                range === r
                                    ? "bg-background font-medium shadow-sm"
                                    : "text-muted-foreground"
                            }`}
                        >
                            {r}
                        </button>
                    ))}
                </div>
            </CardHeader>

            <CardContent>
                <div className="h-[350px]">
                    {isError ? (
                        <div className="flex h-full flex-col items-center justify-center gap-2">
                            <p className="text-sm text-muted-foreground">Couldn't load sales data.</p>
                            <button
                                onClick={() => refetch()}
                                className="text-sm font-medium text-primary underline underline-offset-4"
                            >
                                Retry
                            </button>
                        </div>
                    ) : isLoading || !data ? (
                        <div className="h-full w-full animate-pulse rounded-lg bg-muted" />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="day" />
                                <YAxis />
                                <Tooltip
                                    formatter={(value, name) => {
                                        const numericValue = Number(value ?? 0);
                                        const isRevenue = name === "revenue";

                                        const formatted = isRevenue
                                            ? new Intl.NumberFormat("en-IN", {
                                                  style: "currency",
                                                  currency: "INR",
                                                  maximumFractionDigits: 0,
                                              }).format(numericValue)
                                            : numericValue;

                                        return [formatted, isRevenue ? "Revenue" : "Orders"];
                                    }}
                                />
                                <Line type="monotone" dataKey="revenue" stroke="#166534" strokeWidth={3} />
                                <Line type="monotone" dataKey="orders" stroke="#84cc16" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}