// Site-wide sale, taken off every price automatically (no code needed).
// It switches itself on at `startsAt` and off at `endsAt`; set `enabled: false`
// to end it early. backend/src/config/sale.ts must match, since that is what
// checkout actually charges.
export const SALE = {
  enabled: true,
  name: 'Diwali Sale',
  percent: 25,
  startsAt: new Date('2026-11-01T00:00:00+05:30'),
  endsAt: new Date('2026-11-12T00:00:00+05:30'),
};

export const isSaleOn = (): boolean => SALE.enabled && Date.now() >= SALE.startsAt.getTime() && Date.now() < SALE.endsAt.getTime();

export const salePrice = (price: number): number =>
  isSaleOn() ? Math.round((price * (100 - SALE.percent)) / 100) : price;

/** Last day of the sale, e.g. "11 November". */
export const saleLastDay = (): string =>
  new Date(SALE.endsAt.getTime() - 1).toLocaleDateString('en-IN', {
    day: 'numeric',
    month: 'long',
    timeZone: 'Asia/Kolkata',
  });
