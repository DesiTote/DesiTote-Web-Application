import { test } from "node:test";
import assert from "node:assert/strict";
import { checkFreeGiftAdd } from "../offers/applyOffers.js";
import { lineKey, toOfferLines } from "./cartLines.js";

const NOV5 = new Date("2026-11-05T12:00:00+05:30");

const products = new Map([
    ["tote", { price: 499, discountPrice: 349, tags: ["zip:with"] }],
    ["elephant", { price: 399, tags: ["zip:with", "group:desi-print-elephant"] }],
    ["plain", { price: 399, discountPrice: 299, tags: ["group:solid-canvas"] }],
]);

test("line key separates paid and free copies of one tote", () => {
    assert.notEqual(lineKey("elephant", false), lineKey("elephant", true));
    assert.equal(lineKey("elephant", true), lineKey("elephant", true));
    assert.notEqual(lineKey("elephant", true), lineKey("tote", true));
});

test("raising a free line past the allowance is refused", () => {
    const lines = toOfferLines(
        [
            { productId: "tote", quantity: 2 },
            { productId: "elephant", quantity: 1, isFreeGift: true },
        ],
        products
    );
    const group = "desi-print-elephant";
    assert.equal(checkFreeGiftAdd(lines, { group, quantity: 1 }, NOV5), "Add 2 more totes for another free bag");
    assert.equal(checkFreeGiftAdd(lines, { group, quantity: 0 }, NOV5), null);
});

test("free bag from an unlisted design is refused", () => {
    const lines = toOfferLines([{ productId: "tote", quantity: 2 }], products);
    assert.equal(checkFreeGiftAdd(lines, { group: "solid-canvas", quantity: 1 }, NOV5), "Free bags are only from the picture designs");
    assert.equal(checkFreeGiftAdd(lines, { group: null, quantity: 1 }, NOV5), "Free bags are only from the picture designs");
    assert.equal(checkFreeGiftAdd(lines, { group: "desi-print-elephant", quantity: 1 }, NOV5), null);
});

test("toOfferLines reads group from tags and price from discountPrice", () => {
    const lines = toOfferLines(
        [
            { productId: "tote", quantity: 2 },
            { productId: "elephant", quantity: 1, isFreeGift: true },
            { productId: "plain", quantity: 1 },
            { productId: "gone", quantity: 3 },
        ],
        products
    );
    assert.deepEqual(lines, [
        { productId: "tote", group: null, quantity: 2, price: 349, isFreeGift: false },
        { productId: "elephant", group: "desi-print-elephant", quantity: 1, price: 399, isFreeGift: true },
        { productId: "plain", group: "solid-canvas", quantity: 1, price: 299, isFreeGift: false },
    ]);
});
