import type { OfferCode } from "../offers/applyOffers.js";

interface TotalsLine {
    originalPrice: number;
    unitPrice: number;
    quantity: number;
}

// subtotal is the MRP total; discount is everything knocked off it: per-line markdowns, free bags and the order-level first-order 10%.
export const checkoutTotals = (items: TotalsLine[], orderLevelDiscount: number): { subtotal: number; discount: number } => {
    const subtotal = items.reduce((s, i) => s + i.originalPrice * i.quantity, 0);
    const paid = items.reduce((s, i) => s + i.unitPrice * i.quantity, 0);
    return { subtotal, discount: subtotal - paid + orderLevelDiscount };
};

// The cart drawer shows "Free Shipping Unlocked" from item prices and cannot know first-order status, so the
// first-order 10% is added back here; sale markdowns and free bags are not, they really are not paid.
export const meetsFreeShippingThreshold = (
    cart: { subtotal: number; discount: number; offer: OfferCode | null; offerSaving: number },
    threshold: number
): boolean => threshold > 0 && cart.subtotal - cart.discount + (cart.offer === "firstOrder10" ? cart.offerSaving : 0) >= threshold;
