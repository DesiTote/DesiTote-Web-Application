"use client";

import { AlertTriangle } from "lucide-react";
import DeleteAlert from "@/components/shared/DeleteAlert";
import { CANCEL_REASONS, CancelReason } from "@/types/customer/order.type";

interface CancelOrderDialogProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    orderNumber: string;
    isPending: boolean;
    reason: CancelReason | null;
    note: string;
    onReasonChange: (reason: CancelReason) => void;
    onNoteChange: (note: string) => void;
    onConfirm: () => void;
}

export default function CancelOrderDialog({
    open,
    onOpenChange,
    orderNumber,
    isPending,
    reason,
    note,
    onReasonChange,
    onNoteChange,
    onConfirm,
}: CancelOrderDialogProps) {
    const needsNote = reason === "Other";
    const canSubmit = Boolean(reason) && (!needsNote || note.trim().length > 0);

    return (
        <DeleteAlert
            isOpen={open}
            onOpenChange={onOpenChange}
            onConfirm={onConfirm}
            title={`Cancel order ${orderNumber}?`}
            description="This can't be undone. Let us know why you're cancelling — it helps us do better."
            confirmText="Cancel order"
            cancelText="Keep order"
            isPending={isPending}
            isConfirmDisabled={!canSubmit}
        >
            <div className="space-y-2 pt-2">
                {CANCEL_REASONS.map((option) => (
                    <button
                        key={option}
                        type="button"
                        onClick={() => onReasonChange(option)}
                        disabled={isPending}
                        className={`w-full text-left text-sm font-medium rounded-xl border-2 px-4 py-2.5 transition-colors ${reason === option
                                ? "border-pink-500 bg-pink-50 text-slate-900"
                                : "border-slate-200 text-slate-600 hover:border-slate-300"
                            } disabled:opacity-50 disabled:cursor-not-allowed`}
                    >
                        {option}
                    </button>
                ))}
            </div>

            {needsNote && (
                <textarea
                    value={note}
                    onChange={(e) => onNoteChange(e.target.value)}
                    placeholder="Tell us a bit more…"
                    disabled={isPending}
                    maxLength={500}
                    rows={3}
                    className="mt-3 w-full resize-none rounded-xl border border-slate-200 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-pink-500/30 focus:border-pink-400 disabled:opacity-50"
                />
            )}

            <div className="flex items-start gap-2 rounded-xl bg-amber-50 border border-amber-100 px-3 py-2.5 text-xs text-amber-700 mt-3">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>
                    If you paid online, your refund will be initiated automatically and should
                    reflect in 5–7 business days.
                </span>
            </div>
        </DeleteAlert>
    );
}