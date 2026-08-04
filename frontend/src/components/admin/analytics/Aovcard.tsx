"use client";

import { LineChart, Line, XAxis, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAov } from "@/hooks/admin/useAnalytics";

const inr = (v: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

export default function AovCard() {
    const { data, isLoading, isError, refetch } = useAov();

    return (
        <Card>
            <CardHeader>
                <CardTitle>Average Order Value</CardTitle>
            </CardHeader>
            <CardContent>
                {isError ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-10">
                        <p className="text-sm text-muted-foreground">Couldn't load AOV.</p>
                        <button onClick={() => refetch()} className="text-sm font-medium text-primary underline underline-offset-4">
                            Retry
                        </button>
                    </div>
                ) : isLoading || !data ? (
                    <div className="h-40 w-full animate-pulse rounded-lg bg-muted" />
                ) : (
                    <>
                        <p className="text-3xl font-bold">{inr(data.overallAov)}</p>
                        <p className="mb-4 text-sm text-muted-foreground">
                            across {data.totalOrders.toLocaleString("en-IN")} orders
                        </p>

                        <div className="h-[120px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <LineChart data={data.trend}>
                                    <XAxis dataKey="label" tick={{ fontSize: 11 }} axisLine={false} tickLine={false} />
                                    <Tooltip formatter={(value) => [inr(Number(value ?? 0)), "AOV"]} />
                                    <Line type="monotone" dataKey="aov" stroke="#7c3aed" strokeWidth={2} dot={false} />
                                </LineChart>
                            </ResponsiveContainer>
                        </div>
                    </>
                )}
            </CardContent>
        </Card>
    );
}