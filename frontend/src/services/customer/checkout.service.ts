import { api } from "@/lib/axios";

export interface CreateCheckoutSessionPayload {
    selectedProductIds: string[];
    buyNowItem?: {
        productId: string;
        quantity: number; // Passes transient explicit quantity
    };
}

export const createCheckoutSession = async (
    payload: CreateCheckoutSessionPayload
) => {
    const response = await api.post(
        "/checkout/session",
        payload
    );

    return response.data;
};

export const getCheckoutSession = async (
    sessionId: string
) => {
    const response = await api.get(
        `/checkout/session/${sessionId}`
    );

    return response.data;
};

export const updateCheckoutSessionAddress = async (
    sessionId: string,
    addressId: string
) => {
    const response = await api.patch(
        `/checkout/session/${sessionId}/address`,
        { addressId }
    );

    return response.data;
};

export const updateCheckoutSessionPaymentMethod = async (
    sessionId: string,
    paymentMethod: "COD" | "ONLINE"
) => {
    const response = await api.patch(
        `/checkout/session/${sessionId}/payment-method`,
        { paymentMethod }
    );

    return response.data;
};