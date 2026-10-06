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
