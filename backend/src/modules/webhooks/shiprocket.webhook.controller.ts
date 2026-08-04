// ─── modules/webhooks/shiprocket.webhook.controller.ts ───────────
import { Request, Response, NextFunction } from "express";
import { verifyShiprocketToken, processShiprocketWebhookEvent } from "./shiprocket.webhook.service.js";

export async function handleShiprocketWebhook(req: Request, res: Response, next: NextFunction) {
    try {
        // Adjust header name to whatever you configure in the Shiprocket
        // dashboard's webhook settings — "x-api-key" is a common choice.
        const token = req.headers["x-api-key"] as string | undefined;

        const isValid = verifyShiprocketToken(token);
        if (!isValid) {
            return res.status(401).json({ success: false, message: "Invalid webhook token" });
        }

        const result = await processShiprocketWebhookEvent(req.body);

        console.log("[shiprocket-webhook]", result);
        return res.status(200).json({ success: true });
    } catch (error) {
        next(error);
    }
}