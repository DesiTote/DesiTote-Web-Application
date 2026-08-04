"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";

import PageContainer from "@/components/shared/PageContainer";
import PaymentMethod from "@/components/customer/checkout/PaymentMethod";
import OrderSummary from "@/components/customer/checkout/CheckoutOrderSummary";
import CheckoutPageSkeleton from "@/components/skeletons/customer/CheckoutPageSkeleton";

import { useQueryClient } from "@tanstack/react-query";
import { useGetCheckoutSession, useUpdateCheckoutAddress } from "@/hooks/customer/useCheckout";
import { toast } from "sonner";
import { CheckoutSession } from "@/types/customer/checkout.type";
import DeliveryAddressSection from "@/components/customer/checkout/DeliveryAddressSection";
import { useAddresses, useDeleteAddress } from "@/hooks/customer/useAddress";
import { Address } from "@/types/customer/address.type";
import AddAddressDialog from "@/components/customer/checkout/AddAddressDialog";
import { PaymentType } from "@/types/customer/payment.type";
import DeleteAlert from "@/components/shared/DeleteAlert";
import QueryError from "@/components/shared/QueryError";
import { usePlaceOrder } from "@/hooks/customer/useOrder";

// Brand palette: Ink Navy #1B2A41 · Canvas Cream #F5EEDE · Surface Cream #FBF8F1
// Marigold Gold #C6941E (buttons/highlights, purchase actions, selection state)
// Brick Maroon #7A2A28 (tags/accents)

const ADDRESS_SHIPPING_TOAST_ID = "address-shipping-recalc";

