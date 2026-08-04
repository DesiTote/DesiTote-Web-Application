"use client";

import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useNewSignupsTrend } from "@/hooks/admin/useAnalytics";

export default function NewSignupsChart() {
   const { data, isLoading, isError, refetch } = useNewSignupsTrend();
 
    return (
        <Card>
            <CardHeader>
                <CardTitle>New Signups</CardTitle>
            </CardHeader>
            <CardContent>
                <div className="h-[280px] w-full">
                    {isError ? (
                        <div className="flex h-full flex-col items-center justify-center gap-2">
                            <p className="text-sm text-muted-foreground">Couldn't load signups.</p>
                            <button onClick={() => refetch()} className="text-sm font-medium text-primary underline underline-offset-4">
                                Retry
                            </button>
                        </div>
                    ) : isLoading || !data ? (
                       <div className="h-40 w-full animate-pulse rounded-lg bg-slate-200" />
                    ) : (
                        <ResponsiveContainer width="100%" height="100%" minWidth={0} debounce={200}>
                            <LineChart data={data}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                                <XAxis dataKey="label" />
                                <YAxis allowDecimals={false} domain={[0, "dataMax + 1"]} />
                                <Tooltip formatter={(value) => [value, "New signups"]} />
                                <Line type="monotone" dataKey="signups" stroke="#2563eb" strokeWidth={3} />
                            </LineChart>
                        </ResponsiveContainer>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}