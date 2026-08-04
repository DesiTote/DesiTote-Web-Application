import { z } from "zod";

export const ProductStatusEnum = z.enum(["ACTIVE", "DRAFT", "ARCHIVED"]);
export const ProductCategoryEnum = z.enum(["Tote Bag", "Tshirt", "Hoodie"]);

const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/jpg", "image/png", "image/webp"];

// Combined validation rule: Accepts raw binary Files OR pre-existing string URLs
const mixedImageSchema = z.union([
    z.url("Must be a valid asset image URL"),
    z.any()
        .refine((file) => file instanceof File, "Must be a valid file object.")
        .refine((file) => file?.size <= MAX_FILE_SIZE, `Max image size is 5MB.`)
        .refine(
            (file) => ACCEPTED_IMAGE_TYPES.includes(file?.type),
            "Only .jpg, .jpeg, .png and .webp formats are supported."
        )
]);

export const productZodSchema = z
    .object({
        title: z.string().min(1, "Title is required").trim(),
        slug: z.string().min(1, "Slug is required").lowercase().trim(),
        description: z.string().min(1, "Description is required").trim(),
        shortDescription: z.string().min(1, "Short description is required").trim(),
        color: z.string().min(1, "Color is required").trim(),
        material: z.string().min(1, "Material is required").trim(),
        productCategory: ProductCategoryEnum,
        tags: z.array(z.string().trim().lowercase()),

        /* Pricing & Logistics */
        price: z.coerce.number().min(1, "Price must be a positive number").positive(),
        costPrice: z.coerce.number().min(1, "Cost price must be a positive number").positive(),
        discountPrice: z.coerce.number().min(1, "Discount price must be a positive number").positive(),
        gstPercentage:z.coerce.number().min(1,"GST percentage  must be a positive number").positive(),
        weight: z.coerce.number().min(0.01, "Weight must be at least 0.01 kg"),

        dimensions: z.object({
            length: z.coerce.number().min(1, "Length must be a positive number").positive(),
            breadth: z.coerce.number().min(1, "Breadth must be a positive number").positive(),
            height: z.coerce.number().min(1, "Height must be a positive number").positive(),
        }),

        /* Inventory */
        stock: z.coerce.number().min(1, "Stock quantity must be a positive number").positive().int(),
        sku: z.string().min(3, "SKU must have at least 3 characters"),

        /* Dynamic Media Elements */
        images: z.array(mixedImageSchema).min(1, "Please upload at least one product image"),
        thumbnailIndex: z.coerce.number().min(0, "Thumbnail choice must be a positive index"),

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
            message: "Discount price must be less than the original price",
            path: ["discountPrice"],
        }
    )
    .refine(
        (data) => data.thumbnailIndex < data.images.length,
        {
            message: "Selected thumbnail index is out of bounds",
            path: ["thumbnailIndex"],
        }
    );

export type ProductFormValues = z.infer<typeof productZodSchema>;