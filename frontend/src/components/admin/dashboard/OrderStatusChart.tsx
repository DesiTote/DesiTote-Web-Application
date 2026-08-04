"use client";

import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer } from "recharts";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useOrderStatus } from "@/hooks/admin/useDashboard";
import { OrderStatusBucket } from "@/types/admin/dashboard.type";

// Fixed colors per bucket — kept separate from the API response so the
// chart's palette never depends on backend ordering/values.
const STATUS_COLORS: Record<OrderStatusBucket, string> = {
  Pending: "#fbbf24",
  Processing: "#3b82f6",
  Shipped: "#22c55e",
  Delivered: "#8b5cf6",
  Cancelled: "#ef4444",
};

export default function OrderStatusChart() {
  const { data, isLoading, isError, refetch } = useOrderStatus();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Order Status</CardTitle>
      </CardHeader>

      <CardContent>
        {isError ? (
          <div className="flex h-[320px] flex-col items-center justify-center gap-2">
            <p className="text-sm text-muted-foreground">Couldn't load order status.</p>
            <button
              onClick={() => refetch()}
              className="text-sm font-medium text-primary underline underline-offset-4"
            >
              Retry
            </button>
          </div>
        ) : isLoading || !data ? (
          <div className="h-[320px] w-full animate-pulse rounded-lg bg-muted" />
        ) : (
          <div className="grid lg:grid-cols-2 gap-6 items-center">
            <div className="h-[320px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data}
                    innerRadius={70}
                    outerRadius={110}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="status"
                  >
                    {data.map((entry) => (
                      <Cell key={entry.status} fill={STATUS_COLORS[entry.status]} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>

            <div className="space-y-4">
              {data.map((item) => (
                <div key={item.status} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ background: STATUS_COLORS[item.status] }}
                    />
                    <span>{item.status}</span>
                  </div>
                  <span className="font-semibold">{item.count.toLocaleString("en-IN")}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}