// ─── lib/razorpay.ts ────────────────────────────────────────
import Razorpay from "razorpay";
let client = null;
let publicKeyId = null;
export function getRazorpayClient() {
    if (client)
        return client;
    const keyId = process.env.RAZORPAY_KEY_ID;
    const keySecret = process.env.RAZORPAY_KEY_SECRET;
    if (!keyId || !keySecret) {
        throw new Error("RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET is not set in the environment");
    }
    publicKeyId = keyId;
    client = new Razorpay({ key_id: keyId, key_secret: keySecret });
    return client;
}
export function getRazorpayPublicKeyId() {
    if (!publicKeyId)
        getRazorpayClient();
    return publicKeyId;
}
//# sourceMappingURL=razorpay.js.map