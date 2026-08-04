// validators/customer/checkout.validator.js
import z from "zod";
export const createCheckoutSessionSchema = z.object({
    selectedProductIds: z.array(z.string()),
    buyNowItem: z
        .object({
        productId: z.string(),
        quantity: z.number().int().positive(),
    })
        .optional(), // <-- if this field is missing entirely from your schema, it gets silently dropped
});
//# sourceMappingURL=checkout.validation.js.map