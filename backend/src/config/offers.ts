import { SALE } from "./sale.js";

// Picture-only designs a customer may take as a free bag (their `group:` tag).
// A design added later is not eligible until it is listed here. Mirror in frontend/src/lib/offers.ts.
export const FREE_GIFT_GROUPS: readonly string[] = [
    "desi-print-birdhouse",
    "desi-print-retro-flower",
    "desi-print-modern-floral",
    "desi-print-hand-eye",
    "desi-print-scattered-hearts",
    "desi-print-giraffe-bigeyes",
    "desi-print-giraffe-peek",
    "desi-print-elephant",
    "desi-print-cat-peek",
    "desi-print-cat-box",
    "desi-print-white-floral",
    "desi-print-bear-heart",
    "desi-print-cat-basket",
    "desi-print-poppy",
    "desi-print-cat-heart",
    "desi-print-dolphin",
    "desi-print-hanuman",
    "desi-print-blue-wildflower",
    "desi-print-evil-eye-garden",
    "desi-print-purple-floral",
    "desi-print-sunflower-motif",
    "desi-print-daisy",
    "desi-print-mushroom",
];

// Takes `now` so one request can price every line against the same instant.
export const isOfferWindow = (now: Date): boolean =>
    SALE.enabled && now.getTime() >= SALE.startsAt.getTime() && now.getTime() < SALE.endsAt.getTime();
