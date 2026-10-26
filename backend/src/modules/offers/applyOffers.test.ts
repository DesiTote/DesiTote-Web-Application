import { test } from "node:test";
import assert from "node:assert/strict";
import { FREE_GIFT_GROUPS, isOfferWindow } from "../../config/offers.js";
import { applyOffers, checkFreeGiftAdd, freeGiftAllowance, groupOf, offersNow, type OfferLineInput } from "./applyOffers.js";

const NOV5 = new Date("2026-11-05T12:00:00+05:30");
const NOV15 = new Date("2026-11-15T12:00:00+05:30");
const OCT26 = new Date("2026-10-26T12:00:00+05:30");

const paid = (quantity: number, productId = "tote"): OfferLineInput => ({ productId, group: null, quantity, price: 349, isFreeGift: false });
const free = (quantity: number, productId = "elephant", group = "desi-print-elephant"): OfferLineInput => ({ productId, group, quantity, price: 299, isFreeGift: true });
const ctx = (now: Date, isFirstOrder = false) => ({ now, isFirstOrder });

test("the free-bag list has the 23 picture designs", () => {
    assert.equal(FREE_GIFT_GROUPS.length, 23);
    assert.equal(new Set(FREE_GIFT_GROUPS).size, 23);
});

test("groupOf reads the group tag", () => {
    assert.equal(groupOf(["zip:with", "group:desi-print-elephant"]), "desi-print-elephant");
    assert.equal(groupOf(["zip:with"]), null);
    assert.equal(groupOf(undefined), null);
});

test("sale edges", () => {
    assert.equal(isOfferWindow(new Date("2026-11-01T00:00:00+05:30")), true);
    assert.equal(isOfferWindow(new Date("2026-10-31T23:59:59+05:30")), false);
    assert.equal(isOfferWindow(new Date("2026-11-11T23:59:59+05:30")), true);
    assert.equal(isOfferWindow(new Date("2026-11-12T00:00:00+05:30")), false);
});

test("2 paid + 1 free during the sale is buy2get1", () => {
    const r = applyOffers([paid(2), free(1)], ctx(NOV5));
    assert.equal(r.offer, "buy2get1");
    assert.equal(r.lines[0].unitPrice, 349);
    assert.equal(r.lines[1].unitPrice, 0);
    assert.equal(r.offerSaving, 299);
    assert.equal(r.orderLevelDiscount, 0);
    assert.deepEqual(r.removedFreeLines, []);
});

test("paid lines only during the sale get 25%", () => {
    const r = applyOffers([paid(1, "a"), paid(1, "b"), paid(1, "c")], ctx(NOV5));
    assert.deepEqual(r.lines.map((l) => l.unitPrice), [262, 262, 262]);
    assert.equal(r.offer, "diwali25");
    assert.equal(r.offerSaving, 261);
    assert.equal(r.orderLevelDiscount, 0);
});

test("4 paid + 3 free keeps 2 free and removes 1 as not_allowed", () => {
    const r = applyOffers([paid(4), free(2, "first"), free(1, "second")], ctx(NOV5));
    assert.equal(r.offer, "buy2get1");
    assert.deepEqual(r.lines.filter((l) => l.isFreeGift).map((l) => [l.productId, l.quantity]), [["first", 2]]);
    assert.deepEqual(r.removedFreeLines, [{ productId: "second", quantity: 1, reason: "not_allowed" }]);
});

test("a free line partly over the allowance keeps the allowed part", () => {
    const r = applyOffers([paid(2), free(3)], ctx(NOV5));
    assert.equal(r.lines[1].quantity, 1);
    assert.deepEqual(r.removedFreeLines, [{ productId: "elephant", quantity: 2, reason: "not_allowed" }]);
});

test("ineligible group is removed as not_eligible", () => {
    const r = applyOffers([paid(2), free(1, "namaste", "desi-print-namaste")], ctx(NOV5));
    assert.deepEqual(r.removedFreeLines, [{ productId: "namaste", quantity: 1, reason: "not_eligible" }]);
    assert.equal(r.lines.length, 1);
    assert.equal(r.offer, "diwali25");
});

