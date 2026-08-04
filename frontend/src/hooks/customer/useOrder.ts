// ─── hooks/customer/useOrder.ts ──────────────────────────────
import { useRef, useState, useTransition } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { toast } from "sonner";;
import { placeOrderApi, getOrderDetails, cancelOrderApi, getRecentOrders, createRazorpayOrderApi, verifyRazorpayPaymentApi } from "@/services/customer/order.service";
import { CancelOrderPayload, PlaceOrderPayload } from "@/types/customer/order.type";
import { loadRazorpayScript } from "@/lib/loadRazorPayScript";


export function usePlaceOrder() {
    const router = useRouter();
    const [isProcessing, setIsProcessing] = useState(false);
    const hasSubmittedRef = useRef(false);
    const [isNavigating, startNavigation] = useTransition();

    const handlePlaceOrder = async ({ sessionId, paymentMethod }: PlaceOrderPayload) => {
        // Ref guard — blocks double-click before re-render happens
        if (hasSubmittedRef.current) return;
        hasSubmittedRef.current = true;
        setIsProcessing(true);

        try {
            if (paymentMethod === "COD") {
                const response = await placeOrderApi({ sessionId, paymentMethod });
                toast.success("Order placed!");
                startNavigation(() => {
                    router.push(`/orders/${response.data.orderId}/confirmation`);
                });
                // Don't clear isProcessing here — keep button disabled
                // until navigation actually completes (see effect below).
                return;
            }

            await handleOnlinePayment(sessionId);
        } catch (err: any) {
            toast.error(err?.response?.data?.message || err?.message || "Failed to place order");
            hasSubmittedRef.current = false; // allow retry on failure
            setIsProcessing(false);
        }
        // Note: no blanket `finally` that clears isProcessing — each path
        // below (online payment success/fail/cancel) manages it explicitly,
        // so the button stays disabled through the redirect.
    };

    const handleOnlinePayment = async (sessionId: string) => {
        // 1. Load Razorpay's script (cached after first load)
        const scriptLoaded = await loadRazorpayScript();
        if (!scriptLoaded) {
            toast.error("Couldn't load the payment gateway. Check your connection and try again.");
            hasSubmittedRef.current = false;
            setIsProcessing(false);
            return;
        }

        // 2. Create the pending order + Razorpay order on our backend
        let orderData;
        try {
            const response = await createRazorpayOrderApi(sessionId);
            orderData = response.data; // { orderId, razorpayOrderId, keyId, amount, currency }
        } catch (err: any) {
            toast.error(err?.response?.data?.message || "Couldn't start the payment, please try again");
            hasSubmittedRef.current = false;
            setIsProcessing(false);
            return;
        }

        // 3. Open Razorpay Checkout — everything from here happens in the
        // user's browser talking directly to Razorpay, not our server.
        return new Promise<void>((resolve) => {
            const razorpay = new (window as any).Razorpay({
                key: orderData.keyId,
                amount: orderData.amount,
                currency: orderData.currency,
                order_id: orderData.razorpayOrderId,
                name: "DesiTotes",
                theme: { color: "#FF407D" },

                handler: async (response: {
                    razorpay_order_id: string;
                    razorpay_payment_id: string;
                    razorpay_signature: string;
                }) => {
                    // 4. Payment succeeded per Razorpay's client callback — now
                    // verify the signature server-side before trusting it.
                    try {
                        const verifyRes = await verifyRazorpayPaymentApi(orderData.orderId, {
                            razorpayOrderId: response.razorpay_order_id,
                            razorpayPaymentId: response.razorpay_payment_id,
                            razorpaySignature: response.razorpay_signature,
                        });
                        toast.success("Payment successful — order placed!");
                        startNavigation(() => {
                            router.push(`/orders/${verifyRes.data.orderId}/confirmation`);
                        });
                        // Keep isProcessing true — button stays disabled
                        // until the navigation transition finishes.
                    } catch (err: any) {
                        toast.error(
                            err?.response?.data?.message ||
                            "We couldn't confirm your payment. If money was deducted, it will be refunded automatically, or contact support with your order reference."
                        );
                        hasSubmittedRef.current = false;
                        setIsProcessing(false);
                    } finally {
                        resolve();
                    }
                },

                modal: {
                    ondismiss: () => {
                        toast.info("Payment cancelled — you can try again whenever you're ready.");
                        hasSubmittedRef.current = false;
                        setIsProcessing(false);
                        resolve();
                    },
                },
            });

            razorpay.on("payment.failed", (response: any) => {
                toast.error(
                    response?.error?.description || "Payment failed. Please try a different payment method."
                );
                hasSubmittedRef.current = false;
                setIsProcessing(false);
                resolve();
            });

            razorpay.open();
        });
    };

    return {
        handlePlaceOrder,
        isProcessing: isProcessing || isNavigating,
    };
}


export function useOrderDetails(orderId: string) {
    return useQuery({
        queryKey: ["order-details", orderId],
        queryFn: () => getOrderDetails(orderId),
        select: (response) => response.data, // Unpacks standard server responses automatically
        retry: 1,
        enabled: !!orderId, // Prevents queries evaluating undefined params
    });
}

export const useRecentOrders = () => {
    return useQuery({
        queryKey: ["orders", "recent"],
        queryFn: getRecentOrders,
    });
};

export const useCancelOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (payload: CancelOrderPayload) => cancelOrderApi(payload),

        onSuccess: (response) => {
            // Update the recent-orders cache directly so the list reflects the
            // cancellation immediately without a refetch round-trip.
            queryClient.setQueryData(["orders", "recent"], (old: any) => {
                if (!old?.data) return old;
                return {
                    ...old,
                    data: old.data.map((order: any) =>
                        order.id === response.data.orderId
                            ? { ...order, status: "cancelled", canCancel: false }
                            : order
                    ),
                };
            });

            if (response.data.refundInitiated) {
                toast.success("Order cancelled — your refund has been initiated");
            } else {
                toast.success("Order cancelled");
            }
        },

        onError: (err: any) => {
            toast.error(err?.response?.data?.message || err?.message || "Failed to cancel order");
        },
    });
};