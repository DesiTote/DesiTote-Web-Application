// ─── types/customer/checkout.type.ts ──────────────────────────

export interface CheckoutItem {
    productId: string;
    quantity: number;
    priceAtCheckout: number;
    originalPrice:number;
    weight: number | null; // kg — captured at session creation so recalculation never re-queries products
    title: string;
    sku:string;
    thumbnail: string;
}

export interface CheckoutDeliveryAddress {
    fullName: string;
    mobileNumber: string;
    addressLine1: string;
    addressLine2?: string;
    district: string;
    state: string;
    pincode: string;
    country: string;
}

export type CheckoutPaymentMethod = "COD" | "ONLINE";

export interface ShippingQuote {
    courierId: number;
    courierName: string;
    charge: number;
    chargeableWeight: number;
    dimensions: { length: number; breadth: number; height: number };
    calculatedAt: number;
}

export interface CheckoutShippingOptions {
    COD: ShippingQuote | null;
    ONLINE: ShippingQuote | null;
}

export interface CheckoutSession {
    userId: string;
    source: "CART" | "BUY_NOW";
    status: string;

    items: CheckoutItem[];

    subtotal: number;
    discount: number;
    gstAmount: number

    deliveryAddress: CheckoutDeliveryAddress | null;
    paymentMethod: CheckoutPaymentMethod | null;

    shippingOptions: CheckoutShippingOptions | null;
    shippingError: string | null;

    total: number | null;
}