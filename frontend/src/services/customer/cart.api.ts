

import { api } from "@/lib/axios";

// ➕ Add to cart
export const addToCartAPI = async (data: {
    productId: string;
    quantity: number;
}) => {
    const res = await api.post("/cart/add", data);
    return res.data.data;
};

// 📦 Get cart
export const getCartAPI = async () => {
    const res = await api.get("/cart");
    return res.data.data;
};

// ✏️ Update Quantity
export const updateCartQuantityAPI = async (data: {
    productId: string;
    quantity: number;
}) => {
    const res = await api.patch(`/cart/update-quantity/${data.productId}`, data);
    return res.data.data;
};

// ❌ Remove Product
export const removeCartItemAPI = async (productId: string) => {
    const res = await api.delete(`/cart/remove-item/${productId}`);
    return res.data.data;
};

// 🗑️ Clear Cart
export const clearCartAPI = async () => {
    const res = await api.delete("/cart/clear");
    return res.data.data;
};