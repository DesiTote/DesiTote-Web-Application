import { test } from 'node:test';
import assert from 'node:assert/strict';
import { keyStep, stepPhoto, swipeStep } from './gallery';

test('stepping past either end wraps around', () => {
  assert.equal(stepPhoto(3, 1, 4), 0);
  assert.equal(stepPhoto(0, -1, 4), 3);
  assert.equal(stepPhoto(1, 1, 4), 2);
});

test('a single photo never moves', () => {
  assert.equal(stepPhoto(0, 1, 1), 0);
});

test('a clear sideways swipe moves one photo', () => {
  assert.equal(swipeStep({ x: -80, y: 4 }, { x: 0, y: 0 }), 1); // drag left -> next
  assert.equal(swipeStep({ x: 80, y: -4 }, { x: 0, y: 0 }), -1); // drag right -> previous
});

test('a short but fast flick also counts', () => {
  assert.equal(swipeStep({ x: -20, y: 0 }, { x: -800, y: 0 }), 1);
});

test('a small nudge or a mostly vertical drag does not change photo', () => {
  assert.equal(swipeStep({ x: -20, y: 0 }, { x: -100, y: 0 }), 0);
  assert.equal(swipeStep({ x: -70, y: 120 }, { x: 0, y: 0 }), 0);
});

const key = (k: string, extra: Record<string, unknown> = {}) => ({
  key: k, altKey: false, ctrlKey: false, metaKey: false, shiftKey: false, defaultPrevented: false, target: null, ...extra,
});

test('plain arrow keys step through photos', () => {
  assert.equal(keyStep(key('ArrowRight')), 1);
  assert.equal(keyStep(key('ArrowLeft')), -1);
  assert.equal(keyStep(key('Enter')), 0);
});

test('arrow keys used for something else are left alone', () => {
  assert.equal(keyStep(key('ArrowLeft', { altKey: true })), 0); // browser back
  assert.equal(keyStep(key('ArrowRight', { metaKey: true })), 0);
  assert.equal(keyStep(key('ArrowRight', { defaultPrevented: true })), 0);
  assert.equal(keyStep(key('ArrowRight', { target: { tagName: 'INPUT' } })), 0);
  assert.equal(keyStep(key('ArrowRight', { target: { tagName: 'DIV', isContentEditable: true } })), 0);
});
