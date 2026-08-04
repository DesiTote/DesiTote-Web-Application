"use client";

import { useState } from "react";
import { ShoppingBag, ChevronRight, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useRecentOrders, useCancelOrder } from "@/hooks/customer/useOrder";
import CancelOrderDialog from "../order/CancleOrderDialog";
import { RecentOrder, CancelReason } from "@/types/customer/order.type";
import { STATUS_STYLES } from "@/constants/customer/order";

// Brand palette: Ink Navy #1B2A41 · Canvas Cream #F5EEDE · Surface Cream #FBF8F1
// Marigold Gold #C6941E (buttons/highlights) · Brick Maroon #7A2A28 (tags/accents)
//
// Note: STATUS_STYLES (order status badge colors) lives in
// constants/customer/order and wasn't provided, so those badge colors are
// left as-is — worth a pass to align them with the brand palette too.
// The old `ACCENT` constant from that same file is no longer used here;
// the "Details" link now uses the brand gold directly instead.

export default function OrdersTab() {
    const router = useRouter();
    const { data, isLoading, isError } = useRecentOrders();
    const cancelOrder = useCancelOrder();

    const [cancelTarget, setCancelTarget] = useState<RecentOrder | null>(null);
    const [cancelReason, setCancelReason] = useState<CancelReason | null>(null);
    const [cancelNote, setCancelNote] = useState("");

    const orders = data?.data ?? [];

    const handleConfirmCancel = () => {
        if (!cancelTarget || !cancelReason) return;
        cancelOrder.mutate(
            { orderId: cancelTarget.id, reason: cancelReason, note: cancelNote },
            {
                onSuccess: () => {
                    setCancelTarget(null);
                    setCancelReason(null);
                    setCancelNote("");
                },
            }
        );
    };

    const closeCancelDialog = (open: boolean) => {
        if (!open) {
            setCancelTarget(null);
            setCancelReason(null);
            setCancelNote("");
        }
    };

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {[1, 2, 3].map((i) => (
                    <div
                        key={i}
                        className="h-64 w-full rounded-2xl border border-[#1B2A41]/10 bg-[#1B2A41]/5 animate-pulse"
                    />
                ))}
            </div>
        );
    }

    if (isError) {
        return (
            <div className="bg-[#FBF8F1] rounded-2xl border border-[#1B2A41]/10 shadow-sm p-8 text-center space-y-2">
                <p className="text-sm font-semibold text-[#1B2A41]">Couldn't load your orders</p>
                <p className="text-xs text-[#1B2A41]/40">Please refresh the page and try again.</p>
            </div>
        );
    }

    if (orders.length === 0) {
        return (
            <div className="bg-[#FBF8F1] rounded-2xl border border-[#1B2A41]/10 shadow-sm p-8 text-center space-y-3 animate-in fade-in-50 duration-200">
                <div className="w-12 h-12 rounded-xl bg-[#C6941E]/15 flex items-center justify-center mx-auto text-[#C6941E]">
                    <ShoppingBag className="w-5 h-5" />
                </div>
                <div className="space-y-1">
                    <h4 className="font-bold text-sm text-[#1B2A41]">No Orders Placed Yet</h4>
                    <p className="text-xs text-[#1B2A41]/40 max-w-xs mx-auto">
                        When you buy your first eco-friendly tote bag, your tracking details will pop up here!
                    </p>
                </div>
                <Button
                    onClick={() => router.push("/shop")}
                    className="bg-[#C6941E] hover:bg-[#A87A14] text-[#1B2A41] hover:text-[#FBF8F1] font-bold text-xs px-4 h-9 rounded-xl shadow-sm transition-colors cursor-pointer mt-2"
                >
                    Start Shopping
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-[#FBF8F1] rounded-2xl border border-[#1B2A41]/10 shadow-sm p-6 animate-in fade-in-50 duration-200">
            {/* Header section matching Wishlist design layout */}
            <div className="flex items-center justify-between">
                <div>
                    <h3 className="text-base font-bold text-[#1B2A41]">My Orders</h3>
                    <p className="text-xs text-[#1B2A41]/40 mt-0.5">Track and manage your recent purchases</p>
                </div>
                <span className="text-[11px] font-bold text-[#7A2A28] bg-[#7A2A28]/10 px-2 py-0.5 rounded-md">
                    {orders.length} {orders.length === 1 ? "Order" : "Orders"}
                </span>
            </div>

            {/* Responsive Wishlist Card Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                {orders.map((order) => {
                    const style = STATUS_STYLES[order.status] ?? STATUS_STYLES.processing;
                    const isCancellingThis = cancelOrder.isPending && cancelTarget?.id === order.id;

                    return (
                        <div
                            key={order.id}
                            className="bg-[#FBF8F1] rounded-2xl border border-[#1B2A41]/10 shadow-sm overflow-hidden hover:border-[#1B2A41]/20 transition-all flex flex-col justify-between"
                        >
                            <div>
                                {/* Image height reduced from aspect-[4/5] (very tall) to a fixed,
                                    shorter height — was making order cards feel oversized. */}
                                <div className="relative h-40 sm:h-44 bg-[#F5EEDE] w-full overflow-hidden group">
                                    {order.firstItemImage ? (
                                        <img
                                            src={order.firstItemImage}
                                            alt={order.firstItemName || "Ordered Item"}
                                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                                        />
                                    ) : (
                                        <div className="w-full h-full flex items-center justify-center text-[#1B2A41]/25">
                                            <ShoppingBag className="w-10 h-10" />
                                        </div>
                                    )}

                                    {/* Absolute Status Badge overlayed at top-left of image */}
                                    <div className="absolute top-3 left-3">
                                        <span
                                            className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-[9px] font-bold uppercase tracking-wide shadow-sm ${style.bg} ${style.text}`}
                                        >
                                            {style.label}
                                        </span>
                                    </div>
                                </div>

                                {/* Order metadata information area */}
                                <div className="p-4 space-y-1.5">
                                    <div className="flex items-center justify-between">
                                        <span className="font-bold text-xs text-[#1B2A41]/40 tracking-tight">
                                            {order.orderNumber}
                                        </span>
                                        <span className="text-[11px] text-[#1B2A41]/40 font-medium">
                                            {new Date(order.createdAt).toLocaleDateString("en-IN", {
                                                day: "numeric",
                                                month: "short",
                                            })}
                                        </span>
                                    </div>

                                    <h4 className="font-bold text-sm text-[#1B2A41] truncate capitalize">
                                        {order.firstItemName?.replace(/-/g, " ")}
                                        {order.itemCount > 1 && (
                                            <span className="text-xs font-semibold normal-case text-[#1B2A41]/40">
                                                {" "}
                                                +{order.itemCount - 1} more
                                            </span>
                                        )}
                                    </h4>

                                    <div className="flex items-center justify-between pt-1">
                                        <p className="font-extrabold text-base text-[#1B2A41]">
                                            ₹{order.total.toLocaleString("en-IN", { minimumFractionDigits: 0 })}
                                        </p>
                                        <button
                                            onClick={() => router.push(`/orders/${order.id}/confirmation`)}
                                            className="inline-flex cursor-pointer items-center gap-0.5 text-xs font-bold text-[#A87A14] hover:underline transition-all"
                                        >
                                            {/* Bug fix: was className="w-3. h-3" — the stray period made
                                                this an invalid Tailwind class, so it silently did nothing
                                                and the icon rendered at its unstyled default size. */}
                                            Details <ChevronRight className="w-3 h-3" />
                                        </button>
                                    </div>
                                </div>
                            </div>

                            {/* Conditional actions block anchored at footer base */}

                        </div>
                    );
                })}
            </div>

            {/* Control modals */}
            {cancelTarget && (
                <CancelOrderDialog
                    open={Boolean(cancelTarget)}
                    onOpenChange={closeCancelDialog}
                    orderNumber={cancelTarget.orderNumber}
                    isPending={cancelOrder.isPending}
                    reason={cancelReason}
                    note={cancelNote}
                    onReasonChange={setCancelReason}
                    onNoteChange={setCancelNote}
                    onConfirm={handleConfirmCancel}
                />
            )}
        </div>
    );
}