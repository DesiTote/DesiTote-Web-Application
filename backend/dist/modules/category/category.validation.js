import { z } from "zod";
export const categorySchema = z.object({
    name: z
        .string()
        .trim()
        .min(2, "Category name required")
        .max(50),
    description: z
        .string()
        .trim()
        .max(300)
        .optional(),
    image: z
        .string()
        .url()
        .optional(),
    isActive: z.boolean().optional(),
});
//# sourceMappingURL=category.validation.js.map