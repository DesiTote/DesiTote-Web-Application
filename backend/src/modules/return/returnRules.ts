import type { ReturnReason } from "./return.constant.js";

// Buy 2 Get 1 orders are final sale: only a damaged or wrong item can come back.
const FINAL_SALE_REASONS: readonly ReturnReason[] = ["Defective or damaged product", "Wrong item received"];

// Old order lines have no isFreeGift flag, so missing means paid.
export function canReturnLine(item: { isFreeGift?: boolean }): boolean {
    return item.isFreeGift !== true;
}

export function reasonAllowed(order: { finalSale?: boolean }, reason: ReturnReason): boolean {
    return order.finalSale !== true || FINAL_SALE_REASONS.includes(reason);
}
