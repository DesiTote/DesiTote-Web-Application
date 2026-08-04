import { z } from "zod";

export const subscriptionSchema = z.object({
    email: z
        .email("Invalid email")
        .transform((val) => val.toLowerCase().trim()),
});

export type SubscriptionFormData = z.infer<typeof subscriptionSchema>;