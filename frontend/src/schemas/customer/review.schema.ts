import { z } from "zod";

export const createReviewSchema = z.object({
    productId: z.string().min(1, "Product ID is required"),
    rating: z
        .number("Please select a rating")
        .min(1, "Rating must be at least 1 star")
        .max(5, "Rating cannot exceed 5 stars"),
    title: z
        .string()
        .max(100, "Title must be 100 characters or less")
        .optional()
        .or(z.literal("")),
    comment: z
        .string()
        .min(10, "Review comment must be at least 10 characters long")
        .max(1000, "Review comment cannot exceed 1000 characters"),
});

export type CreateReviewInput = z.infer<typeof createReviewSchema>;