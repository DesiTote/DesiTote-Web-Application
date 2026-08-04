export const computeDiscountPercentage = (price, discountPrice) => {
    if (!discountPrice || discountPrice >= price || price <= 0)
        return 0;
    return Math.round(((price - discountPrice) / price) * 100);
};
//# sourceMappingURL=calculateDiscount.js.map