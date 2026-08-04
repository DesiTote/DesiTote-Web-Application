"use client";

import { useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminOrders } from "@/hooks/admin/useOrder";
import { AdminOrderListItem, OrderStatusBucket, PaymentMethod } from "@/types/admin/order.type";
import { EMPTY_FILTERS, STATUS_OPTIONS, PAYMENT_OPTIONS, STATUS_BADGE_CLASS } from "@/constants/admin/order.constant";

 
export default function OrdersTable() {
    const router = useRouter();
 
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState<OrderStatusBucket | "">(EMPTY_FILTERS.status);
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod | "">(EMPTY_FILTERS.paymentMethod);
    const [dateFrom, setDateFrom] = useState(EMPTY_FILTERS.dateFrom);
    const [dateTo, setDateTo] = useState(EMPTY_FILTERS.dateTo);
 
    // Draft = what's typed in the box. Applied = what's actually sent to the
    // API. Search only fires when the button is clicked (or Enter pressed),
    // not on every keystroke.
    const [searchDraft, setSearchDraft] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");
 
    const limit = 5;
 
    const { data, isLoading, isError, refetch, isFetching } = useAdminOrders({
        page,
        limit,
        status: status || undefined,
        paymentMethod: paymentMethod || undefined,
        dateFrom: dateFrom || undefined,
        dateTo: dateTo || undefined,
        search: appliedSearch || undefined,
    });
 
    function resetToFirstPage<T>(setter: (v: T) => void) {
        return (v: T) => {
            setter(v);
            setPage(1);
        };
    }
 
    function handleSearch() {
        setAppliedSearch(searchDraft.trim());
        setPage(1);
    }
 
    function handleClearFilters() {
        setStatus(EMPTY_FILTERS.status);
        setPaymentMethod(EMPTY_FILTERS.paymentMethod);
        setDateFrom(EMPTY_FILTERS.dateFrom);
        setDateTo(EMPTY_FILTERS.dateTo);
        setSearchDraft("");
        setAppliedSearch(""); // this is what actually makes search results disappear
        setPage(1);
    }
 
    const hasActiveFilters =
        Boolean(status) || Boolean(paymentMethod) || Boolean(dateFrom) || Boolean(dateTo) || Boolean(appliedSearch);
 
    return (
        <Card>
            <CardHeader>
                <CardTitle>Manage Orders</CardTitle>
            </CardHeader>
 
            <CardContent>
                {/* Filters */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search order #, email, phone, AWB..."
                        value={searchDraft}
                        onChange={(e) => setSearchDraft(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                        className="min-w-[240px] flex-1 rounded-md border px-3 py-2 text-sm"
                    />
                    <button
                        onClick={handleSearch}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
                    >
                        Search
                    </button>
 
                    <select
                        value={status}
                        onChange={(e) => resetToFirstPage(setStatus)(e.target.value as OrderStatusBucket | "")}
                        className="rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="">All statuses</option>
                        {STATUS_OPTIONS.map((s) => (
                            <option key={s} value={s}>
                                {s}
                            </option>
                        ))}
                    </select>
 
                    <select
                        value={paymentMethod}
                        onChange={(e) =>
                            resetToFirstPage(setPaymentMethod)(e.target.value as PaymentMethod | "")
                        }
                        className="rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="">All payment methods</option>
                        {PAYMENT_OPTIONS.map((p) => (
                            <option key={p} value={p}>
                                {p}
                            </option>
                        ))}
                    </select>
 
                    <input
                        type="date"
                        value={dateFrom}
                        onChange={(e) => resetToFirstPage(setDateFrom)(e.target.value)}
                        className="rounded-md border px-3 py-2 text-sm"
                    />
                    <input
                        type="date"
                        value={dateTo}
                        onChange={(e) => resetToFirstPage(setDateTo)(e.target.value)}
                        className="rounded-md border px-3 py-2 text-sm"
                    />
 
                    {hasActiveFilters && (
                        <button
                            onClick={handleClearFilters}
                            className="rounded-md border px-4 py-2 text-sm font-medium text-muted-foreground hover:bg-muted"
                        >
                            Clear filters
                        </button>
                    )}
                </div>
 
                {/* Table */}
                {isError ? (
                    <div className="flex flex-col items-center justify-center gap-2 py-16">
                        <p className="text-sm text-muted-foreground">Couldn't load orders.</p>
                        <button
                            onClick={() => refetch()}
                            className="text-sm font-medium text-primary underline underline-offset-4"
                        >
                            Retry
                        </button>
                    </div>
                ) : (
                    <div className="overflow-x-auto rounded-lg border">
                        <table className="w-full text-sm">
                            <thead className="bg-muted/50 text-left text-muted-foreground">
                                <tr>
                                    <th className="px-4 py-3 font-medium">Order #</th>
                                    <th className="px-4 py-3 font-medium">Customer</th>
                                    <th className="px-4 py-3 font-medium">Date</th>
                                    <th className="px-4 py-3 font-medium">Items</th>
                                    <th className="px-4 py-3 font-medium">Amount</th>
                                    <th className="px-4 py-3 font-medium">Payment</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">AWB / Courier</th>
                                </tr>
                            </thead>
                            <tbody>
                                {isLoading || !data ? (
                                    Array.from({ length: 8 }).map((_, i) => (
                                        <tr key={i} className="border-t">
                                            <td colSpan={8} className="px-4 py-3">
                                                <div className="h-5 w-full animate-pulse rounded bg-muted" />
                                            </td>
                                        </tr>
                                    ))
                                ) : data.orders.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                                            No orders found.
                                        </td>
                                    </tr>
                                ) : (
                                    data.orders.map((order) => (
                                        <OrderRow
                                            key={order._id}
                                            order={order}
                                            onClick={() => router.push(`/manage-orders/${order._id}`)}
                                        />
                                    ))
                                )}
                            </tbody>
                        </table>
                    </div>
                )}
 
                {/* Pagination */}
                {data && data.pagination.totalPages > 1 && (
                    <div className="mt-4 flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                            Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} orders
                            {isFetching && " · updating..."}
                        </span>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setPage((p) => Math.max(1, p - 1))}
                                disabled={page <= 1}
                                className="rounded-md border px-3 py-1.5 disabled:opacity-40"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => setPage((p) => Math.min(data.pagination.totalPages, p + 1))}
                                disabled={page >= data.pagination.totalPages}
                                className="rounded-md border px-3 py-1.5 disabled:opacity-40"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
 
function OrderRow({ order, onClick }: { order: AdminOrderListItem; onClick: () => void }) {
    return (
        <tr onClick={onClick} className="cursor-pointer border-t hover:bg-muted/40">
            <td className="px-4 py-3 font-medium">{order.orderNumber}</td>
            <td className="px-4 py-3">
                <div>{order.customerName}</div>
                <div className="text-xs text-muted-foreground">{order.billingEmail}</div>
            </td>
            <td className="px-4 py-3">
                {new Date(order.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}
            </td>
            <td className="px-4 py-3">{order.itemsCount}</td>
            <td className="px-4 py-3">
                {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                }).format(order.grandTotal)}
            </td>
            <td className="px-4 py-3">
                <div>{order.paymentMethod}</div>
                <div className="text-xs text-muted-foreground capitalize">{order.paymentStatus}</div>
            </td>
            <td className="px-4 py-3">
                {order.statusBucket && (
                    <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${STATUS_BADGE_CLASS[order.statusBucket]}`}
                    >
                        {order.statusBucket}
                    </span>
                )}
            </td>
            <td className="px-4 py-3 text-xs">
                {order.awb ? (
                    <>
                        <div>{order.awb}</div>
                        <div className="text-muted-foreground">{order.courierName}</div>
                    </>
                ) : (
                    <span className="text-muted-foreground">Not shipped</span>
                )}
            </td>
        </tr>
    );
}
 




