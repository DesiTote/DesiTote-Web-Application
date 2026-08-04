import React from "react";
import Link from "next/link";
import { CheckCircle2, ShoppingBag, Truck, MapPin } from "lucide-react";

interface OrderItem {
    id: string;
    name: string;
    quantity: number;
    price: number;
    sku?: string;
}

interface OrderSummaryCardProps {
    orderId: string;
    items: OrderItem[];
    subtotal: number;
    shippingCharges: number;
    total: number;
    paymentMethod: string;
    shippingAddress: {
        name: string;
        street: string;
        city: string;
        pincode: string;
        phone: string;
    };
}

export function OrderSummaryCard({
    orderId,
    items,
    subtotal,
    shippingCharges,
    total,
    paymentMethod,
    shippingAddress,
}: OrderSummaryCardProps) {
    return (
        <div className="w-full space-y-6">
            {/* Visual Success Header */}
            <div className="flex flex-col items-center text-center space-y-3 py-4">
                <div className="p-3 bg-emerald-50 text-emerald-600 rounded-full dark:bg-emerald-950/30 dark:text-emerald-400">
                    <CheckCircle2 className="w-12 h-12" />
                </div>
                <div className="space-y-1">
                    <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Order Confirmed!</h1>
                    <p className="text-muted-foreground text-sm max-w-xs sm:max-w-md">
                        Thank you for your order. We've received it and are spinning up your delivery with our courier partner.
                    </p>
                </div>
                <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-secondary text-secondary-foreground text-xs font-mono rounded-md border">
                    ID: {orderId}
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Left Column: Items & Summary */}
                <div className="md:col-span-2 space-y-4">
                    <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm">
                        <h2 className="font-semibold text-base mb-4 flex items-center gap-2">
                            <ShoppingBag className="w-4 h-4 text-muted-foreground" />
                            Items Ordered
                        </h2>
                        <div className="divide-y divide-border">
                            {items.map((item) => (
                                <div key={item.id} className="py-3 flex justify-between items-start text-sm first:pt-0 last:pb-0">
                                    <div className="space-y-0.5 pr-4">
                                        <p className="font-medium line-clamp-2">{item.name}</p>
                                        {item.sku && <p className="text-xs font-mono text-muted-foreground">SKU: {item.sku}</p>}
                                        <p className="text-xs text-muted-foreground">Qty: {item.quantity}</p>
                                    </div>
                                    <p className="font-medium whitespace-nowrap">₹{(item.price * item.quantity).toLocaleString("en-IN")}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Pricing Breakdown */}
                    <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm space-y-3">
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Subtotal</span>
                            <span>₹{subtotal.toLocaleString("en-IN")}</span>
                        </div>
                        <div className="flex justify-between text-sm">
                            <span className="text-muted-foreground">Shipping</span>
                            <span className="text-emerald-600 font-medium">
                                {shippingCharges === 0 ? "FREE" : `₹${shippingCharges.toLocaleString("en-IN")}`}
                            </span>
                        </div>
                        <div className="border-t pt-3 flex justify-between font-semibold text-base">
                            <span>Total Amount</span>
                            <span>₹{total.toLocaleString("en-IN")}</span>
                        </div>
                    </div>
                </div>

                {/* Right Column: Logistics Details */}
                <div className="space-y-4">
                    {/* Shipping Address */}
                    <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm">
                        <h2 className="font-semibold text-base mb-3 flex items-center gap-2">
                            <MapPin className="w-4 h-4 text-muted-foreground" /> Shipping Details
                        </h2>
                        <div className="text-sm space-y-1 text-muted-foreground">
                            <p className="font-medium text-foreground">{shippingAddress.name}</p>
                            <p className="line-clamp-3">{shippingAddress.street}</p>
                            <p>{shippingAddress.city} - {shippingAddress.pincode}</p>
                            <p className="pt-2 text-xs font-mono text-foreground">Phone: {shippingAddress.phone}</p>
                        </div>
                    </div>

                    {/* Payment Method Status Box */}
                    <div className="rounded-xl border bg-card p-4 sm:p-6 shadow-sm bg-gradient-to-br from-background to-secondary/20">
                        <h2 className="font-semibold text-base mb-2 flex items-center gap-2">
                            <Truck className="w-4 h-4 text-muted-foreground" /> Delivery Mode
                        </h2>
                        <div className="space-y-1">
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold bg-amber-100 text-amber-800 dark:bg-amber-950/40 dark:text-amber-400">
                                {paymentMethod}
                            </span>
                            <p className="text-xs text-muted-foreground pt-1.5 leading-relaxed">
                                Please keep **₹{total.toLocaleString("en-IN")}** ready in cash when our delivery executive arrives at your doorstep.
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Primary Global Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4 border-t">
                <Link
                    href="/orders"
                    className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-6 rounded-md bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors shadow-sm"
                >
                    Track My Order
                </Link>
                <Link
                    href="/"
                    className="w-full sm:w-auto inline-flex items-center justify-center h-10 px-6 rounded-md border border-input bg-background text-sm font-medium hover:bg-accent hover:text-accent-foreground transition-colors"
                >
                    Continue Shopping
                </Link>
            </div>
        </div>
    );
}