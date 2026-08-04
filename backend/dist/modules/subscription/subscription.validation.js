import { z } from "zod";
export const subscribeSchema = z.object({
    email: z
        .email("Invalid email")
        .transform((val) => val.toLowerCase().trim()),
});
//# sourceMappingURL=subscription.validation.js.map