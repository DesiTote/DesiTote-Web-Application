"use client";

import React from "react";
import Link from "next/link";
import {
    CheckCircle2,
    ShoppingBag,
    Truck,
    Receipt,
    ArrowLeft,
    Package,
    Phone,
    MapPin,
    ExternalLink,
    Star,
} from "lucide-react";
import { useOrderDetails } from "@/hooks/customer/useOrder";
import { OrderConfirmationSkeleton } from "@/components/skeletons/customer/OrderConfirmationSkeleton";
import PageContainer from "@/components/shared/PageContainer";
import QueryError from "@/components/shared/QueryError";
import { STATUS_SUBTITLES } from "@/constants/customer/order";


export default function OrderConfirmationClient({ orderId }: { orderId: string }) {
    const { data: orderData, isLoading, error } = useOrderDetails(orderId);

    function getStatusSubtitle(status: string): string {
        return STATUS_SUBTITLES[status] ?? "We've received your order details and are updating the status.";
    }

    if (isLoading) return <OrderConfirmationSkeleton />;

    if (error || !orderData) {
        return (
            <PageContainer>
                <div className="w-full max-w-4xl mx-auto py-12 flex justify-center items-center">
                    <QueryError
                        redirectUrl="/"
                        redirectPageName="Home"
                        message="Failed to load order data"
                        title="Order Detail Error"
                    />
                </div>
            </PageContainer>
        );
    }

    const order = orderData;
    const subtotal = order.subtotal ?? 0;
    const discount = order.discount ?? 0;
    const gstAmount = order.gstAmount ?? 0;
    const shippingCharges = order.shippingCharges ?? 0;

    const formattedDate = new Date(order.createdAt).toLocaleDateString("en-IN", {
        year: "numeric",
        month: "long",
        day: "numeric",
    });

    return (
        <PageContainer>
            <div className="w-full max-w-5xl mx-auto px-4 sm:px-6 py-8 sm:py-12">

                {/* ── Success hero ─────────────────────────────────────── */}
                {/* ── Success hero ─────────────────────────────────────── */}
<div className="text-center mb-8 sm:mb-12">
    <div className="mx-auto mb-5 flex h-16 w-16 sm:h-20 sm:w-20 items-center justify-center rounded-full bg-[#C6941E]/15">
        <CheckCircle2
            className="h-9 w-9 sm:h-11 sm:w-11 text-[#C6941E]"
            strokeWidth={2}
        />
    </div>

    <p className="text-xs sm:text-sm font-bold uppercase tracking-[0.15em] mb-2 text-[#A87A14]">
        Order confirmed
    </p>
    <h1 className="text-2xl sm:text-4xl font-black tracking-tight text-[#1B2A41]">
        Thank you, {order.shippingAddress?.fullName?.split(" ")[0] || "there"}!
    </h1>
    <p className="mt-2 text-sm sm:text-base text-[#1B2A41]/60 max-w-md mx-auto">
        {getStatusSubtitle(order.status)}
    </p>

    {/* Metadata Pill */}
    <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-x-4 gap-y-2 rounded-full border border-[#1B2A41]/10 bg-[#FBF8F1] px-4 sm:px-5 py-2 text-xs sm:text-sm text-[#1B2A41]/70">
        <span>
            Order <span className="font-bold text-[#1B2A41]">{order.orderNumber}</span>
        </span>
        <span className="text-[#1B2A41]/25">•</span>
        <span>{formattedDate}</span>
        <span className="text-[#1B2A41]/25">•</span>
        <span className="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-bold uppercase tracking-wide bg-[#C6941E]/15 text-[#A87A14]">
            {order.statusLabel ?? order.status}
        </span>
    </div>

    {/* Review Banner Card (Delivered Status Only) */}
    {order.status === "delivered" && (
        <div className="mt-6 max-w-lg mx-auto p-4 sm:p-5 rounded-2xl bg-[#FBF8F1] border border-[#C6941E]/30 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-4 text-left">
            <div className="space-y-0.5 text-center sm:text-left">
                <p className="font-extrabold text-sm text-[#1B2A41] uppercase tracking-wide">
                    How was your purchase?
                </p>
                <p className="text-xs text-[#1B2A41]/60">
                    Share your feedback on the items from this order.
                </p>
            </div>
            <Link
                href={`/orders/${order.id}/review-purchase`}
                className="inline-flex items-center justify-center gap-2 bg-[#C6941E] hover:bg-[#A87A14] text-[#1B2A41] font-bold text-xs px-5 py-2.5 rounded-xl shadow-md transition-all shrink-0 hover:scale-[1.02] active:scale-[0.98]"
            >
                <Star className="w-4 h-4 fill-[#1B2A41]" /> Review Items
            </Link>
        </div>
    )}
</div>

                {/* ── Content grid ──────────────────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-8 items-start">

                    {/* Items — 3/5 on desktop, full width on mobile/tablet */}
                    <div className="lg:col-span-3 space-y-4">
                        <h2 className="flex items-center gap-2 text-base sm:text-lg font-bold text-[#1B2A41]">
                            <ShoppingBag className="w-5 h-5 text-[#1B2A41]/40" />
                            Items ordered ({order.items?.length || 0})
                        </h2>

                        <div className="rounded-2xl border border-[#1B2A41]/10 bg-[#FBF8F1] divide-y divide-[#1B2A41]/10 overflow-hidden shadow-sm">
                            {order.items?.map((item: any, idx: number) => (
                                <div
                                    key={item.productId || idx}
                                    className="p-4 sm:p-5 flex items-center gap-4"
                                >
                                    <div className="w-14 h-14 sm:w-16 sm:h-16 shrink-0 rounded-xl bg-[#F5EEDE] border border-[#1B2A41]/10 flex items-center justify-center">
                                        <Package className="w-6 h-6 text-[#1B2A41]/25" />
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-sm sm:text-base text-[#1B2A41] truncate capitalize">
                                            {item.name?.replace(/-/g, " ")}
                                        </h3>
                                        <p className="text-xs text-[#1B2A41]/40 mt-0.5">
                                            SKU {item.sku} · Qty {item.quantity}
                                        </p>
                                    </div>
                                    <div className="text-right shrink-0">
                                        <p className="font-bold text-sm sm:text-base text-[#1B2A41]">
                                            ₹{(item.price * item.quantity).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                        </p>
                                        {item.quantity > 1 && (
                                            <p className="text-xs text-[#1B2A41]/40">
                                                ₹{item.price.toLocaleString("en-IN")} each
                                            </p>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {/* Tracking — only renders once a shipment actually exists */}
                        {order.tracking && <OrderTrackingCard tracking={order.tracking} />}

                        {/* Shipping address moves here on mobile/tablet for a natural reading order,
                            stays in the right column on desktop via the lg:hidden / hidden lg:block pair below */}
                        <div className="lg:hidden">
                            <ShippingAddressCard order={order} />
                        </div>
                    </div>

                    {/* Summary — 2/5 on desktop */}
                    <div className="lg:col-span-2 space-y-6">
                        <div className="hidden lg:block">
                            <ShippingAddressCard order={order} />
                        </div>

                        <div className="rounded-2xl border border-[#1B2A41]/10 bg-[#FBF8F1] p-5 sm:p-6 shadow-sm">
                            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B2A41]/40 mb-4">
                                <Receipt className="w-4 h-4" /> Order summary
                            </h2>

                            <div className="space-y-2.5 text-sm border-b border-[#1B2A41]/10 pb-4">
                                <Row label="Subtotal" value={subtotal} />
                                {discount > 0 && (
                                    <Row label="Discount" value={-discount} valueClassName="text-[#A87A14]" />
                                )}
                                <Row label="GST (18%)" value={gstAmount} />
                                <Row label="Shipping charges" value={shippingCharges} />
                                <div className="flex justify-between pt-1 text-[#1B2A41]/60">
                                    <span>Payment method</span>
                                    <span className="font-bold text-[#1B2A41] uppercase text-xs tracking-wide">
                                        {order.paymentMethod === "COD" ? "Cash on delivery" : order.paymentMethod}
                                    </span>
                                </div>
                            </div>

                            <div className="flex items-center justify-between pt-4">
                                <span className="font-black text-base text-[#1B2A41]">Total paid</span>
                                <span className="text-xl sm:text-2xl font-black text-[#1B2A41]">
                                    ₹{order.total.toLocaleString("en-IN", { minimumFractionDigits: 2 })}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* ── Footer nav ────────────────────────────────────────── */}
                <div className="mt-8 sm:mt-10 pt-6 border-t border-[#1B2A41]/10 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                    <Link
                        href="/"
                        className="inline-flex items-center justify-center gap-2 text-sm font-semibold text-[#1B2A41]/60 hover:text-[#1B2A41] transition-colors py-2.5 sm:py-0"
                    >
                        <ArrowLeft className="w-4 h-4" /> Continue shopping
                    </Link>

                    <Link
                        href="/profile"
                        className="w-full sm:w-auto text-center bg-[#C6941E] hover:bg-[#A87A14] text-[#1B2A41] hover:text-[#FBF8F1] text-sm font-bold px-6 py-3 rounded-xl shadow-lg shadow-[#C6941E]/25 transition-all hover:scale-[1.02] active:scale-[0.99]"
                    >
                        View my orders
                    </Link>
                </div>
            </div>
        </PageContainer>
    );
}

function Row({
    label,
    value,
    valueClassName = "text-[#1B2A41]",
}: {
    label: string;
    value: number;
    valueClassName?: string;
}) {
    const isNegative = value < 0;
    return (
        <div className="flex justify-between text-[#1B2A41]/60">
            <span>{label}</span>
            <span className={`font-bold ${valueClassName}`}>
                {isNegative ? "-" : ""}₹{Math.abs(value).toLocaleString("en-IN", { minimumFractionDigits: 2 })}
            </span>
        </div>
    );
}

function ShippingAddressCard({ order }: { order: any }) {
    return (
        <div className="rounded-2xl border border-[#1B2A41]/10 bg-[#FBF8F1] p-5 sm:p-6 shadow-sm space-y-3">
            <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B2A41]/40">
                <Truck className="w-4 h-4" /> Shipping to
            </h2>
            <div className="text-sm text-[#1B2A41]/75 space-y-1">
                <p className="font-bold text-[#1B2A41] text-base">
                    {order.shippingAddress?.fullName}
                </p>
                <p>{order.shippingAddress?.addressLine1}</p>
                {order.shippingAddress?.addressLine2 && <p>{order.shippingAddress.addressLine2}</p>}
                <p>
                    {order.shippingAddress?.district}, {order.shippingAddress?.state} —{" "}
                    <span className="font-semibold">{order.shippingAddress?.pincode}</span>
                </p>
                <p className="flex items-center gap-1.5 text-[#1B2A41]/40 pt-1 text-xs">
                    <Phone className="w-3.5 h-3.5" /> {order.shippingAddress?.mobileNumber}
                </p>
            </div>
        </div>
    );
}

interface TrackingInfo {
    awb: string;
    courierName: string | null;
    estimatedDelivery: string | null;
    lastUpdatedAt: string | null;
    externalTrackingUrl: string;
    timeline: { date: string; activity: string; location: string | null }[];
}

function OrderTrackingCard({ tracking }: { tracking: TrackingInfo }) {
    // Backend returns timeline oldest-first (chronological, canonical order).
    // Display newest-first — that's the convention people expect from a
    // tracking page ("what's the latest update"), without needing to
    // scroll to the bottom.
    const displayTimeline = [...tracking.timeline].reverse();

    return (
        <div className="rounded-2xl border border-[#1B2A41]/10 bg-[#FBF8F1] p-5 sm:p-6 shadow-sm space-y-4">
            <div className="flex items-center justify-between flex-wrap gap-2">
                <h2 className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-[#1B2A41]/40">
                    <Truck className="w-4 h-4" /> Track your order
                </h2>
                <a
                    href={tracking.externalTrackingUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-xs font-semibold text-[#A87A14] hover:text-[#1B2A41] transition-colors"
                >
                    Track on courier site <ExternalLink className="w-3 h-3" />
                </a>
            </div>

            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
                <div>
                    <p className="text-[#1B2A41]/40 text-xs uppercase tracking-wide">AWB</p>
                    <p className="font-bold text-[#1B2A41]">{tracking.awb}</p>
                </div>
                {tracking.courierName && (
                    <div>
                        <p className="text-[#1B2A41]/40 text-xs uppercase tracking-wide">Courier</p>
                        <p className="font-bold text-[#1B2A41]">{tracking.courierName}</p>
                    </div>
                )}
                {tracking.estimatedDelivery && (
                    <div>
                        <p className="text-[#1B2A41]/40 text-xs uppercase tracking-wide">Expected delivery</p>
                        <p className="font-bold text-[#1B2A41]">
                            {new Date(tracking.estimatedDelivery).toLocaleDateString("en-IN", {
                                day: "numeric",
                                month: "short",
                                year: "numeric",
                            })}
                        </p>
                    </div>
                )}
            </div>

            {displayTimeline.length > 0 ? (
                <div className="pt-2 space-y-0">
                    {displayTimeline.map((entry, idx) => (
                        <div key={idx} className="flex gap-3">
                            {/* Dot + connecting line */}
                            <div className="flex flex-col items-center">
                                <div
                                    className={`mt-1 h-2.5 w-2.5 rounded-full shrink-0 ${idx === 0 ? "bg-[#C6941E]" : "bg-[#1B2A41]/20"
                                        }`}
                                />
                                {idx < displayTimeline.length - 1 && (
                                    <div className="w-px flex-1 bg-[#1B2A41]/10 my-1" />
                                )}
                            </div>

                            <div className="pb-4 min-w-0">
                                <p
                                    className={`text-sm font-semibold ${idx === 0 ? "text-[#1B2A41]" : "text-[#1B2A41]/70"
                                        }`}
                                >
                                    {entry.activity}
                                </p>
                                <p className="text-xs text-[#1B2A41]/40 mt-0.5 flex items-center gap-1 flex-wrap">
                                    {new Date(entry.date).toLocaleString("en-IN", {
                                        day: "numeric",
                                        month: "short",
                                        hour: "numeric",
                                        minute: "2-digit",
                                    })}
                                    {entry.location && (
                                        <span className="inline-flex items-center gap-1">
                                            <span className="text-[#1B2A41]/25">•</span>
                                            <MapPin className="w-3 h-3" /> {entry.location}
                                        </span>
                                    )}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <p className="text-sm text-[#1B2A41]/50">
                    Your shipment has been created — tracking updates will appear here once the courier
                    picks it up.
                </p>
            )}
        </div>
    );
}