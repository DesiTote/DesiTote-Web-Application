/** Moves `delta` photos from `current`, wrapping past either end. */
export function stepPhoto(current: number, delta: number, count: number): number {
  return (((current + delta) % count) + count) % count;
}

type Vec = { x: number; y: number };

const SWIPE_DISTANCE_PX = 50;
const SWIPE_VELOCITY_PX_S = 500;

/**
 * Turns a finished drag on the main photo into a step: 1 = next photo,
 * -1 = previous, 0 = stay. A drag that is mostly vertical is the shopper
 * scrolling the popup, not swiping, so it never changes photo.
 */
export function swipeStep(offset: Vec, velocity: Vec): number {
  if (Math.abs(offset.y) > Math.abs(offset.x)) return 0;
  if (offset.x <= -SWIPE_DISTANCE_PX || velocity.x <= -SWIPE_VELOCITY_PX_S) return 1;
  if (offset.x >= SWIPE_DISTANCE_PX || velocity.x >= SWIPE_VELOCITY_PX_S) return -1;
  return 0;
}

type KeyLike = {
  key: string;
  altKey: boolean;
  ctrlKey: boolean;
  metaKey: boolean;
  shiftKey: boolean;
  defaultPrevented: boolean;
  target: unknown;
};

/**
 * Arrow keys step the gallery, but only when nothing else wants them: not
 * with a modifier (Alt+Left is the browser's Back), not inside a text field,
 * and not when another handler already used the key.
 */
export function keyStep(e: KeyLike): number {
  if (e.defaultPrevented || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return 0;
  const t = e.target as { tagName?: string; isContentEditable?: boolean } | null;
  if (t && (t.isContentEditable || ['INPUT', 'TEXTAREA', 'SELECT'].includes(t.tagName ?? ''))) return 0;
  if (e.key === 'ArrowRight') return 1;
  if (e.key === 'ArrowLeft') return -1;
  return 0;
}
