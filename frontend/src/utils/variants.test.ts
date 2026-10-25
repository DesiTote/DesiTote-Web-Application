import { test } from 'node:test';
import assert from 'node:assert/strict';
import { firstMatch, getColorGroups, withVariantFirst } from './variants';
import { Product, ProductVariant } from '../types';

const v = (id: string, colorLabel: string, badge?: string) =>
  ({ id, colorLabel, badge, name: `${colorLabel} ${badge ?? ''}`.trim() }) as ProductVariant;
// Variants arrive sorted by name, the way adaptProducts builds them.
const bag = {
  id: 'bear',
  variants: [v('b-zip', 'Black', 'With Zip'), v('n-zip', 'Natural', 'With Zip'), v('n-nozip', 'Natural', 'Without Zip')],
} as Product;

test('with no filter the card opens on the first colour and option', () => {
  assert.deepEqual(firstMatch(bag, () => true), { colorIdx: 0, optionIdx: 0 });
});

test('a filter moves the card to the first matching colour and option', () => {
  assert.deepEqual(firstMatch(bag, (x) => x.colorLabel === 'Natural'), { colorIdx: 1, optionIdx: 0 });
  assert.deepEqual(firstMatch(bag, (x) => x.badge === 'Without Zip'), { colorIdx: 1, optionIdx: 1 });
});

test('the popup opens on the option the card showed, other colours kept after it', () => {
  const opened = withVariantFirst(bag, bag.variants[2]);
  assert.deepEqual(opened.variants.map((x) => x.id), ['n-nozip', 'n-zip', 'b-zip']);
  assert.deepEqual(getColorGroups(opened).map((g) => g.label), ['Natural', 'Black']);
  assert.deepEqual(bag.variants.map((x) => x.id), ['b-zip', 'n-zip', 'n-nozip']); // original untouched
});
