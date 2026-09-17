/**
 * Controls the opening animation that lives in index.html.
 *
 * It is plain markup in the HTML shell rather than a React component on
 * purpose: it has to be on screen during the JS download, parse and mount,
 * which is most of the wait it exists to cover. A React splash could only
 * appear after all of that had already happened.
 *
 * Timing is tied to the catalogue, not to a stopwatch. The splash leaves as
 * soon as there are products to show, so a fast connection is never made to
 * wait — with a floor so it does not flash past unread, and a ceiling so a
 * slow or failed API can never leave the shop hidden behind it.
 */

/** Below this the animation reads as a glitch rather than an intro. */
const MIN_VISIBLE_MS = 1200;

/** Hard ceiling. Reached only if the catalogue is slow or never arrives. */
const MAX_VISIBLE_MS = 3000;

/** Matches the fade-out transition on #boot in index.html. */
const FADE_MS = 450;

let removed = false;

function remove() {
  if (removed) return;
  removed = true;
  const el = document.getElementById('boot');
  if (!el) return;
  el.classList.add('boot-done');
  window.setTimeout(() => el.remove(), FADE_MS);
}

/**
 * Call once the page has something worth showing. performance.now() is
 * measured from navigation start, so this accounts for the whole load and
 * not just the time since React woke up.
 */
export function dismissBoot() {
  window.setTimeout(remove, Math.max(0, MIN_VISIBLE_MS - performance.now()));
}

// The ceiling is armed as soon as this module is imported. Without it, an API
// outage would leave every visitor staring at the logo indefinitely.
window.setTimeout(remove, Math.max(0, MAX_VISIBLE_MS - performance.now()));
