import { test } from 'node:test';
import assert from 'node:assert/strict';
import { getColorGroups, variantPosition } from './variants';
import { Product, ProductVariant } from '../types';

const v = (id: string, colorLabel: string): ProductVariant => ({
  id, slug: id, name: id, colorHex: '#000', image: `${id}.jpg`, images: [`${id}.jpg`], price: 1, stock: 1, colorLabel,
});
const product = {
  id: 'p', name: 'P', tagline: '', price: 1, category: 'printed', description: '', features: [], size: '', fabric: '',
  variants: [v('blk-zip', 'Black'), v('blk-nozip', 'Black'), v('nat-zip', 'Natural'), v('nat-nozip', 'Natural')],
} as Product;

test('finds the colour and option of the variant the shopper was looking at', () => {
  assert.deepEqual(variantPosition(getColorGroups(product), 'nat-nozip'), { colorIdx: 1, optionIdx: 1 });
});

test('falls back to the first colour and option when there is no match', () => {
  assert.deepEqual(variantPosition(getColorGroups(product), 'missing'), { colorIdx: 0, optionIdx: 0 });
  assert.deepEqual(variantPosition(getColorGroups(product), undefined), { colorIdx: 0, optionIdx: 0 });
});
