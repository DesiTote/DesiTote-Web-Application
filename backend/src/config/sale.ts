// Site-wide sale applied to every checkout. Must match
// frontend/src/lib/sale.ts, which shows the same prices in the shop.
// Set `enabled: false` to end it early; it also ends by itself at `endsAt`.
export const SALE = {
    enabled: true,
    percent: 25,
    endsAt: new Date("2026-11-12T00:00:00+05:30"),
};

export const isSaleOn = (): boolean => SALE.enabled && Date.now() < SALE.endsAt.getTime();

export const salePrice = (price: number): number =>
    isSaleOn() ? Math.round((price * (100 - SALE.percent)) / 100) : price;
