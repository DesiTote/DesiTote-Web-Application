import { test } from "node:test";
import assert from "node:assert/strict";
import { buildShiprocketPayload } from "./shiprocketPayload.js";

const address = {
    fullName: "Asha Rao",
    addressLine1: "12 MG Road",
    addressLine2: "",
    district: "Pune",
    pincode: "411001",
    state: "Maharashtra",
    country: "India",
    mobileNumber: "9876543210",
};

const line = (originalPrice: number, unitPrice: number, quantity = 1, name = "Tote") => ({
    name,
    sku: `SKU-${name}`,
    quantity,
    unitPrice,
    originalPrice,
    gstPercentage: 5,
});

const orderOf = (items: ReturnType<typeof line>[], discount: number) => ({
    _id: { toString: () => "order-1" },
    deliveryAddress: address,
    billingEmail: "asha@example.com",
    payment: { method: "COD" },
    subtotal: items.reduce((s, i) => s + i.originalPrice * i.quantity, 0),
    discount,
    shippingCharge: 60,
    packageWeight: 0.5,
    items,
});

// What the customer pays for the totes: the lines at their final price, less any order-level discount.
const paidForTotes = (order: ReturnType<typeof orderOf>, orderLevelDiscount = 0) =>
    order.items.reduce((s, i) => s + i.unitPrice * i.quantity, 0) - orderLevelDiscount;

test("sale order: sub_total minus total_discount equals what the customer paid for totes", () => {
    const order = orderOf([line(349, 262), line(349, 262)], 174);
    const payload = buildShiprocketPayload(order);
    assert.equal(payload.sub_total, 698);
    // The items already carry their own price, so sub_total must be their sum or the discount is taken twice.
    assert.equal(payload.sub_total, payload.order_items.reduce((s: number, i: any) => s + i.selling_price * i.units, 0));
    assert.equal(payload.total_discount, 174);
    assert.equal(payload.sub_total - payload.total_discount, paidForTotes(order));
});

test("buy2get1 order lists the free bag at its normal price and discounts it", () => {
    const order = orderOf([line(349, 349, 1, "A"), line(349, 349, 1, "B"), line(299, 0, 1, "Free")], 299);
    const payload = buildShiprocketPayload(order);
    assert.equal(payload.order_items[2].selling_price, 299);
    assert.equal(payload.total_discount, 299);
    assert.equal(payload.sub_total - payload.total_discount, paidForTotes(order));
});

test("a tote bought and also given free goes out as one Shiprocket line per SKU", () => {
    const order = orderOf([line(299, 299, 2, "A"), line(299, 0, 1, "A"), line(349, 349, 1, "B")], 299);
    const payload = buildShiprocketPayload(order);
    const skus = payload.order_items.map((i: any) => i.sku);
    assert.equal(new Set(skus).size, skus.length);
    assert.equal(payload.order_items.length, 2);
    assert.equal(payload.order_items.find((i: any) => i.sku === "SKU-A").units, 3);
    assert.equal(payload.sub_total, 299 * 3 + 349);
    assert.equal(payload.total_discount, 299);
    assert.equal(payload.sub_total - payload.total_discount, paidForTotes(order));
});

test("every selling_price is the item's originalPrice", () => {
    const order = orderOf([line(349, 262, 1, "A"), line(299, 0, 1, "B"), line(399, 399, 3, "C")], 0);
    const payload = buildShiprocketPayload(order);
    assert.deepEqual(
        payload.order_items.map((i: any) => i.selling_price),
        [349, 299, 399]
    );
});

test("first-order 10% stays an order-level discount", () => {
    const order = orderOf([line(349, 349), line(349, 349)], 70);
    const payload = buildShiprocketPayload(order);
    assert.equal(payload.sub_total, 698);
    assert.equal(payload.total_discount, 70);
    assert.equal(payload.sub_total - payload.total_discount, paidForTotes(order, 70));
});

test("sub_total counts every unit of a multi-quantity line", () => {
    const order = orderOf([line(349, 262, 3)], 261);
    const payload = buildShiprocketPayload(order);
    assert.equal(payload.sub_total, 1047);
    assert.equal(payload.sub_total - payload.total_discount, paidForTotes(order));
});

test("an old item without originalPrice falls back to unitPrice", () => {
    const old: any = line(0, 262);
    delete old.originalPrice;
    const payload = buildShiprocketPayload(orderOf([old], 0));
    assert.equal(payload.order_items[0].selling_price, 262);
    assert.equal(payload.sub_total, 262);
});

test("the rest of the payload is unchanged", () => {
    const payload = buildShiprocketPayload(orderOf([line(349, 349)], 0));
    assert.equal(payload.order_id, "order-1");
    assert.equal(payload.payment_method, "COD");
    assert.equal(payload.shipping_charges, 60);
    assert.equal(payload.weight, 0.5);
    assert.equal(payload.order_items[0].hsn, "4202");
    assert.equal(payload.order_items[0].tax, "5");
});
