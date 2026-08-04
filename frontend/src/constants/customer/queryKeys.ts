// constants/queryKeys.ts

export const QUERY_KEYS = {
    CART: ["cart"],

    CHECKOUT_SESSION: (
        sessionId: string
    ) => ["checkout-session", sessionId],

    ADDRESSES: ["addresses"],
};

