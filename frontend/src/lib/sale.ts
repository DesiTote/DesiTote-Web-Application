// Site-wide sale, taken off every price automatically (no code needed).
// To end it early set `enabled: false`; otherwise it switches itself off at
// `endsAt`. backend/src/config/sale.ts must match, since that is what checkout
// actually charges.
export const SALE = {
  enabled: true,
  name: 'Diwali Sale',
  percent: 25,
  endsAt: new Date('2026-11-12T00:00:00+05:30'),
};

export const isSaleOn = (): boolean => SALE.enabled && Date.now() < SALE.endsAt.getTime();

export const salePrice = (price: number): number =>
  isSaleOn() ? Math.round((price * (100 - SALE.percent)) / 100) : price;

/** Last day of the sale, e.g. "11 November". */
export const saleLastDay = (): string =>
  new Date(SALE.endsAt.getTime() - 1).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Kolkata',
  });
