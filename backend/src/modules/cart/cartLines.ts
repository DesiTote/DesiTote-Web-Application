import { groupOf, type OfferLineInput } from "../offers/applyOffers.js";

// A tote can sit in the cart twice, once paid and once as the free bag, so a line is its product plus that flag.
export const lineKey = (productId: string, isFreeGift: boolean): string => `${productId}:${isFreeGift ? "free" : "paid"}`;

interface PricedProduct {
    price: number;
    discountPrice?: number;
    tags?: string[];
}

// Items whose product is gone are skipped, so they never count toward a free bag.
export const toOfferLines = (
    items: { productId: string; quantity: number; isFreeGift?: boolean }[],
    productsById: Map<string, PricedProduct>
): OfferLineInput[] =>
    items.flatMap((item) => {
        const product = productsById.get(item.productId);
        if (!product) return [];
        return [
            {
                productId: item.productId,
                group: groupOf(product.tags),
                quantity: item.quantity,
                price: product.discountPrice ?? product.price,
                isFreeGift: item.isFreeGift === true,
            },
        ];
    });