test("outside the sale every free line is removed as offer_ended", () => {
    const r = applyOffers([paid(2), free(1)], ctx(NOV15));
    assert.deepEqual(r.removedFreeLines, [{ productId: "elephant", quantity: 1, reason: "offer_ended" }]);
    assert.equal(r.lines.length, 1);
    assert.equal(r.offer, null);
    assert.equal(r.offerSaving, 0);
    assert.equal(r.lines[0].unitPrice, 349);
});

test("first order outside the sale gets 10%", () => {
    const r = applyOffers([paid(1, "a"), paid(1, "b")], ctx(NOV15, true));
    assert.equal(r.offer, "firstOrder10");
    assert.equal(r.orderLevelDiscount, 70);
    assert.equal(r.offerSaving, 70);
    assert.deepEqual(r.lines.map((l) => l.unitPrice), [349, 349]);
});

test("first order during the sale gets 25%, not 10%", () => {
    const r = applyOffers([paid(2)], ctx(NOV5, true));
    assert.equal(r.offer, "diwali25");
    assert.equal(r.orderLevelDiscount, 0);
});

test("a first order with a free bag during the sale is still buy2get1", () => {
    assert.equal(applyOffers([paid(2), free(1)], ctx(NOV5, true)).offer, "buy2get1");
});

test("the allowance is 1 free bag for every 2 paid", () => {
    assert.deepEqual([1, 2, 4, 5].map((n) => freeGiftAllowance([paid(n)])), [0, 1, 2, 2]);
    assert.equal(freeGiftAllowance([paid(1, "a"), paid(1, "b"), free(1)]), 1);
});

test("checkFreeGiftAdd explains why a free bag is refused", () => {
    const add = { group: "desi-print-elephant", quantity: 1 };
    assert.equal(checkFreeGiftAdd([], add, NOV5), "Add 2 totes to get a free bag");
    assert.equal(checkFreeGiftAdd([paid(1)], add, NOV5), "Add 2 totes to get a free bag");
    assert.equal(checkFreeGiftAdd([paid(2)], { group: "desi-print-namaste", quantity: 1 }, NOV5), "Free bags are only from the picture designs");
    assert.equal(checkFreeGiftAdd([paid(2)], { group: null, quantity: 1 }, NOV5), "Free bags are only from the picture designs");
    assert.equal(checkFreeGiftAdd([paid(2)], add, NOV15), "Buy 2 Get 1 ended on 11 November");
    assert.equal(checkFreeGiftAdd([paid(2)], add, OCT26), "Buy 2 Get 1 starts on 1 November");
    assert.equal(checkFreeGiftAdd([paid(2), free(1)], add, NOV5), "Add 2 more totes for another free bag");
    assert.equal(checkFreeGiftAdd([paid(2)], { group: "desi-print-elephant", quantity: 2 }, NOV5), "Add 2 more totes for another free bag");
    assert.equal(checkFreeGiftAdd([paid(2)], add, NOV5), null);
});

test("checkFreeGiftAdd checks the dates before the design and the allowance", () => {
    assert.equal(checkFreeGiftAdd([], { group: "desi-print-namaste", quantity: 1 }, NOV15), "Buy 2 Get 1 ended on 11 November");
    assert.equal(checkFreeGiftAdd([], { group: "desi-print-namaste", quantity: 1 }, NOV5), "Free bags are only from the picture designs");
});

test("OFFERS_NOW moves the clock everywhere except production", () => {
    const saved = { now: process.env.OFFERS_NOW, env: process.env.NODE_ENV };
    try {
        process.env.OFFERS_NOW = "2026-11-05T12:00:00+05:30";
        process.env.NODE_ENV = "development";
        assert.equal(offersNow().getTime(), NOV5.getTime());
        process.env.NODE_ENV = "production";
        assert.notEqual(offersNow().getTime(), NOV5.getTime());
    } finally {
        for (const [key, value] of [["OFFERS_NOW", saved.now], ["NODE_ENV", saved.env]] as const) {
            if (value === undefined) delete process.env[key];
            else process.env[key] = value;
        }
    }
});
