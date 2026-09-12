// scripts/testFreeShipping.ts
// Checks the free-shipping threshold against the live Shiprocket rates by
// building a checkout session below the threshold and one above it.
//
//   npx tsx src/scripts/testFreeShipping.ts <email> <password>

import "../config/loadEnv.js"; // must stay first

import axios from "axios";

const BASE = `http://localhost:${process.env.PORT || 5000}`;
const THRESHOLD = Number(process.env.FREE_SHIPPING_THRESHOLD ?? 999);

async function main() {
    const [email, password] = process.argv.slice(2);
    const login = await axios.post(`${BASE}/api/auth/login`, { email, password });
    const cookies = (login.headers["set-cookie"] || []).map((c: string) => c.split(";")[0]).join("; ");
    const h = { Cookie: cookies };

    // Pick a product and work out the quantity needed to cross the threshold.
    const list = await axios.get(`${BASE}/api/products?limit=40`);
    const product = list.data.data.products.find((p: any) => p.stock > 10);
    const unit = product.discountPrice;
    const qtyUnder = 1;
    const qtyOver = Math.ceil((THRESHOLD + 1) / unit);

    console.log(`threshold: Rs${THRESHOLD} | product: ${product.title} @ Rs${unit}\n`);

    for (const [label, qty] of [["BELOW", qtyUnder], ["ABOVE", qtyOver]] as [string, number][]) {
        await axios.delete(`${BASE}/api/cart/clear`, { headers: h }).catch(() => {});
        await axios.post(`${BASE}/api/cart/add`, { productId: product._id, quantity: qty }, { headers: h });

        const created = await axios.post(
            `${BASE}/api/checkout/session`,
            { selectedProductIds: [product._id] },
            { headers: h }
        );
        const sessionId = created.data.data.sessionId;
        const session = await axios.get(`${BASE}/api/checkout/session/${sessionId}`, { headers: h });
        const s = session.data.data;

        const online = s.shippingOptions?.ONLINE;
        console.log(
            `${label} threshold: qty ${qty} | subtotal Rs${s.subtotal} | shipping Rs${online?.charge} ` +
                `| courier "${online?.courierName}" | weight ${online?.chargeableWeight}kg`
        );
    }

    await axios.delete(`${BASE}/api/cart/clear`, { headers: h }).catch(() => {});
    process.exit(0);
}

main().catch((err) => {
    console.error("failed:", err.response?.data || err.message);
    process.exit(1);
});
