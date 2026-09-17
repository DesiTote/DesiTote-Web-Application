// ─── modules/webhooks/webhooks.route.ts ──────────────────────────
import { Router } from "express";
import { handleRazorpayWebhook } from "./razoprpay.webhook.controller.js";
import { handleShiprocketWebhook } from "./shiprocket.webhook.controller.js";


const router = Router();


router.post("/razorpay", handleRazorpayWebhook);

// Shiprocket refuses to save a webhook URL containing "shiprocket",
// "kartrocket", "sr" or "kr", so the path it is actually configured with is
// /delivery. The original path stays as an alias — same handler, same token
// check — so nothing that already points at it breaks.
router.post("/delivery", handleShiprocketWebhook);
router.post("/shiprocket", handleShiprocketWebhook);

export default router;

/* ────────────────────────────────────────────────────────────
 * Mounting + Razorpay/Shiprocket dashboard configuration
 *
 *
 * Razorpay Dashboard → Settings → Webhooks:
 *   URL: https://yourdomain.com/api/webhooks/razorpay
 *   Secret: generate one, put it in RAZORPAY_WEBHOOK_SECRET env var
 *   Active events to enable: payment.captured, payment.failed,
 *     refund.processed, refund.failed (add more as you need them)
 *
 * Shiprocket Dashboard → Settings → API → Webhooks:
 *   URL: https://yourdomain.com/api/webhooks/delivery
 *   (NOT .../shiprocket — their form rejects that word in the URL)
 *   Custom header + token: set a header name (e.g. "x-api-key") and
 *   a token value, put the SAME token in SHIPROCKET_WEBHOOK_TOKEN
 *
 * Required .env additions:
 *   RAZORPAY_WEBHOOK_SECRET=whsec_xxxxxxxx
 *   SHIPROCKET_WEBHOOK_TOKEN=your-chosen-secret-token
 * ──────────────────────────────────────────────────────────── */