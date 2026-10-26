import { test } from "node:test";
import assert from "node:assert/strict";
import { checkoutTotals } from "./checkoutTotals.js";

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
