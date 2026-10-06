import { test } from 'node:test';
import assert from 'node:assert/strict';
import { BackendFullProduct, photoUpdateFormData } from './adminProduct';

const product: BackendFullProduct = {
  _id: 'p1', title: 'Hanuman — Black', slug: 'hanuman-black', shortDescription: 's', description: 'd',
  color: 'Black', material: 'Cotton Canvas', productCategory: 'Tote Bag', tags: [], price: 499,
  discountPrice: 499, costPrice: 0, gstPercentage: 18, stock: 5, sku: 'H1', weight: 0.15,
  dimensions: { length: 35, breadth: 40, height: 1 },
  thumbnail: 'front.jpg', images: ['front.jpg', 'fabric.jpg', 'zip.jpg'],
  isFeatured: false, isPublished: true, status: 'ACTIVE',
};

test('removing a photo drops only that photo and keeps the main one', () => {
  const fd = photoUpdateFormData(product, { remove: 'fabric.jpg' });
  assert.deepEqual(fd.getAll('existingImages'), ['front.jpg', 'zip.jpg']);
  assert.equal(fd.get('thumbnailIndex'), '0');
});

test('removing the main photo makes the next remaining photo main', () => {
  const fd = photoUpdateFormData(product, { remove: 'front.jpg' });
  assert.deepEqual(fd.getAll('existingImages'), ['fabric.jpg', 'zip.jpg']);
  assert.equal(fd.get('thumbnailIndex'), '0');
});

test('choosing a new main photo points the thumbnail at it', () => {
  const fd = photoUpdateFormData(product, { main: 'zip.jpg' });
  assert.deepEqual(fd.getAll('existingImages'), ['front.jpg', 'fabric.jpg', 'zip.jpg']);
  assert.equal(fd.get('thumbnailIndex'), '2');
});

test('adding photos keeps every existing one and sends the new files', () => {
  const file = new File(['x'], 'side.jpg', { type: 'image/jpeg' });
  const fd = photoUpdateFormData(product, { add: [file] });
  assert.deepEqual(fd.getAll('existingImages'), ['front.jpg', 'fabric.jpg', 'zip.jpg']);
  assert.equal(fd.getAll('newImages').length, 1);
  assert.equal(fd.get('thumbnailIndex'), '0');
});

test('the last photo cannot be removed', () => {
  const single = { ...product, images: ['front.jpg'] };
  assert.throws(() => photoUpdateFormData(single, { remove: 'front.jpg' }), /at least one photo/);
});
