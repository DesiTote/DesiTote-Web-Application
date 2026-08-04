import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
    createCheckoutSession,
    getCheckoutSession,
    updateCheckoutSessionAddress,
    updateCheckoutSessionPaymentMethod,
} from "@/services/customer/checkout.service";
import { CheckoutSession } from "@/types/customer/checkout.type";

// Some checkout endpoints wrap the session under `data`, others under `session`
// (backend inconsistency — worth fixing server-side to always use `data`, see
// note in checkout.controller.ts). Normalising here means the UI never breaks
// silently again if a controller's response shape drifts.
function extractSession(response: any): CheckoutSession | undefined {
    return response?.data ?? response?.session;
}

export const useCreateCheckoutSession = () => {
    return useMutation({
        mutationFn: createCheckoutSession,
    });
};

export const useGetCheckoutSession = (sessionId: string) => {
    return useQuery({
        queryKey: ["checkout-session", sessionId],
        queryFn: () => getCheckoutSession(sessionId),
        enabled: !!sessionId,
    });
};

/**
 * Recalculates shipping (both COD + ONLINE together) for the given address.
 * On success, writes the updated session straight into the query cache —
 * no refetch needed, so the OrderSummary updates immediately.
 */
export const useUpdateCheckoutAddress = (sessionId: string) => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: (addressId: string) =>
            updateCheckoutSessionAddress(sessionId, addressId),

        onSuccess: (response) => {
            const session = extractSession(response);
            if (!session) return; // defensive — don't blow away good cached data with nothing

            queryClient.setQueryData(
                ["checkout-session", sessionId],
                (old: { data: CheckoutSession } | undefined) =>
                    old ? { ...old, data: session } : old
            );
        },
    });
};

/**
 * Switches payment method with an OPTIMISTIC update — both COD and ONLINE
 * quotes are already sitting in shippingOptions from the address calculation,
 * so there's no need to wait on the network to reflect the new total. The
 * PATCH still fires in the background to persist the selection server-side
 * (placeOrderService reads sessionData.paymentMethod at order time), and
 * rolls back the optimistic change if it somehow fails.
 */
export const useUpdateCheckoutPaymentMethod = (sessionId: string) => {
    const queryClient = useQueryClient();
    const queryKey = ["checkout-session", sessionId];

    return useMutation({
        mutationFn: (paymentMethod: "COD" | "ONLINE") =>
            updateCheckoutSessionPaymentMethod(sessionId, paymentMethod),

        onMutate: async (paymentMethod: "COD" | "ONLINE") => {
            await queryClient.cancelQueries({ queryKey });

            const previous = queryClient.getQueryData<{ data: CheckoutSession }>(queryKey);

            queryClient.setQueryData(queryKey, (old: { data: CheckoutSession } | undefined) => {
                if (!old) return old;

                const quote = old.data.shippingOptions?.[paymentMethod];
                if (!quote) return old; // method not serviceable — let the mutation's real error handle it

                return {
                    ...old,
                    data: {
                        ...old.data,
                        paymentMethod,
                        total: old.data.subtotal - old.data.discount + old.data.gstAmount + quote.charge,
                    },
                };
            });

            return { previous };
        },

        onError: (_err, _paymentMethod, context) => {
            // Roll back to whatever was cached before the optimistic update
            if (context?.previous) {
                queryClient.setQueryData(queryKey, context.previous);
            }
        },

        onSuccess: (response) => {
            const session = extractSession(response);
            if (!session) return;

            // Reconcile with the server's actual response (harmless no-op in the
            // common case since it matches what we optimistically set already)
            queryClient.setQueryData(
                queryKey,
                (old: { data: CheckoutSession } | undefined) =>
                    old ? { ...old, data: session } : old
            );
        },
    });
};