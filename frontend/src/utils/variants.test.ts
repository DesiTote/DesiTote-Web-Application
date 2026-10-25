import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filterOptions, firstMatch, getColorGroups, iconImage, withVariantFirst } from './variants';
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

const tote = (id: string, category: 'plain' | 'printed', variants: ProductVariant[]) =>
  ({ id, category, variants }) as Product;
const pic = (id: string, colorLabel: string, badge?: string) => ({ ...v(id, colorLabel, badge), image: `${id}.jpg` });
const shop = [
  tote('daisy', 'printed', [pic('daisy-black', 'Black', 'With Zip')]),
  tote('plain', 'plain', [pic('plain-natural', 'Natural', 'Without Zip'), pic('plain-black', 'Black', 'With Zip')]),
];

test('a colour icon shows a plain bag in that colour, so the colour is what you see', () => {
  assert.equal(iconImage(shop, (_, x) => x.colorLabel === 'Black'), 'plain-black.jpg');
});

test('a type icon falls back to that type when no plain bag matches', () => {
  assert.equal(iconImage(shop, (p) => p.category === 'printed'), 'daisy-black.jpg');
});

test('no matching option gives no photo', () => {
  assert.equal(iconImage(shop, (_, x) => x.colorLabel === 'Red'), undefined);
});

test('filter options list each colour and zip option once, sorted', () => {
  assert.deepEqual(filterOptions(shop), { colors: ['Black', 'Natural'], zips: ['With Zip', 'Without Zip'] });
});
