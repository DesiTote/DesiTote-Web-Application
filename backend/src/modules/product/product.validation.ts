import { z } from "zod";

export const ProductStatusEnum = z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]);
export const ProductCategoryEnum = z.enum(["Tote Bag", "Tshirt", "Hoodie"]);


export const productZodSchema = z
    .object({
        title: z.string().min(1, "Title is required").trim(),
        slug: z.string().min(1, "Slug is required").lowercase().trim(),
        description: z.string().min(1, "Description is required").trim(),
        shortDescription: z.string().min(1, "Short description is required").trim(),
        color: z.string().min(1, "Color is required").trim(),
        material: z.string().min(1, "Material is required").trim(),
        productCategory: ProductCategoryEnum,
        tags: z.preprocess(
            (value) => {
                if (typeof value === "string") {
                    return JSON.parse(value);
                }
                return value;
            },
            z.array(z.string().trim().toLowerCase())
        ),

        /* Pricing & Logistics */
        price: z
            .coerce
            .number()
            .min(1, "Price must be a positive number").positive(),
        // 0 is valid and is the model's default — it means "cost not tracked".
        // Requiring >= 1 made every seeded product unsaveable from the admin panel.
        costPrice: z
            .coerce
            .number()
            .min(0, "Cost price cannot be negative"),
        discountPrice: z
            .coerce
            .number()
            .min(1, "Discount price must be a positive number").positive(),
        gstPercentage:z.coerce.number().min(1,"GST percentage  must be a positive number").positive(),
        weight: z.coerce
            .number()
            .min(0.01, "Weight must be at least 0.01 kg"),

        dimensions: z.preprocess(
            (value) => {
                if (typeof value === "string") {
                    return JSON.parse(value);
                }
                return value;
            },
            z.object({
                length: z.coerce.number().positive(),
                breadth: z.coerce.number().positive(),
                height: z.coerce.number().positive(),
            })
        ),

        /* Inventory */
        // 0 must be allowed — it's how an item gets marked sold out.
        stock: z
            .coerce
            .number()
            .min(0, "Stock quantity cannot be negative").int(),
        sku: z.string().min(3, "SKU must have at least 3 characters"),

        existingImages: z
            .preprocess((value) => {
                // If nothing was sent, return an empty array to satisfy the schema downstream
                if (value === undefined || value === null || value === "") {
                    return [];
                }
                // If it's a single string URL, wrap it in an array structure safely
                if (typeof value === "string") {
                    return [value];
                }
                // If it's already an array, pass it right through
                return value;
            }, z.array(z.string().trim()))
            .optional(),

        thumbnailIndex: z
            .coerce
            .number()
            .min(0, "Thumbnail choice must be a positive index"),

        /* Flags */
        isFeatured: z.coerce.boolean(),
        isPublished: z.coerce.boolean(),

        status: ProductStatusEnum,
    })
    .refine(
        (data) => {
            if (data.discountPrice !== undefined && data.discountPrice !== null) {
                return data.discountPrice <= data.price;
            }
            return true;
        },
        {
            message: "Discount price must be less than or equal to the original price",
            path: ["discountPrice"],
        }
    )


export type ProductFormValues = z.input<typeof productZodSchema>;