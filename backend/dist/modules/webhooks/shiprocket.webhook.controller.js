import { verifyShiprocketToken, processShiprocketWebhookEvent } from "./shiprocket.webhook.service.js";
export async function handleShiprocketWebhook(req, res, next) {
    try {
        // Adjust header name to whatever you configure in the Shiprocket
        // dashboard's webhook settings — "x-api-key" is a common choice.
        const token = req.headers["x-api-key"];
        const isValid = verifyShiprocketToken(token);
        if (!isValid) {
            return res.status(401).json({ success: false, message: "Invalid webhook token" });
        }
        const result = await processShiprocketWebhookEvent(req.body);
        console.log("[shiprocket-webhook]", result);
        return res.status(200).json({ success: true });
    }
    catch (error) {
        next(error);
    }
}
//# sourceMappingURL=shiprocket.webhook.controller.js.map