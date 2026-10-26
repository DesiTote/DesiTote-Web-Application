import { FREE_GIFT_GROUPS, isOfferWindow } from "../../config/offers.js";
import { SALE } from "../../config/sale.js";

export type OfferCode = "buy2get1" | "diwali25" | "firstOrder10";

export interface OfferLineInput {
    productId: string;
    group: string | null;
    quantity: number;
    price: number; // discountPrice ?? price
    isFreeGift: boolean;
}

export interface PricedLine extends OfferLineInput {
    unitPrice: number;
}

export interface RemovedFreeLine {
    productId: string;
    quantity: number;
    reason: "not_allowed" | "not_eligible" | "offer_ended";
}

export interface OfferResult {
    lines: PricedLine[];
    offer: OfferCode | null;
    offerSaving: number;
    orderLevelDiscount: number;
    removedFreeLines: RemovedFreeLine[];
}

const FIRST_ORDER_PERCENT = 10;

export const groupOf = (tags?: string[]): string | null => tags?.find((t) => t.startsWith("group:"))?.slice("group:".length) ?? null;

// Testing hook: lets a local or preview server price as if it were another day. Never honoured in production.
export const offersNow = (): Date =>
    process.env.OFFERS_NOW && process.env.NODE_ENV !== "production" ? new Date(process.env.OFFERS_NOW) : new Date();

const isEligible = (group: string | null): boolean => group !== null && FREE_GIFT_GROUPS.includes(group);

const sumQuantity = (lines: OfferLineInput[], isFreeGift: boolean): number =>
    lines.filter((l) => l.isFreeGift === isFreeGift).reduce((n, l) => n + l.quantity, 0);

// Total free bags a cart earns: 1 for every 2 paid totes.
export const freeGiftAllowance = (lines: OfferLineInput[]): number => Math.floor(sumQuantity(lines, false) / 2);

export const checkFreeGiftAdd = (lines: OfferLineInput[], add: { group: string | null; quantity: number }, now: Date): string | null => {
    if (!SALE.enabled || now.getTime() >= SALE.endsAt.getTime()) return "Buy 2 Get 1 ended on 11 November";
    if (now.getTime() < SALE.startsAt.getTime()) return "Buy 2 Get 1 starts on 1 November";
    if (!isEligible(add.group)) return "Free bags are only from the picture designs";
    const allowance = freeGiftAllowance(lines);
    if (allowance === 0) return "Add 2 totes to get a free bag";
    if (sumQuantity(lines, true) + add.quantity > allowance) return "Add 2 more totes for another free bag";
    return null;
};

export const applyOffers = (lines: OfferLineInput[], ctx: { now: Date; isFirstOrder: boolean }): OfferResult => {
    const inWindow = isOfferWindow(ctx.now);
    const removedFreeLines: RemovedFreeLine[] = [];
    let freeLeft = freeGiftAllowance(lines);
    const kept: OfferLineInput[] = [];

    for (const line of lines) {
        if (!line.isFreeGift) {
            kept.push(line);
            continue;
        }
        const reason = !inWindow ? "offer_ended" : !isEligible(line.group) ? "not_eligible" : null;
        const quantity = reason ? 0 : Math.min(line.quantity, freeLeft);
        freeLeft -= quantity;
        if (quantity < line.quantity) {
            removedFreeLines.push({ productId: line.productId, quantity: line.quantity - quantity, reason: reason ?? "not_allowed" });
        }
        if (quantity > 0) kept.push({ ...line, quantity });
    }

    const hasFree = kept.some((l) => l.isFreeGift);
    const offer: OfferCode | null = inWindow ? (hasFree ? "buy2get1" : "diwali25") : ctx.isFirstOrder ? "firstOrder10" : null;
    const unitPriceOf = (l: OfferLineInput): number =>
        l.isFreeGift ? 0 : offer === "diwali25" ? Math.round((l.price * (100 - SALE.percent)) / 100) : l.price;
    const priced = kept.map((l) => ({ ...l, unitPrice: unitPriceOf(l) }));

    const orderLevelDiscount =
        offer === "firstOrder10" ? Math.round((priced.reduce((s, l) => s + l.price * l.quantity, 0) * FIRST_ORDER_PERCENT) / 100) : 0;
    const offerSaving = offer === "firstOrder10" ? orderLevelDiscount : priced.reduce((s, l) => s + (l.price - l.unitPrice) * l.quantity, 0);

    return { lines: priced, offer, offerSaving, orderLevelDiscount, removedFreeLines };
};
