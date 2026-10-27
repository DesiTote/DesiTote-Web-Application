import { test } from 'node:test';
import assert from 'node:assert/strict';
import { filtersFromSearch, shopSearch } from './shopFilters';

test('no filters means a bare /shop', () => {
  assert.equal(shopSearch({ type: 'all', color: null, zip: null }), '');
});

test('filters go into the address and come back unchanged', () => {
  const f = { type: 'printed' as const, color: 'Off White', zip: 'With Zip' };
  const search = shopSearch(f);
  assert.equal(search, '?type=printed&color=Off+White&zip=With+Zip');
  assert.deepEqual(filtersFromSearch(search), f);
});

test('an unknown or missing type falls back to all', () => {
  assert.deepEqual(filtersFromSearch('?type=socks&color=Black'), { type: 'all', color: 'Black', zip: null });
  assert.deepEqual(filtersFromSearch(''), { type: 'all', color: null, zip: null });
});
