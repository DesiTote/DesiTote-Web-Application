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
