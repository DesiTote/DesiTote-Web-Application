import { test } from "node:test";
import assert from "node:assert/strict";
import { canReturnLine, reasonAllowed } from "./returnRules.js";

test("a free bag line is never returnable", () => {
    assert.equal(canReturnLine({ isFreeGift: true }), false);
});

test("a paid line, or an old order line without the flag, is returnable", () => {
    assert.equal(canReturnLine({ isFreeGift: false }), true);
    assert.equal(canReturnLine({}), true);
});

test("a normal order allows any reason, including changed my mind", () => {
    assert.equal(reasonAllowed({ finalSale: false }, "Changed my mind"), true);
    assert.equal(reasonAllowed({}, "Changed my mind"), true);
});

test("a final-sale order refuses changed my mind and the other soft reasons", () => {
    assert.equal(reasonAllowed({ finalSale: true }, "Changed my mind"), false);
    assert.equal(reasonAllowed({ finalSale: true }, "Size or fit issue"), false);
    assert.equal(reasonAllowed({ finalSale: true }, "Quality not as expected"), false);
    assert.equal(reasonAllowed({ finalSale: true }, "Other"), false);
});

test("a final-sale order still allows damaged and wrong item", () => {
    assert.equal(reasonAllowed({ finalSale: true }, "Wrong item received"), true);
    assert.equal(reasonAllowed({ finalSale: true }, "Defective or damaged product"), true);
});
