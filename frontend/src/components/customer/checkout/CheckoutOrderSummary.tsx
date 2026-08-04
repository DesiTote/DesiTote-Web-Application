"use client";

import { Info, Loader2, ShieldCheck } from "lucide-react";
import BaseSkeleton from "@/components/skeletons/BaseSkeleton";

// Brand palette: Ink Navy #1B2A41 · Canvas Cream #F5EEDE · Surface Cream #FBF8F1
// Marigold Gold #C6941E (buttons/highlights, purchase actions)
// Brick Maroon #7A2A28 (tags/accents — applied discount)
// FREE shipping badge and the security trust line stay semantic green —
// universal "good news" / "verified" signals, not brand accents.

interface OrderSummaryProps {
    subtotal: number;
    discount?: number;
    gst?: number;

    // null = not yet known (no address selected, or still calculating) —
    // renders differently from 0, which means an actual free-shipping amount.
    shipping: number | null;
    total: number | null;

    // Shown above the button whenever there's something the user needs to
    // know before they can proceed — e.g. "Select an address to see shipping charges",
    // "Calculating shipping charge…", or a not-serviceable error.
    note?: string | null;

    isPlacingOrder?: boolean;
    isDisabled?: boolean;

    onPlaceOrder?: () => void;
}

export default function OrderSummary({
    subtotal,
    discount = 0,
    gst = 0,
    shipping,
    total,
    note,
    isPlacingOrder = false,
    isDisabled = false,
    onPlaceOrder,
}: OrderSummaryProps) {
    const isShippingKnown = shipping !== null;
    const isTotalKnown = total !== null;

    return (
        <div>
            <h2 className="text-lg font-black text-[#1B2A41] mb-5 border-b border-[#1B2A41]/10 pb-3">
                Order Summary
            </h2>

            {/* Calculations */}
            <div className="space-y-4 border-b border-[#1B2A41]/10 pb-5">
                <div className="flex justify-between text-sm text-[#1B2A41]/60 font-medium">
                    <span>Subtotal</span>

                    {isPlacingOrder ? (
                        <BaseSkeleton className="h-5 w-16 rounded" />
                    ) : (
                        <span className="font-bold text-[#1B2A41]">
                            ₹{subtotal.toLocaleString("en-IN")}
                        </span>
                    )}
                </div>

                <div className="flex justify-between text-sm text-[#1B2A41]/60 font-medium">
                    <span>Applied Discount</span>
                    <span className="font-bold text-[#A87A14]">
                        -₹{discount.toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="flex justify-between text-sm text-[#1B2A41]/60 font-medium">
                    <span>GST (18%)</span>
                    <span className="font-bold text-[#1B2A41]">
                        ₹{gst.toLocaleString("en-IN")}
                    </span>
                </div>

                <div className="flex justify-between text-sm text-[#1B2A41]/60 font-medium">
                    <span>Shipping Charge</span>

                    {isPlacingOrder ? (
                        <BaseSkeleton className="h-5 w-16 rounded" />
                    ) : !isShippingKnown ? (
                        <span className="text-[#1B2A41]/35 text-xs font-semibold">—</span>
                    ) : shipping === 0 ? (
                        <span className="font-bold text-green-600 uppercase text-xs bg-green-50 px-2 py-0.5 rounded">
                            FREE
                        </span>
                    ) : (
                        <span className="font-bold text-[#1B2A41]">
                            ₹{shipping.toLocaleString("en-IN")}
                        </span>
                    )}
                </div>
            </div>

            {/* Grand Total */}
            <div className="flex items-center justify-between py-5">
                <span className="text-sm sm:text-base font-black text-[#1B2A41]">
                    Grand Total
                </span>

                {isPlacingOrder ? (
                    <BaseSkeleton className="h-7 w-24 rounded-lg" />
                ) : !isTotalKnown ? (
                    <span className="text-xl sm:text-2xl font-black text-[#1B2A41]/25 tracking-tight">
                        —
                    </span>
                ) : (
                    <span className="text-xl sm:text-2xl font-black text-[#1B2A41] tracking-tight">
                        ₹{total.toLocaleString("en-IN")}
                    </span>
                )}
            </div>

            {/* Contextual note — e.g. "select an address", "calculating…", not-serviceable */}
            {note && (
                <div className="flex items-start gap-2 mb-4 text-xs font-medium text-[#1B2A41]/60 bg-[#1B2A41]/5 rounded-lg px-3 py-2.5">
                    <Info className="w-4 h-4 shrink-0 mt-0.5 text-[#1B2A41]/50" />
                    <span>{note}</span>
                </div>
            )}

            {/* Place Order Button */}
            <button
                type="button"
                onClick={onPlaceOrder}
                disabled={isDisabled || isPlacingOrder}
                className={`w-full h-14 border rounded-xl font-bold uppercase tracking-wide text-sm transition-all duration-200 flex items-center justify-center gap-2.5 ${isDisabled || isPlacingOrder
                    ? "bg-[#1B2A41]/10 border-[#1B2A41]/10 text-[#1B2A41]/35 cursor-not-allowed"
                    : "bg-[#C6941E] hover:bg-[#A87A14] border-[#C6941E] text-[#1B2A41] hover:text-[#FBF8F1] shadow-lg shadow-[#C6941E]/20 hover:scale-[1.01] active:scale-[0.99] cursor-pointer"
                    }`}
            >
                {isPlacingOrder ? (
                    <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        <span>Placing Order...</span>
                    </>
                ) : (
                    "Place Order"
                )}
            </button>

            {/* Trust Badge */}
            <div className="flex flex-col items-center justify-center gap-2 pt-4 mt-5 text-[11px] font-semibold text-[#1B2A41]/45">
                <div className="flex items-center justify-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-green-500 shrink-0" />
                    <span>
                        Secure payments powered by trusted partner Razorpay
                    </span>
                </div>

                <div className="text-center">
                    <span>
                        GST: Printed bags 18% · Non-printed bags 12%
                    </span>
                </div>
            </div>
        </div>
    );
}