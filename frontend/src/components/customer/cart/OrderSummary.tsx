"use client";

import { Loader2, Info, Undo2 } from "lucide-react";
import BaseSkeleton from "@/components/skeletons/BaseSkeleton";

// Brand palette: Ink Navy #1B2A41 · Canvas Cream #F5EEDE · Surface Cream #FBF8F1
// Marigold Gold #C6941E (buttons/highlights, purchase actions)

interface OrderSummaryProps {
    subtotal: number;
    isLoading: boolean;
    isDisabled: boolean;
    onCheckout?: () => void;
}

export default function OrderSummary({
    subtotal,
    isLoading,
    isDisabled,
    onCheckout
}: OrderSummaryProps) {
    return (
        <div>
            <h2 className="text-lg font-black text-[#1B2A41] mb-5 border-b border-[#1B2A41]/10 pb-3">
                Order Summary
            </h2>

            {/* Calculations Node */}
            <div className="space-y-4 border-b border-[#1B2A41]/10 pb-5">
                <div className="flex justify-between text-sm text-[#1B2A41]/60 font-medium">
                    <span>Subtotal</span>
                    {isLoading ? (
                        <BaseSkeleton className="h-5 w-16 rounded" />
                    ) : (
                        <span className="font-bold text-[#1B2A41]">
                            ₹{subtotal.toLocaleString("en-IN")}
                        </span>
                    )}
                </div>

                {/* Note: shipping charges, discounts, and GST are only known
                    once the order is placed, so we don't show placeholder
                    values for them here. */}
                <div className="flex items-start gap-2 text-[11px] font-semibold text-[#1B2A41]/50 bg-[#1B2A41]/5 rounded-lg px-3 py-2.5">
                    <Info className="w-3.5 h-3.5 text-[#1B2A41]/50 shrink-0 mt-0.5" />
                    <span>
                        Shipping charges, applicable discounts, and GST will be
                        calculated and added after checkout.
                    </span>
                </div>
            </div>

            {/* Total Block */}
            <div className="flex items-center justify-between py-5">
                <span className="text-sm sm:text-base font-black text-[#1B2A41]">
                    Grand Total
                </span>
                {isLoading ? (
                    <BaseSkeleton className="h-7 w-24 rounded-lg" />
                ) : (
                    <span className="text-xl sm:text-2xl font-black text-[#1B2A41] tracking-tight">
                        ₹{subtotal.toLocaleString("en-IN")}
                    </span>
                )}
            </div>

            {/* Core Action CTA */}
            <button
                type="button"
                onClick={onCheckout}
                disabled={isDisabled}
                className={`w-full h-14 border rounded-xl font-bold uppercase tracking-wide text-sm transition-all duration-200 flex items-center justify-center gap-2.5 ${isDisabled
                    ? "bg-[#1B2A41]/10 border-[#1B2A41]/10 text-[#1B2A41]/35 cursor-not-allowed"
                    : "bg-[#C6941E] hover:bg-[#A87A14] border-[#C6941E] text-[#1B2A41] hover:text-[#FBF8F1] shadow-lg shadow-[#C6941E]/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    }`}
            >
                {isLoading ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Processing Cart.</span>
                    </>
                ) : isDisabled && subtotal === 0 ? (
                    "Select Items to Continue"
                ) : (
                    "Proceed to Checkout"
                )}
            </button>

            {/* Order Policy Note */}
            <div className="flex items-start gap-2 pt-4 mt-5 text-[11px] font-semibold text-[#1B2A41]/50">
                <Undo2 className="w-4 h-4 text-[#1B2A41]/40 shrink-0 mt-0.5" />
                <span>
                    Orders can't be cancelled once placed — they can only be
                    returned after delivery.
                </span>
            </div>
        </div>
    );
}