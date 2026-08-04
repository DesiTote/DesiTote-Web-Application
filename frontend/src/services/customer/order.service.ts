// ─── services/order.service.ts ───────────────────────────────
import { api } from "@/lib/axios"; // your configured axios instance
import { PlaceOrderPayload, PlaceOrderResponse, RecentOrder, CancelOrderPayload } from "@/types/customer/order.type";


export async function placeOrderApi(
    payload: PlaceOrderPayload
): Promise<PlaceOrderResponse> {
    const { sessionId, ...body } = payload;
    const res = await api.post(
        `/order/${sessionId}/place-order`,
        body
    );
    return res.data;
}

export async function getOrderDetails(orderId: string) {
    const response = await api.get(`/order/${orderId}`);
    return response.data; // Expected output structure: { success: true, data: {...} }
}


export async function getRecentOrders(): Promise<{ success: boolean; data: RecentOrder[] }> {
    console.log('working')
    const response = await api.get("/order/recent");
    return response.data;
}

export async function cancelOrderApi(payload: CancelOrderPayload) {
    const { orderId, ...body } = payload;
    const response = await api.post(`/order/${orderId}/cancel`, body);
    return response.data;
}

export async function createRazorpayOrderApi(sessionId: string) {
    const response = await api.post(`/order/${sessionId}/razorpay/create`);
    return response.data;
}

export async function verifyRazorpayPaymentApi(
    orderId: string,
    payload: { razorpayOrderId: string; razorpayPaymentId: string; razorpaySignature: string }
) {
    const response = await api.post(`/order/${orderId}/razorpay/verify`, payload);
    return response.data;
}