"use client";

import { useReturnableItems, useOrderReturns } from "@/hooks/customer/useHook";
import { RETURN_STATUS_LABELS } from "@/types/customer/return.type";
import { RotateCcw } from "lucide-react";
import { useState } from "react";
import ReturnRequestForm from "./Returnrequestform";

 

const STATUS_BADGE_CLASS: Record<string, string> = {
    requested: "bg-amber-50 text-amber-700",
    approved: "bg-blue-50 text-blue-700",
    rejected: "bg-red-50 text-red-700",
    picked_up: "bg-blue-50 text-blue-700",
    received: "bg-green-50 text-green-700",
    refunded: "bg-green-50 text-green-700",
    cancelled: "bg-slate-100 text-slate-500",
};

export default function ReturnOrderSection({ orderId }: { orderId: string }) {
    const { data: returnable, isLoading: loadingEligibility } = useReturnableItems(orderId);
    const { data: existingReturns } = useOrderReturns(orderId);
    const [isFormOpen, setIsFormOpen] = useState(false);

    const hasExistingReturns = existingReturns && existingReturns.length > 0;

    // Only one return request per order — once ANY return exists (any
    // status), no further requests are allowed. Enforced server-side too;
    // this just keeps the button from ever appearing once that's true.
    const canRequestReturn = returnable?.eligible && returnable.items.length > 0 && !hasExistingReturns;

    if (!loadingEligibility && !canRequestReturn && !hasExistingReturns) return null;

    return (
        <div className="rounded-2xl border border-[#1B2A41]/10 bg-[#FBF8F1] p-5 sm:p-6 space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="flex items-center gap-2 text-sm font-bold text-[#1B2A41]">
                    <RotateCcw className="w-4 h-4 text-[#1B2A41]/40" /> Returns
                </h2>
                {canRequestReturn && returnable?.daysRemaining !== undefined && (
                    <span className="text-xs text-[#1B2A41]/50">
                        {returnable.daysRemaining} day{returnable.daysRemaining === 1 ? "" : "s"} left to request
                    </span>
                )}
            </div>

            {/* Existing return request(s) — read-only once submitted */}
            {hasExistingReturns && (
                <div className="space-y-2">
                    {existingReturns!.map((ret) => (
                        <div
                            key={ret._id}
                            className="rounded-xl border border-[#1B2A41]/10 bg-white p-3 flex items-center justify-between"
                        >
                            <div>
                                <p className="text-xs font-bold text-[#1B2A41]">{ret.returnNumber}</p>
                                <p className="text-xs text-[#1B2A41]/40">
                                    {ret.items.length} item{ret.items.length > 1 ? "s" : ""} ·{" "}
                                    {new Date(ret.createdAt).toLocaleDateString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                    })}
                                </p>
                            </div>
                            <span
                                className={`rounded-full px-2.5 py-1 text-xs font-bold ${STATUS_BADGE_CLASS[ret.status] ?? "bg-slate-100 text-slate-600"
                                    }`}
                            >
                                {RETURN_STATUS_LABELS[ret.status]}
                            </span>
                        </div>
                    ))}
                    <p className="text-xs text-[#1B2A41]/40 pt-1">
                        Only one return request is allowed per order. Contact support if you need to add
                        another item.
                    </p>
                </div>
            )}

            {/* Entry point / form — only shown if NO return exists yet */}
            {canRequestReturn && (
                <>
                    {!isFormOpen ? (
                        <button
                            onClick={() => setIsFormOpen(true)}
                            className="w-full rounded-xl border border-[#1B2A41]/15 py-3 text-sm font-bold text-[#1B2A41] hover:bg-[#1B2A41] hover:text-white transition-colors"
                        >
                            Request a Return
                        </button>
                    ) : (
                        <ReturnRequestForm orderId={orderId} onClose={() => setIsFormOpen(false)} />
                    )}
                </>
            )}
        </div>
    );
}