"use client";

import { useState } from "react";
import { Loader2, Minus, Plus } from "lucide-react";
import { useReturnableItems, useCreateReturnRequest } from "@/hooks/customer/useHook";
import { ReturnReason, ReturnRequestItemInput, RETURN_REASONS } from "@/types/customer/return.type";
 

interface SelectedItem {
    quantity: number;
    reason: ReturnReason | "";
    note: string;
}

export default function ReturnRequestForm({
    orderId,
    onClose,
}: {
    orderId: string;
    onClose: () => void;
}) {
    const { data, isLoading } = useReturnableItems(orderId);
    const { mutate: submitReturn, isPending } = useCreateReturnRequest(orderId);

    // Keyed by productId — only items present here are "selected" for this return
    const [selected, setSelected] = useState<Record<string, SelectedItem>>({});

    if (isLoading || !data) {
        return <div className="h-32 w-full animate-pulse rounded-xl bg-[#F5EEDE]" />;
    }

    if (!data.eligible || data.items.length === 0) return null;

    function toggleItem(productId: string, maxQty: number) {
        setSelected((prev) => {
            const next = { ...prev };
            if (next[productId]) {
                delete next[productId];
            } else {
                next[productId] = { quantity: 1, reason: "", note: "" };
            }
            return next;
        });
    }

    function updateQuantity(productId: string, delta: number, maxQty: number) {
        setSelected((prev) => {
            const current = prev[productId];
            if (!current) return prev;
            const newQty = Math.min(maxQty, Math.max(1, current.quantity + delta));
            return { ...prev, [productId]: { ...current, quantity: newQty } };
        });
    }

    function updateReason(productId: string, reason: ReturnReason) {
        setSelected((prev) => ({ ...prev, [productId]: { ...prev[productId], reason } }));
    }

    function updateNote(productId: string, note: string) {
        setSelected((prev) => ({ ...prev, [productId]: { ...prev[productId], note } }));
    }

    const selectedEntries = Object.entries(selected);
    const canSubmit =
        selectedEntries.length > 0 &&
        selectedEntries.every(
            ([, item]) => item.reason && (item.reason !== "Other" || item.note.trim())
        );

    function handleSubmit() {
        const items: ReturnRequestItemInput[] = selectedEntries.map(([productId, item]) => ({
            productId,
            quantity: item.quantity,
            reason: item.reason as ReturnReason,
            note: item.note.trim() || undefined,
        }));

        submitReturn(items, { onSuccess: () => onClose() });
    }

    return (
        <div className="space-y-4">
            {data.items.map((item) => {
                const isSelected = Boolean(selected[item.productId]);
                const itemState = selected[item.productId];

                return (
                    <div
                        key={item.productId}
                        className={`rounded-xl border p-4 transition-colors ${isSelected ? "border-[#C6941E]/60 bg-white" : "border-[#1B2A41]/10 bg-white/50"
                            }`}
                    >
                        <div className="flex items-center gap-3">
                            <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => toggleItem(item.productId, item.remainingReturnable)}
                                className="h-4 w-4 accent-[#C6941E]"
                            />
                            <div className="flex-1 min-w-0">
                                <p className="font-semibold text-sm text-[#1B2A41] truncate">{item.name}</p>
                                <p className="text-xs text-[#1B2A41]/40">
                                    {item.remainingReturnable} of {item.orderedQuantity} eligible for return
                                </p>
                            </div>

                            {isSelected && item.remainingReturnable > 1 && (
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={() => updateQuantity(item.productId, -1, item.remainingReturnable)}
                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-[#1B2A41]/15 text-[#1B2A41]"
                                    >
                                        <Minus className="h-3 w-3" />
                                    </button>
                                    <span className="w-5 text-center text-sm font-bold text-[#1B2A41]">
                                        {itemState.quantity}
                                    </span>
                                    <button
                                        onClick={() => updateQuantity(item.productId, 1, item.remainingReturnable)}
                                        className="flex h-7 w-7 items-center justify-center rounded-full border border-[#1B2A41]/15 text-[#1B2A41]"
                                    >
                                        <Plus className="h-3 w-3" />
                                    </button>
                                </div>
                            )}
                        </div>

                        {isSelected && (
                            <div className="mt-3 space-y-2 pl-7">
                                <select
                                    value={itemState.reason}
                                    onChange={(e) => updateReason(item.productId, e.target.value as ReturnReason)}
                                    className="w-full rounded-lg border border-[#1B2A41]/10 bg-white px-3 py-2 text-sm text-[#1B2A41]"
                                >
                                    <option value="">Select a reason...</option>
                                    {RETURN_REASONS.map((r) => (
                                        <option key={r} value={r}>
                                            {r}
                                        </option>
                                    ))}
                                </select>

                                {itemState.reason === "Other" && (
                                    <textarea
                                        value={itemState.note}
                                        onChange={(e) => updateNote(item.productId, e.target.value)}
                                        placeholder="Tell us a bit more..."
                                        rows={2}
                                        className="w-full rounded-lg border border-[#1B2A41]/10 bg-white px-3 py-2 text-sm text-[#1B2A41] resize-none"
                                    />
                                )}
                            </div>
                        )}
                    </div>
                );
            })}

            <div className="flex gap-2 pt-2">
                <button
                    onClick={handleSubmit}
                    disabled={!canSubmit || isPending}
                    className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-[#C6941E] py-3 text-sm font-bold text-[#1B2A41] hover:bg-[#A87A14] hover:text-[#FBF8F1] transition-colors disabled:opacity-50"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="h-4 w-4 animate-spin" /> Submitting...
                        </>
                    ) : (
                        `Submit Return${selectedEntries.length > 1 ? ` (${selectedEntries.length} items)` : ""}`
                    )}
                </button>
                <button
                    onClick={onClose}
                    className="rounded-xl border border-[#1B2A41]/15 px-5 py-3 text-sm font-bold text-[#1B2A41]/60 hover:bg-[#1B2A41]/5"
                >
                    Cancel
                </button>
            </div>
        </div>
    );
}