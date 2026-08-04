// ─── lib/razorpay.ts ────────────────────────────────────────
import Razorpay from "razorpay";

let client: Razorpay | null = null;
let publicKeyId: string | null = null;

export function getRazorpayClient(): Razorpay {
    if (client) return client;

    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;

    if (!keyId || !keySecret) {
        throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET is not set in the environment");
    }

    publicKeyId = keyId;
    client = new Razorpay({ key_id: keyId, key_secret: keySecret });
    return client;
}

export function getRazorpayPublicKeyId(): string {
    if (!publicKeyId) getRazorpayClient();
    return publicKeyId as string;
}