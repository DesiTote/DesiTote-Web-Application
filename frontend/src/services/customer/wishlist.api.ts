import { api } from "@/lib/axios";

export interface ToggleWishlistPayload {
    productId: string;
}

export const toggleWishlistService = async (
    payload: ToggleWishlistPayload
) => {

    const { data } = await api.post(
        "/wishlist/toggle",
        payload
    );

    return data;
};

export const getWishlistService = async () => {

    const { data } = await api.get(
        "/wishlist"
    );

    return data;
};

export const removeWishlistService = async (
    productId: string
) => {

    const { data } = await api.delete(
        `/wishlist/${productId}`
    );

    return data;
};