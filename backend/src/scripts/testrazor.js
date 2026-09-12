// ─── scripts/test-razorpay-webhook.js ────────────────────────────
// Simulates a real Razorpay webhook call against your local server,
// with a correctly-computed signature, so you can test the full
// verify → process → pushToShiprocket flow WITHOUT needing a real
// Razorpay account or an actual payment.
//
// Usage:
//   node test-razorpay-webhook.js payment.captured <razorpayOrderId>
//   node test-razorpay-webhook.js payment.failed <razorpayOrderId>
//   node test-razorpay-webhook.js refund.processed <razorpayOrderId>
//
// <razorpayOrderId> must match an EXISTING order in your local DB's
// payment.razorpayOrderId field — create one via your normal
// createRazorpayOrderApi flow first, or query Mongo for an existing
// pending_payment order to reuse.

import crypto from "crypto"
import https from "http" // local dev server is plain http

const WEBHOOK_URL = "http://localhost:5000/api/webhooks/razorpay"; // adjust host/port

// Never hardcode this - it must come from the environment. A previous version of
// this file carried the real secret as a fallback, which is why that secret needs
// rotating in the Razorpay dashboard.
const WEBHOOK_SECRET = process.env.RAZORPAY_WEBHOOK_SECRET;
if (!WEBHOOK_SECRET) {
    console.error("RAZORPAY_WEBHOOK_SECRET is not set. Run with your .env loaded, e.g. `npx tsx src/scripts/testrazor.js ...`");
    process.exit(1);
}

const [, , eventType, razorpayOrderId] = process.argv;

if (!eventType || !razorpayOrderId) {
    console.error("Usage: node test-razorpay-webhook.js <event_type> <razorpayOrderId>");
    console.error("e.g.:  node test-razorpay-webhook.js payment.captured order_ABC123");
    process.exit(1);
}

function buildPayload(eventType, razorpayOrderId) {
    const fakePaymentId = "pay_" + crypto.randomBytes(7).toString("hex");
    const fakeEventId = "evt_" + crypto.randomBytes(7).toString("hex");

    const basePaymentEntity = {
        id: fakePaymentId,
        order_id: razorpayOrderId,
        amount: 49900, // paise — adjust to match your test order's total
        currency: "INR",
        status: eventType === "payment.captured" ? "captured" : "failed",
        error_description: eventType === "payment.failed" ? "Card declined" : undefined,
    };

    if (eventType === "refund.processed" || eventType === "refund.failed") {
        return {
            id: fakeEventId,
            event: eventType,
            payload: {
                refund: {
                    entity: {
                        id: "rfnd_" + crypto.randomBytes(7).toString("hex"),
                        amount: 49900,
                        notes: { razorpayOrderId },
                    },
                },
            },
        };
    }

    return {
        id: fakeEventId,
        event: eventType,
        payload: {
            payment: { entity: basePaymentEntity },
        },
    };
}

const payload = buildPayload(eventType, razorpayOrderId);
const rawBody = JSON.stringify(payload);

const signature = crypto.createHmac("sha256", WEBHOOK_SECRET).update(rawBody).digest("hex");

const url = new URL(WEBHOOK_URL);

const req = https.request(
    {
        hostname: url.hostname,
        port: url.port,
        path: url.pathname,
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(rawBody),
            "x-razorpay-signature": signature,
        },
    },
    (res) => {
        let body = "";
        res.on("data", (chunk) => (body += chunk));
        res.on("end", () => {
            console.log(`Status: ${res.statusCode}`);
            console.log(`Response: ${body}`);
        });
    }
);

req.on("error", (err) => console.error("Request failed:", err.message));
req.write(rawBody);
req.end();

console.log(`Sent ${eventType} for ${razorpayOrderId}...`);