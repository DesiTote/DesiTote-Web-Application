// scripts/testRazorpayVerify.ts
// Exercises the Razorpay payment-verification endpoint the way the browser
// callback does, including the tampered-signature path. The checkout widget
// runs in a cross-origin iframe that can't be driven by automation, so this
// covers the security-critical half directly.
//
//   npx tsx src/scripts/testRazorpayVerify.ts <orderId> <email> <password>

import "../config/loadEnv.js"; // must stay first

import crypto from "crypto";
import axios from "axios";

const BASE = `http://localhost:${process.env.PORT || 5000}`;

async function main() {
    const [orderId, email, password] = process.argv.slice(2);
    if (!orderId || !email || !password) {
        console.error("Usage: npx tsx src/scripts/testRazorpayVerify.ts <orderId> <email> <password>");
        process.exit(1);
    }

    // 1. Log in and keep the auth cookie.
    const login = await axios.post(`${BASE}/api/auth/login`, { email, password });
    const cookies = (login.headers["set-cookie"] || []).map((c: string) => c.split(";")[0]).join("; ");
    console.log("[OK]   logged in as", email);

    // 2. Read the order to get its Razorpay order id.
    const orderRes = await axios.get(`${BASE}/api/order/${orderId}`, { headers: { Cookie: cookies } });
    console.log("[OK]   order", orderRes.data.data.orderNumber, "status:", orderRes.data.data.status);

    const razorpayOrderId = process.argv[5] || (await promptRazorpayOrderId(orderId));
    const razorpayPaymentId = "pay_TESTSIMULATED001";

    const post = (body: unknown) =>
        axios.post(`${BASE}/api/order/${orderId}/razorpay/verify`, body, {
            headers: { Cookie: cookies },
            validateStatus: () => true,
        });

    // 3. Tampered signature must be rejected.
    const bad = await post({
        razorpayOrderId,
        razorpayPaymentId,
        razorpaySignature: "0".repeat(64),
    });
    console.log(
        bad.status === 400 ? "[OK]   tampered signature rejected:" : "[FAIL] tampered signature NOT rejected:",
        bad.status,
        bad.data?.message
    );

    // 4. Correctly signed payload must be accepted. This is the exact HMAC
    //    Razorpay computes: sha256(order_id|payment_id) keyed with the secret.
    const validSignature = crypto
        .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET as string)
        .update(`${razorpayOrderId}|${razorpayPaymentId}`)
        .digest("hex");

    const good = await post({ razorpayOrderId, razorpayPaymentId, razorpaySignature: validSignature });
    console.log(
        good.status === 200 ? "[OK]   valid signature accepted:" : "[FAIL] valid signature rejected:",
        good.status,
        JSON.stringify(good.data?.data ?? good.data?.message)
    );

    process.exit(0);
}

async function promptRazorpayOrderId(orderId: string): Promise<string> {
    const mongoose = await import("mongoose");
    await mongoose.default.connect(process.env.MONGO_URI as string);
    const doc = await mongoose.default.connection.db
        ?.collection("orders")
        .findOne({ _id: new mongoose.default.Types.ObjectId(orderId) });
    await mongoose.default.disconnect();
    return doc?.payment?.razorpayOrderId as string;
}

main().catch((err) => {
    console.error("Test crashed:", err.response?.data || err.message);
    process.exit(1);
});
