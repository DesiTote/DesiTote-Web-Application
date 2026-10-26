import { test } from "node:test";
import assert from "node:assert/strict";
import { checkoutTotals, meetsFreeShippingThreshold } from "./checkoutTotals.js";

test("a 25% sale order reports the markdown as discount", () => {
    const items = [
        { originalPrice: 349, unitPrice: 262, quantity: 1 },
        { originalPrice: 349, unitPrice: 262, quantity: 1 },
    ];
    assert.deepEqual(checkoutTotals(items, 0), { subtotal: 698, discount: 174 });
});

test("a Buy 2 Get 1 order discounts the free bag in full", () => {
    const items = [
        { originalPrice: 349, unitPrice: 349, quantity: 1 },
        { originalPrice: 349, unitPrice: 349, quantity: 1 },
        { originalPrice: 299, unitPrice: 0, quantity: 1 },
    ];
    assert.deepEqual(checkoutTotals(items, 0), { subtotal: 997, discount: 299 });
});

test("a first order's 10% is the order-level discount", () => {
    const items = [{ originalPrice: 349, unitPrice: 349, quantity: 2 }];
    assert.deepEqual(checkoutTotals(items, 70), { subtotal: 698, discount: 70 });
});

test("a first order's 10% does not take the cart below the free-shipping threshold", () => {
    // 3 x 349 = 1047, 10% off = 105: pays 942, but the cart drawer already promised free shipping at 1047.
    assert.equal(meetsFreeShippingThreshold({ subtotal: 1047, discount: 105, offer: "firstOrder10", offerSaving: 105 }, 999), true);
});

test("a 25% sale cart is judged on what is paid", () => {
    assert.equal(meetsFreeShippingThreshold({ subtotal: 1047, discount: 261, offer: "diwali25", offerSaving: 261 }, 999), false);
});

test("a Buy 2 Get 1 cart does not count the free bag", () => {
    assert.equal(meetsFreeShippingThreshold({ subtotal: 1047, discount: 349, offer: "buy2get1", offerSaving: 349 }, 999), false);
});

test("a threshold of 0 charges shipping on every order", () => {
    assert.equal(meetsFreeShippingThreshold({ subtotal: 5000, discount: 0, offer: null, offerSaving: 0 }, 0), false);
});
