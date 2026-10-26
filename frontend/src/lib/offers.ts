import { Product } from '../types';
import { getColorGroups } from '../utils/variants';
import { BackendOffer } from './apiTypes';
import { SALE } from './sale';

// Picture-only designs a customer may take as a free bag (their group slug).
// Mirror of FREE_GIFT_GROUPS in backend/src/config/offers.ts, which is what the cart enforces.
export const FREE_GIFT_GROUPS: readonly string[] = [
  'desi-print-birdhouse',
  'desi-print-retro-flower',
  'desi-print-modern-floral',
  'desi-print-hand-eye',
  'desi-print-scattered-hearts',
  'desi-print-giraffe-bigeyes',
  'desi-print-giraffe-peek',
  'desi-print-elephant',
  'desi-print-cat-peek',
  'desi-print-cat-box',
  'desi-print-white-floral',
  'desi-print-bear-heart',
  'desi-print-cat-basket',
  'desi-print-poppy',
  'desi-print-cat-heart',
  'desi-print-dolphin',
  'desi-print-hanuman',
  'desi-print-blue-wildflower',
  'desi-print-evil-eye-garden',
  'desi-print-purple-floral',
  'desi-print-sunflower-motif',
  'desi-print-daisy',
  'desi-print-mushroom',
];

export interface FreeBagChoice {
  productId: string;
  name: string;
  colorLabel: string;
  image: string;
}

/** One card per colour of each free-bag design, in catalogue order; a colour with nothing in stock is skipped. */
export function freeBagChoices(products: Product[]): FreeBagChoice[] {
  return products
    .filter((p) => FREE_GIFT_GROUPS.includes(p.id))
    .flatMap((p) =>
      getColorGroups(p).flatMap((group) => {
        const v = group.variants.find((x) => x.stock > 0);
        return v ? [{ productId: v.id, name: p.name, colorLabel: group.label, image: v.image }] : [];
      })
    );
}

/** Free bags still to pick: one per 2 paid totes, minus the free ones already in the bag, never below 0. */
export function freeSlotsLeft(items: { quantity: number; isFreeGift: boolean }[]): number {
  const qty = (free: boolean) => items.reduce((n, i) => n + (i.isFreeGift === free ? i.quantity : 0), 0);
  return Math.max(0, Math.floor(qty(false) / 2) - qty(true));
}

/** What a discount row calls the offer that earned it; a missing or unknown offer is just "Discount". */
export function offerLabel(code: BackendOffer | null | undefined): string {
  switch (code) {
    case 'buy2get1':
      return 'Buy 2 Get 1';
    case 'diwali25':
      return `${SALE.name} ${SALE.percent}% off`;
    case 'firstOrder10':
      return 'First order 10% off';
    default:
      return 'Discount';
  }
}
