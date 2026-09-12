import { useEffect, useRef } from 'react';

/**
 * Makes the device back button close an overlay instead of leaving the site.
 *
 * On phones, opening a product or the cart is a full-screen change, so people
 * press Back to dismiss it. Without this the browser navigates away from the
 * shop entirely, which loses the cart view and feels like the site crashed.
 *
 * Opening pushes a throwaway history entry; Back pops it and closes the
 * overlay. Closing via the X removes that entry again so the real history
 * isn't left with a dead step in it.
 */
export function useCloseOnBack(isOpen: boolean, onClose: () => void) {
  // Held in a ref so the effect depends only on `isOpen`. Callers pass inline
  // arrow functions, which change identity on every render - depending on the
  // callback directly would re-run this effect continuously, pushing and
  // popping history in a loop until the page locks up.
  const onCloseRef = useRef(onClose);
  onCloseRef.current = onClose;

  useEffect(() => {
    if (!isOpen) return;

    window.history.pushState({ desitotesOverlay: true }, '');

    const handlePopState = () => onCloseRef.current();
    window.addEventListener('popstate', handlePopState);

    return () => {
      // Detach first: history.back() below fires popstate, and re-entering
      // onClose here would fight with the state update that got us here.
      window.removeEventListener('popstate', handlePopState);

      // Only rewind if our own entry is still the current one - if Back is
      // what closed the overlay, it has already been popped.
      if (window.history.state?.desitotesOverlay) {
        window.history.back();
      }
    };
  }, [isOpen]);
}
