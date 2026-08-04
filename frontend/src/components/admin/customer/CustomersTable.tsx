"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminCustomers, useSetCustomerBlocked } from "@/hooks/admin/useCustomer";
import { AdminCustomerListItem } from "@/types/admin/customer.type";


const EMPTY_FILTERS = {
    blocked: "" as "" | "true" | "false",
};

export default function CustomersTable() {
    const [page, setPage] = useState(1);
    const [blockedFilter, setBlockedFilter] = useState<"" | "true" | "false">(EMPTY_FILTERS.blocked);
    const [searchDraft, setSearchDraft] = useState("");
    const [appliedSearch, setAppliedSearch] = useState("");

    const limit = 5;

    const { data, isLoading, isError, refetch, isFetching } = useAdminCustomers({
        page,
        limit,
        search: appliedSearch || undefined,
        blocked: blockedFilter === "" ? undefined : blockedFilter === "true",
    });

    function handleSearch() {
        setAppliedSearch(searchDraft.trim());
        setPage(1);
    }

    function handleClearFilters() {
        setBlockedFilter(EMPTY_FILTERS.blocked);
        setSearchDraft("");
        setAppliedSearch("");
        setPage(1);
    }

    const hasActiveFilters = Boolean(blockedFilter) || Boolean(appliedSearch);

    return (
        <Card>
            <CardHeader>
                <CardTitle>Customers</CardTitle>
            </CardHeader>

            <CardContent>
                {/* Filters */}
                <div className="mb-4 flex flex-wrap items-center gap-3">
                    <input
                        type="text"
                        placeholder="Search name or email..."
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
                        value={blockedFilter}
                        onChange={(e) => {
                            setBlockedFilter(e.target.value as "" | "true" | "false");
                            setPage(1);
                        }}
                        className="rounded-md border px-3 py-2 text-sm"
                    >
                        <option value="">All accounts</option>
                        <option value="false">Active only</option>
                        <option value="true">Blocked only</option>
                    </select>

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
                        <p className="text-sm text-muted-foreground">Couldn't load customers.</p>
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
                                    <th className="px-4 py-3 font-medium">Name</th>
                                    <th className="px-4 py-3 font-medium">Email</th>
                                    <th className="px-4 py-3 font-medium">Joined</th>
                                    <th className="px-4 py-3 font-medium">Orders</th>
                                    <th className="px-4 py-3 font-medium">Total Spent</th>
                                    <th className="px-4 py-3 font-medium">Verified</th>
                                    <th className="px-4 py-3 font-medium">Status</th>
                                    <th className="px-4 py-3 font-medium">Action</th>
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
                                ) : data.customers.length === 0 ? (
                                    <tr>
                                        <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground">
                                            No customers found.
                                        </td>
                                    </tr>
                                ) : (
                                    data.customers.map((customer) => (
                                        <CustomerRow key={customer._id} customer={customer} />
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
                            Page {data.pagination.page} of {data.pagination.totalPages} · {data.pagination.total} customers
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

function CustomerRow({ customer }: { customer: AdminCustomerListItem }) {
    const [confirming, setConfirming] = useState(false);
    const { mutate, isPending } = useSetCustomerBlocked();

    const willBlock = !customer.isAccountBlocked;

    function handleConfirm() {
        mutate(
            { userId: customer._id, blocked: willBlock },
            { onSuccess: () => setConfirming(false) }
        );
    }

    return (
        <tr className="border-t">
            <td className="px-4 py-3 font-medium">{customer.fullName}</td>
            <td className="px-4 py-3">{customer.email}</td>
            <td className="px-4 py-3">
                {new Date(customer.createdAt).toLocaleDateString("en-IN", {
                    day: "2-digit",
                    month: "short",
                    year: "numeric",
                })}
            </td>
            <td className="px-4 py-3">{customer.totalOrders}</td>
            <td className="px-4 py-3">
                {new Intl.NumberFormat("en-IN", {
                    style: "currency",
                    currency: "INR",
                    maximumFractionDigits: 0,
                }).format(customer.totalSpent)}
            </td>
            <td className="px-4 py-3 text-xs">
                <div className={customer.emailVerified ? "text-green-700" : "text-muted-foreground"}>
                    Email {customer.emailVerified ? "✓" : "✗"}
                </div>
                <div className={customer.mobileVerified ? "text-green-700" : "text-muted-foreground"}>
                    Mobile {customer.mobileVerified ? "✓" : "✗"}
                </div>
            </td>
            <td className="px-4 py-3">
                <span
                    className={`rounded-full px-2.5 py-1 text-xs font-medium ${customer.isAccountBlocked ? "bg-red-50 text-red-700" : "bg-green-50 text-green-700"
                        }`}
                >
                    {customer.isAccountBlocked ? "Blocked" : "Active"}
                </span>
            </td>
            <td className="px-4 py-3">
                {!confirming ? (
                    <button
                        onClick={() => setConfirming(true)}
                        className={`rounded-md border px-3 py-1.5 text-xs font-medium ${willBlock
                            ? "border-red-200 text-red-700 hover:bg-red-50"
                            : "border-green-200 text-green-700 hover:bg-green-50"
                            }`}
                    >
                        {willBlock ? "Block" : "Unblock"}
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-xs text-muted-foreground">Sure?</span>
                        <button
                            onClick={handleConfirm}
                            disabled={isPending}
                            className="rounded-md bg-primary px-2 py-1 text-xs font-medium text-primary-foreground disabled:opacity-40"
                        >
                            {isPending ? "..." : "Yes"}
                        </button>
                        <button
                            onClick={() => setConfirming(false)}
                            className="rounded-md border px-2 py-1 text-xs"
                        >
                            No
                        </button>
                    </div>
                )}
            </td>
        </tr>
    );
}