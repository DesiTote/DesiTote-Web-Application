// scripts/testRefundOnCancel.ts
// Offline check of refundPaidOrder: no database, no real Razorpay call. The
// Order model and the Razorpay client are stubbed in memory.
//
//   npx tsx src/scripts/testRefundOnCancel.ts

import assert from "assert";

process.env.RAZORPAY_KEY_ID ||= "rzp_test_dummy";
process.env.RAZORPAY_KEY_SECRET ||= "dummy";

const { Order } = await import("../modules/order/order.model.js");
const { getRazorpayClient } = await import("../config/razorpay.js");
const { refundPaidOrder } = await import("../modules/order/order.service.js");

// One in-memory order, with just enough of Mongo's update semantics.
let row: any;
const apply = (update: any) => {
    for (const [k, v] of Object.entries(update)) {
        if (k === "$push") continue;
        const [a, b] = k.split(".");
        if (b) row[a][b] = v; else row[a] = v;
    }
    return structuredClone(row);
};
(Order as any).findOneAndUpdate = async (filter: any, update: any) => {
    const blocked = filter["payment.refundStatus"].$nin.includes(row.payment.refundStatus);
    return row.payment.status === "paid" && !blocked ? apply(update) : null;
};
(Order as any).findByIdAndUpdate = async (_id: any, update: any) => apply(update);

let refundCalls = 0;
let failRefund = false;
getRazorpayClient().payments.refund = (async (paymentId: string) => {
    refundCalls++;
    if (failRefund) throw { error: { description: "boom" } };
    return { id: "rfnd_1", amount: 49900, payment_id: paymentId };
}) as any;

const paidOrder = () => ({
    _id: "o1", orderNumber: 1, status: "cancelled",
    payment: { method: "ONLINE", status: "paid", razorpayPaymentId: "pay_1", razorpayOrderId: "order_1", refundStatus: "none" },
});

// Paid online order: refunded once, a second cancel does not refund again.
row = paidOrder();
let out: any = await refundPaidOrder(row);
assert.equal(out.payment.refundStatus, "initiated");
assert.equal(out.payment.refundId, "rfnd_1");
assert.equal(await refundPaidOrder(row), null);
assert.equal(refundCalls, 1);

// COD order: nothing to refund.
row = { ...paidOrder(), payment: { method: "COD", status: "pending" } };
assert.equal(await refundPaidOrder(row), null);
assert.equal(refundCalls, 1);

// Razorpay error: marked failed so it can be refunded by hand.
row = paidOrder();
failRefund = true;
out = await refundPaidOrder(row);
assert.equal(out.payment.refundStatus, "failed");

console.log("[OK] refundPaidOrder");
process.exit(0);
