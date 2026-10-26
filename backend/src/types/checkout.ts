// ─── types/checkout.ts ────────────────────────────────────────
import type { OfferCode, RemovedFreeLine } from "../modules/offers/applyOffers.js";

export interface CheckoutItem {
    productId: string;
    quantity: number;
    isFreeGift: boolean; // a free bag from Buy 2 Get 1: priceAtCheckout is 0
    priceAtCheckout: number;
    originalPrice:number;
    gstPercentage:number;
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
    charge: number; // freight + cod charge (if applicable) for THIS payment method
    chargeableWeight: number; // kg — actual product weight + packaging weight, no volumetric calc
    packagingBreakdown: { smallBagsCount: number; usesBigBag: boolean };
    calculatedAt: number; // epoch ms
}

export interface CheckoutShippingOptions {
    COD: ShippingQuote | null; // null only if this method wasn't serviceable
    ONLINE: ShippingQuote | null;
}

export type CheckoutStatus = "INITIATED" | "ADDRESS_SELECTED" | "READY" | "PLACED" | "EXPIRED";

export interface CheckoutSession {
    userId: string;
    source: "CART" | "BUY_NOW";
    status: CheckoutStatus | string;

    items: CheckoutItem[];

    subtotal: number; // sum of ORIGINAL prices, before item-level discount
    discount: number; // everything knocked off subtotal: sale markdown, free bags, first-order 10%
    offer: OfferCode | null; // the one offer applied to this order
    offerSaving: number; // rupees that offer took off
    removedFreeLines: RemovedFreeLine[]; // free bags dropped from the cart at checkout, with why
    gstAmount: number; // retained for historical sessions; new checkouts always use 0

    deliveryAddress: CheckoutDeliveryAddress | null;
    paymentMethod: CheckoutPaymentMethod | null;

    // Both COD and ONLINE quotes calculated together as soon as an address is known —
    // switching paymentMethod afterward is then just a lookup, no re-fetch needed.
    shippingOptions: CheckoutShippingOptions | null;
    shippingError: string | null; // set when pincode isn't serviceable for EITHER method

    total: number | null; // subtotal - discount + shippingOptions[paymentMethod].charge, for the CURRENT selection
}
