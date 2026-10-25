import { test } from 'node:test';
import assert from 'node:assert/strict';
import { SHOP_PHONE, whatsappUrl } from './whatsapp';

test('opens a chat with the shop number, India code first', () => {
  assert.equal(SHOP_PHONE, '9823126309');
  assert.ok(whatsappUrl('Hi').startsWith('https://wa.me/919823126309?text='));
});

test('the typed message survives spaces, & and the rupee sign', () => {
  const url = new URL(whatsappUrl('Custom order: 50 totes & a logo, budget ₹200 each'));
  assert.equal(url.searchParams.get('text'), 'Custom order: 50 totes & a logo, budget ₹200 each');
});
