import { test } from 'node:test';
import assert from 'node:assert/strict';
import { adaptProducts } from './adaptProducts';
import { BackendProductListItem } from './apiTypes';

const item = (over: Partial<BackendProductListItem>): BackendProductListItem => ({
  _id: 'id',
  slug: 'slug',
  title: 'Hanuman — Black',
  shortDescription: 'tote',
  description: '',
  thumbnail: 'front.jpg',
  price: 499,
  discountPrice: 499,
  discountPercentage: 0,
  productCategory: 'Tote Bag',
  tags: ['group:hanuman'],
  color: 'Black',
  stock: 5,
  isFeatured: false,
  createdAt: '2026-10-01',
  ...over,
});

test('a variant carries all its photos, main photo first, no repeats', () => {
  const [product] = adaptProducts([item({ images: ['front.jpg', 'fabric.jpg', 'zip.jpg'] })]);
  assert.deepEqual(product.variants[0].images, ['front.jpg', 'fabric.jpg', 'zip.jpg']);
});

test('the main photo leads even when stored later in the list', () => {
  const [product] = adaptProducts([item({ thumbnail: 'side.jpg', images: ['front.jpg', 'side.jpg'] })]);
  assert.deepEqual(product.variants[0].images, ['side.jpg', 'front.jpg']);
});

test('an older API response without images still shows the main photo', () => {
  const [product] = adaptProducts([item({ images: undefined })]);
  assert.deepEqual(product.variants[0].images, ['front.jpg']);
});

test('photos stay with their own option, not the sibling zip option', () => {
  const [product] = adaptProducts([
    item({ _id: 'zip', tags: ['group:hanuman', 'zip:with'], thumbnail: 'z-front.jpg', images: ['z-front.jpg', 'zip-closeup.jpg'] }),
    item({ _id: 'nozip', tags: ['group:hanuman', 'zip:without'], thumbnail: 'n-front.jpg', images: ['n-front.jpg'] }),
  ]);
  const byId = Object.fromEntries(product.variants.map((v) => [v.id, v.images]));
  assert.deepEqual(byId.zip, ['z-front.jpg', 'zip-closeup.jpg']);
  assert.deepEqual(byId.nozip, ['n-front.jpg']);
});