export default function CheckoutPage() {
    const router = useRouter();
    const params = useParams();
    const sessionId = params.id as string;

    const [selectedAddressId, setSelectedAddressId] = useState<string>("");

    const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<"COD" | "ONLINE" | null>(null);

    const { data: addressesData, isLoading: addressesLoading } = useAddresses();
    const { data, isLoading, isError } = useGetCheckoutSession(sessionId);
    const { handlePlaceOrder, isProcessing } = usePlaceOrder();

    const updateAddress = useUpdateCheckoutAddress(sessionId);
    const queryClient = useQueryClient();

    const deleteAddressMutation = useDeleteAddress();
    const [editAddress, setEditAddress] = useState<Address | null>(null);
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [isDeleteOpen, setIsDeleteOpen] = useState(false);
    const [addressToDeleteId, setAddressToDeleteId] = useState<string | null>(null);

    const confirmDeleteAddress = (addressId: string) => {
        setAddressToDeleteId(addressId);
        setIsDeleteOpen(true);
    };

    const handleExecuteDelete = () => {
        if (!addressToDeleteId) return;
        deleteAddressMutation.mutate(addressToDeleteId, {
            onSuccess: () => {
                const wasSelected = selectedAddressId === addressToDeleteId;
                const noAddressesLeft = addresses.length <= 1; // the one being deleted was the last one

                if (wasSelected) setSelectedAddressId("");
                if (wasSelected || noAddressesLeft) {
                    queryClient.setQueryData(
                        ["checkout-session", sessionId],
                        (old: { data: CheckoutSession } | undefined) =>
                            old
                                ? {
                                    ...old,
                                    data: {
                                        ...old.data,
                                        deliveryAddress: null,
                                        paymentMethod: null,
                                        shippingOptions: null,
                                        shippingError: null,
                                        total: null,
                                    },
                                }
                                : old
                    );
                    setSelectedPaymentMethod(null);
                }

                setIsDeleteOpen(false);
                setAddressToDeleteId(null);
            },
            onError: (err: any) => {
                toast.error(err?.message || "Failed to delete address");
            },
        });
    };

    useEffect(() => {
        if (!sessionId) router.replace("/cart");
    }, [sessionId, router]);

    const checkoutSession: CheckoutSession = data?.data;
    const addresses = addressesData?.data ?? [];

    const selectedAddress =
        addresses.find((a) => a._id === selectedAddressId) ||
        addresses.find((a) => a.isDefault) ||
        addresses[0];

    useEffect(() => {
        if (!selectedAddressId && selectedAddress && addresses.length > 0) {
            setSelectedAddressId(selectedAddress._id);
        }
    }, [selectedAddress, selectedAddressId]);

    // ── Trigger recalculation whenever the selected address changes ──
    // This is the ONLY thing that needs a real network round-trip + loading
    // state + toast, since it's the only step that actually calls Shiprocket.
    useEffect(() => {
        if (!selectedAddressId || !checkoutSession) return;

        const address = addresses.find((a) => a._id === selectedAddressId);
        if (!address) return;

        const alreadyCalculatedForThisAddress =
            checkoutSession.deliveryAddress?.pincode === address.pincode &&
            checkoutSession.shippingOptions != null;

        if (alreadyCalculatedForThisAddress) return;

        toast.loading("Calculating shipping charges for your address…", {
            id: ADDRESS_SHIPPING_TOAST_ID,
        });

        updateAddress.mutate(selectedAddressId, {
            onSuccess: (response) => {
                const session = (response?.data ?? response?.session) as CheckoutSession | undefined;

                if (session?.shippingError || (!session?.shippingOptions?.COD && !session?.shippingOptions?.ONLINE)) {
                    toast.error(session?.shippingError || "Delivery is not available to this pincode", {
                        id: ADDRESS_SHIPPING_TOAST_ID,
                    });
                    return;
                }

                toast.success("Address updated — shipping charges recalculated", {
                    id: ADDRESS_SHIPPING_TOAST_ID,
                });
            },
            onError: (err: any) => {
                toast.error(err?.message || "Could not calculate shipping for this address", {
                    id: ADDRESS_SHIPPING_TOAST_ID,
                });
            },
        });
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [selectedAddressId]);

    useEffect(() => {
        if (!checkoutSession?.shippingOptions) return;

        const { COD, ONLINE } = checkoutSession.shippingOptions;

        if (selectedPaymentMethod === "COD" && !COD && ONLINE) {
            setSelectedPaymentMethod("ONLINE");
            toast.info("Cash on Delivery isn't available here — switched to Online Payment");
            return;
        }
        if (selectedPaymentMethod === "ONLINE" && !ONLINE && COD) {
            setSelectedPaymentMethod("COD");
            toast.info("Online Payment isn't available here — switched to Cash on Delivery");
            return;
        }
        if (!selectedPaymentMethod) {
            setSelectedPaymentMethod(checkoutSession.paymentMethod ?? (ONLINE ? "ONLINE" : COD ? "COD" : null));
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [checkoutSession?.shippingOptions]);

    const onPaymentMethodChange = (method: PaymentType) => {
        if (!checkoutSession?.shippingOptions) return; // shouldn't be reachable — UI disables until address is set
        if (method === selectedPaymentMethod) return; // no-op, already selected
        setSelectedPaymentMethod(method as "COD" | "ONLINE");
    };

    const onPlaceOrder = () => {
        if (!selectedAddressId) {
            toast.error("Please select a delivery address");
            return;
        }
        if (!selectedPaymentMethod) {
            toast.error("Please select a payment method");
            return;
        }
        handlePlaceOrder({
            sessionId,
            paymentMethod: selectedPaymentMethod,
        });
    };

    // ── Derived state driving disabling + notes ─────────────────
    const hasAddress = Boolean(checkoutSession?.deliveryAddress);
    const isCalculatingShipping = updateAddress.isPending; // real network call — only this blocks the UI
    const hasShippingOptions = Boolean(checkoutSession?.shippingOptions);
    const shippingUnavailable = Boolean(checkoutSession?.shippingError);

    const isPaymentMethodDisabled =
        !hasAddress || isCalculatingShipping || !hasShippingOptions || isProcessing;

    const currentQuote =
        selectedPaymentMethod && checkoutSession?.shippingOptions
            ? checkoutSession.shippingOptions[selectedPaymentMethod]
            : null;

    const currentTotal =
        currentQuote && checkoutSession
            ? checkoutSession.subtotal - checkoutSession.discount + checkoutSession.gstAmount + currentQuote.charge
            : null;

    const isPlaceOrderDisabled =
        !selectedAddressId ||
        !hasShippingOptions ||
        !currentQuote ||
        isCalculatingShipping ||
        isProcessing;

    let orderSummaryNote: string | null = null;
    if (!hasAddress) {
        orderSummaryNote = "Select a delivery address to see shipping charges";
    } else if (isCalculatingShipping) {
        orderSummaryNote = "Calculating shipping charge…";
    } else if (shippingUnavailable) {
        orderSummaryNote = checkoutSession?.shippingError || "Delivery is not available to this pincode";
    } else if (selectedPaymentMethod && !currentQuote) {
        orderSummaryNote = `${selectedPaymentMethod === "COD" ? "Cash on Delivery" : "Online payment"} is not available for this address`;
    } else if (isProcessing) {
        orderSummaryNote = "Placing your order — please don't close this page…";
    }

    // ── Loading / error guards (unchanged) ────────────────
    if (isLoading || addressesLoading) {
        return (
            <PageContainer>
                <div className="flex flex-col items-center justify-center py-8">
                    <div className="animate-pulse">
                        <h2 className="text-lg font-semibold text-[#1B2A41]">
                            Setting up your secure checkout
                        </h2>
                    </div>
                    <p className="mt-2 text-sm text-[#1B2A41]/50">
                        Please wait while we load your order details...
                    </p>
                </div>
                <CheckoutPageSkeleton />
            </PageContainer>
        );
    }

    if (isError || (!isLoading && !data?.data)) {
        return (
            <PageContainer className="py-20 flex justify-center items-center">
                <QueryError
                    redirectUrl="/cart"
                    redirectPageName="cart"
                    message="This checkout link is invalid or has expired."
                    title="Checkout Error"
                />
            </PageContainer>
        );
    }

    if (!checkoutSession) return null;

    return (
        <PageContainer className="py-8">
            <div className="min-h-screen pb-10">
                <div className="grid grid-cols-1 xl:grid-cols-[1.9fr_420px] gap-8">
                    <div className="space-y-6">
                        <DeliveryAddressSection
                            addresses={addresses}
                            selectedAddressId={selectedAddressId}
                            onSelectAddress={setSelectedAddressId}
                            onEditAddress={(address) => {
                                setEditAddress(address);
                                setIsEditDialogOpen(true);
                            }}
                            onDeleteAddress={confirmDeleteAddress}
                            isDisabled={isProcessing || isCalculatingShipping}
                        />

                        <AddAddressDialog
                            open={isEditDialogOpen}
                            onOpenChange={(open) => {
                                setIsEditDialogOpen(open);
                                if (!open) setEditAddress(null);
                            }}
                            mode="edit"
                            address={editAddress}
                        />

                        <PaymentMethod
                            value={selectedPaymentMethod}
                            onChange={onPaymentMethodChange}
                            isDisabled={isPaymentMethodDisabled}
                            unavailableMethods={{
                                COD: hasShippingOptions && !checkoutSession.shippingOptions?.COD,
                                ONLINE: hasShippingOptions && !checkoutSession.shippingOptions?.ONLINE,
                            }}
                            codShippingCharge={checkoutSession.shippingOptions?.COD?.charge ?? null}
                            onlineShippingCharge={checkoutSession.shippingOptions?.ONLINE?.charge ?? null}
                        />
                    </div>

                    <div>
                        <div className="xl:sticky xl:top-24">
                            <div className="bg-[#FBF8F1] border border-[#1B2A41]/10 rounded-2xl p-5 sm:p-6 shadow-sm">
                                <OrderSummary
                                    subtotal={checkoutSession.subtotal}
                                    discount={checkoutSession.discount}
                                    gst={checkoutSession.gstAmount}
                                    shipping={currentQuote?.charge ?? null}
                                    total={currentTotal}
                                    note={orderSummaryNote}
                                    isDisabled={isPlaceOrderDisabled}
                                    isPlacingOrder={isProcessing}
                                    onPlaceOrder={onPlaceOrder}
                                />
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <DeleteAlert
                isOpen={isDeleteOpen}
                onOpenChange={setIsDeleteOpen}
                onConfirm={handleExecuteDelete}
                title="Delete Address?"
                description="This action cannot be undone. This address will be permanently removed from your saved address book list."
                isPending={deleteAddressMutation.isPending}
            />
        </PageContainer>
    );
}