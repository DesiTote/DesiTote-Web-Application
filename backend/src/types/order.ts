import { CheckoutSession } from "./checkout.js";
export interface CancelOrderInput {
    orderId: string;
    userId: string;
    reason: string;
    note?: string; // free-text detail, required when reason === "Other"
}

export interface CreateRazorpayOrderInput {
    sessionId: string;
    sessionData: CheckoutSession;
    userId: string;
}

export interface PlaceOrderInput {
    sessionId: string; // already validated by middleware
    sessionData: CheckoutSession;
    paymentMethod: "COD" | "ONLINE"; // from the request body — the frontend no longer PATCHes this to the session ahead of time, so this IS the source of truth
    userId: string;
}

export interface VerifyRazorpayPaymentInput {
    orderId: string;
    userId: string;
    razorpayOrderId: string;
    razorpayPaymentId: string;
    razorpaySignature: string;
}