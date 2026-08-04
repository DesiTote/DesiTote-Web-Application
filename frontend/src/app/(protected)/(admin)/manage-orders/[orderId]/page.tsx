"use client";

import { useParams, useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAdminOrderDetail } from "@/hooks/admin/useOrder";
import ManualStatusEditor from "@/components/admin/order/Manualstatuseditor";

const inr = (v: number) =>
    new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(v);

const dateTime = (v?: string) =>
    v
        ? new Date(v).toLocaleString("en-IN", {
            day: "2-digit",
            month: "short",
            year: "numeric",
            hour: "2-digit",
            minute: "2-digit",
        })
        : "—";

export default function OrderDetailPage() {
    const { orderId } = useParams<{ orderId: string }>();
    const router = useRouter();
    const { data: order, isLoading, isError, refetch } = useAdminOrderDetail(orderId);

    if (isLoading || !order) {
        return (
            <div className="space-y-4 p-6">
                <div className="h-8 w-48 animate-pulse rounded bg-muted" />
                <div className="h-64 w-full animate-pulse rounded-lg bg-muted" />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex flex-col items-center justify-center gap-2 p-16">
                <p className="text-sm text-muted-foreground">Couldn't load this order.</p>
                <button onClick={() => refetch()} className="text-sm font-medium text-primary underline underline-offset-4">
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 p-6">
            <div className="flex items-center justify-between">
                <div>
                    <button
                        onClick={() => router.push("/manage-orders")}
                        className="mb-1 text-sm text-muted-foreground hover:underline"
                    >
                        ← Back to orders
                    </button>
                    <h1 className="text-2xl font-bold">{order.orderNumber}</h1>
                    <p className="text-sm text-muted-foreground">Placed {dateTime(order.createdAt)}</p>
                </div>
                {order.statusBucket && (
                    <span className="rounded-full bg-muted px-3 py-1.5 text-sm font-medium">{order.statusBucket}</span>
                )}
            </div>

            <ManualStatusEditor orderId={order._id} currentStatus={order.status} />

            <div className="grid gap-6 lg:grid-cols-3">
                {/* Items + totals */}
                <Card className="lg:col-span-2">
                    <CardHeader>
                        <CardTitle>Items</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="divide-y">
                            {order.items.map((item, i) => (
                                <div key={i} className="flex items-center justify-between py-3">
                                    <div>
                                        <p className="font-medium">{item.name}</p>
                                        <p className="text-xs text-muted-foreground">
                                            SKU: {item.sku} · Qty: {item.quantity}
                                        </p>
                                    </div>
                                    <p className="font-medium">{inr(item.lineTotal)}</p>
                                </div>
                            ))}
                        </div>

                        <div className="mt-4 space-y-1 border-t pt-4 text-sm">
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Subtotal</span>
                                <span>{inr(order.subtotal)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Shipping</span>
                                <span>{inr(order.shippingCharge)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">GST</span>
                                <span>{inr(order.gstAmount)}</span>
                            </div>
                            {order.discount > 0 && (
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Discount</span>
                                    <span>-{inr(order.discount)}</span>
                                </div>
                            )}
                            <div className="flex justify-between pt-1 text-base font-semibold">
                                <span>Total</span>
                                <span>{inr(order.grandTotal)}</span>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Delivery address */}
                <Card>
                    <CardHeader>
                        <CardTitle>Delivery Address</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        <p className="font-medium">{order.deliveryAddress.fullName}</p>
                        <p>{order.deliveryAddress.mobileNumber}</p>
                        <p>{order.billingEmail}</p>
                        <p className="pt-2 text-muted-foreground">
                            {order.deliveryAddress.addressLine1}
                            {order.deliveryAddress.addressLine2 && `, ${order.deliveryAddress.addressLine2}`}
                            <br />
                            {order.deliveryAddress.district}, {order.deliveryAddress.state} —{" "}
                            {order.deliveryAddress.pincode}
                            <br />
                            {order.deliveryAddress.country}
                        </p>
                    </CardContent>
                </Card>

                {/* Payment */}
                <Card>
                    <CardHeader>
                        <CardTitle>Payment</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Method</span>
                            <span>{order.payment.method}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-muted-foreground">Status</span>
                            <span className="capitalize">{order.payment.status}</span>
                        </div>
                        {order.payment.razorpayOrderId && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Razorpay Order</span>
                                <span className="truncate text-xs">{order.payment.razorpayOrderId}</span>
                            </div>
                        )}
                        {order.payment.amountPaid !== undefined && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Amount Paid</span>
                                <span>{inr(order.payment.amountPaid)}</span>
                            </div>
                        )}
                        {order.payment.paidAt && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Paid At</span>
                                <span>{dateTime(order.payment.paidAt)}</span>
                            </div>
                        )}
                        {order.payment.failureReason && (
                            <div className="flex justify-between">
                                <span className="text-muted-foreground">Failure Reason</span>
                                <span className="text-right text-xs text-red-600">{order.payment.failureReason}</span>
                            </div>
                        )}
                    </CardContent>
                </Card>

                {/* Shiprocket */}
                <Card>
                    <CardHeader>
                        <CardTitle>Shipment (Shiprocket)</CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-1 text-sm">
                        {order.shiprocket?.awb ? (
                            <>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">AWB</span>
                                    <span>{order.shiprocket.awb}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Courier</span>
                                    <span>{order.shiprocket.courierName ?? "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Status</span>
                                    <span>{order.shiprocket.status ?? "—"}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-muted-foreground">Last Update</span>
                                    <span>{dateTime(order.shiprocket.lastWebhookAt)}</span>
                                </div>
                            </>
                        ) : (
                            <p className="text-muted-foreground">Not yet shipped.</p>
                        )}
                    </CardContent>
                </Card>
            </div>

            {/* Status history */}
            <Card>
                <CardHeader>
                    <CardTitle>Status History</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="space-y-4">
                        {[...order.statusHistory].reverse().map((entry, i) => (
                            <div key={i} className="flex gap-3 text-sm">
                                <div className="mt-1 h-2 w-2 shrink-0 rounded-full bg-primary" />
                                <div>
                                    <p className="font-medium">
                                        {entry.status}
                                        {entry.source === "admin" && (
                                            <span className="ml-2 rounded bg-amber-50 px-1.5 py-0.5 text-xs text-amber-700">
                                                manual
                                            </span>
                                        )}
                                    </p>
                                    <p className="text-xs text-muted-foreground">{dateTime(entry.timestamp)}</p>
                                    {entry.note && <p className="mt-0.5 text-xs text-muted-foreground">{entry.note}</p>}
                                </div>
                            </div>
                        ))}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}