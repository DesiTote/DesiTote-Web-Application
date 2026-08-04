export const computeDiscountPercentage = (price: number, discountPrice?: number): number => {
    if (!discountPrice || discountPrice >= price || price <= 0) return 0;
    return Math.round(((price - discountPrice) / price) * 100);
};