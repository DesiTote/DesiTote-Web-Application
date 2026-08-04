// ─── modules/webhooks/razorpay.webhook.controller.ts ─────────────
import { Request, Response, NextFunction } from "express";
import { verifyRazorpaySignature, processRazorpayWebhookEvent } from "./razorpay.webhook.service.js";

export async function handleRazorpayWebhook(req: Request, res: Response, next: NextFunction) {
    try {

        const rawBody: string = (req as any).rawBody;
        const signature = req.headers["x-razorpay-signature"] as string | undefined;

        const isValid = verifyRazorpaySignature(rawBody, signature);

        if (!isValid) {
            return res.status(400).json({ success: false, message: "Invalid webhook signature" });
        }

        const result = await processRazorpayWebhookEvent(req.body);
        console.log("[razorpay-webhook]", result);
        return res.status(200).json({ success: true });
    } catch (error) {

        next(error);
    }
}