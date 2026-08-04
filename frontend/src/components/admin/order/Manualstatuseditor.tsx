"use client";

import { useState } from "react";
import { useUpdateOrderStatus } from "@/hooks/admin/useOrder";
import { ALL_ORDER_STATUSES, OrderStatus } from "@/types/admin/order.type";

export default function ManualStatusEditor({
    orderId,
    currentStatus,
}: {
    orderId: string;
    currentStatus: OrderStatus;
}) {
    const [selectedStatus, setSelectedStatus] = useState<OrderStatus>(currentStatus);
    const [note, setNote] = useState("");
    const [confirming, setConfirming] = useState(false);

    const { mutate, isPending } = useUpdateOrderStatus(orderId);

    const isDirty = selectedStatus !== currentStatus;

    function handleConfirm() {
        mutate(
            { status: selectedStatus, note: note.trim() || undefined },
            {
                onSuccess: () => {
                    setConfirming(false);
                    setNote("");
                },
            }
        );
    }

    return (
        <div className="rounded-lg border p-4">
            <div className="mb-1 flex items-center justify-between">
                <h3 className="font-semibold">Manual status override</h3>
            </div>
            <p className="mb-3 text-xs text-muted-foreground">
                Use this only if a Shiprocket or payment webhook was missed and the order status is stuck.
                This directly overwrites the status and is logged in the order's history.
            </p>

            <div className="flex flex-wrap items-center gap-2">
                <select
                    value={selectedStatus}
                    onChange={(e) => setSelectedStatus(e.target.value as OrderStatus)}
                    className="rounded-md border px-3 py-2 text-sm"
                >
                    {ALL_ORDER_STATUSES.map((s) => (
                        <option key={s} value={s}>
                            {s}
                        </option>
                    ))}
                </select>

                <input
                    type="text"
                    placeholder="Optional note (e.g. 'confirmed with Shiprocket dashboard')"
                    value={note}
                    onChange={(e) => setNote(e.target.value)}
                    className="min-w-[260px] flex-1 rounded-md border px-3 py-2 text-sm"
                />

                {!confirming ? (
                    <button
                        onClick={() => setConfirming(true)}
                        disabled={!isDirty}
                        className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground disabled:opacity-40"
                    >
                        Update status
                    </button>
                ) : (
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-muted-foreground">
                            Set status to <strong>{selectedStatus}</strong>?
                        </span>
                        <button
                            onClick={handleConfirm}
                            disabled={isPending}
                            className="rounded-md bg-primary px-3 py-1.5 text-sm font-medium text-primary-foreground disabled:opacity-40"
                        >
                            {isPending ? "Updating..." : "Confirm"}
                        </button>
                        <button
                            onClick={() => {
                                setConfirming(false);
                                setSelectedStatus(currentStatus);
                            }}
                            className="rounded-md border px-3 py-1.5 text-sm"
                        >
                            Cancel
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}