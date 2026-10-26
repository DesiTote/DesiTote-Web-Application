import { test } from 'node:test';
import assert from 'node:assert/strict';
import { FREE_GIFT_GROUPS, freeBagChoices, freeSlotsLeft } from './offers';
import { Product, ProductVariant } from '../types';

const variant = (id: string, colorLabel: string, stock = 5, badge?: string) =>
  ({ id, colorLabel, badge, stock, name: `${colorLabel} ${badge ?? ''}`.trim(), image: `${id}.jpg` }) as ProductVariant;
const design = (id: string, name: string, variants: ProductVariant[]) => ({ id, name, variants }) as Product;

test('the list mirrors the backend: 23 designs, no repeats', () => {
  assert.equal(FREE_GIFT_GROUPS.length, 23);
  assert.equal(new Set(FREE_GIFT_GROUPS).size, 23);
});

test('only listed designs are offered', () => {
  const choices = freeBagChoices([
    design('desi-print-elephant', 'Elephant', [variant('e1', 'Natural')]),
    design('plain-tote', 'Plain Tote', [variant('p1', 'Natural')]),
  ]);
  assert.deepEqual(choices.map((c) => c.productId), ['e1']);
});

test('one choice per colour of a design', () => {
  const choices = freeBagChoices([
    design('desi-print-daisy', 'Daisy', [
      variant('d-black-zip', 'Black', 5, 'With Zip'),
      variant('d-black-nozip', 'Black', 5, 'Without Zip'),
      variant('d-natural', 'Natural'),
    ]),
  ]);
  assert.deepEqual(choices, [
    { productId: 'd-black-zip', name: 'Daisy', colorLabel: 'Black', image: 'd-black-zip.jpg' },
    { productId: 'd-natural', name: 'Daisy', colorLabel: 'Natural', image: 'd-natural.jpg' },
  ]);
});

test('designs keep catalogue order', () => {
  const choices = freeBagChoices([
    design('desi-print-mushroom', 'Mushroom', [variant('m1', 'Natural')]),
    design('plain-tote', 'Plain Tote', [variant('p1', 'Natural')]),
    design('desi-print-birdhouse', 'Birdhouse', [variant('b1', 'Natural')]),
  ]);
  assert.deepEqual(choices.map((c) => c.productId), ['m1', 'b1']);
});

test('a sold-out colour is not offered', () => {
  const choices = freeBagChoices([
    design('desi-print-poppy', 'Poppy', [
      variant('po-black', 'Black', 0),
      variant('po-natural-zip', 'Natural', 0, 'With Zip'),
      variant('po-natural-nozip', 'Natural', 3, 'Without Zip'),
    ]),
  ]);
  // Black has nothing left; Natural falls to its first option that is in stock.
  assert.deepEqual(choices.map((c) => c.productId), ['po-natural-nozip']);
});

const line = (quantity: number, isFreeGift = false) => ({ quantity, isFreeGift });

test('one free slot for every 2 paid totes, an odd one earns nothing', () => {
  assert.equal(freeSlotsLeft([line(1)]), 0);
  assert.equal(freeSlotsLeft([line(2)]), 1);
  assert.equal(freeSlotsLeft([line(3)]), 1);
  assert.equal(freeSlotsLeft([line(1), line(1), line(2)]), 2);
});

test('free bags already in the bag use up slots, and never go below 0', () => {
  assert.equal(freeSlotsLeft([line(4), line(1, true)]), 1);
  assert.equal(freeSlotsLeft([line(2), line(1, true)]), 0);
  assert.equal(freeSlotsLeft([line(2), line(2, true)]), 0);
});
