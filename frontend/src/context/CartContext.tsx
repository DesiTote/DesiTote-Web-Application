import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { BackendCart, BackendOffer } from '../lib/apiTypes';
import { colorHexFromLabel } from '../lib/adaptProducts';
import { freeSlotsLeft } from '../lib/offers';
import { isSaleOn } from '../lib/sale';
import { useAuth } from './AuthContext';

export interface DisplayCartItem {
  productId: string;
  name: string;
  image: string;
  price: number;
  quantity: number;
  colorHex: string;
  colorLabel: string;
  stock: number;
  /** A free bag from Buy 2 Get 1; it can sit beside a paid line of the same tote. */
  isFreeGift: boolean;
}

/** Just enough of a product to draw a cart row before the server confirms. */
export interface CartItemPreview {
  name: string;
  image: string;
  price: number;
  colorHex: string;
  colorLabel: string;
}

interface CartContextValue {
  items: DisplayCartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  /** True once the initial fetch for the current user has finished (success or failure). Use this,
   *  not just `!isLoading`, to know whether `items` reflects a real answer yet — it starts false on
   *  every mount/user-change, before `isLoading` has had a chance to turn true. */
  hasLoaded: boolean;
  /** The one offer the server applied to this bag; null when nothing is saved. */
  offer: BackendOffer | null;
  /** Free bags the shopper can still pick: one per 2 paid totes, minus the free ones already in the bag. */
  freeSlotsLeft: number;
  /** Set when the server just removed a free bag that no longer qualifies. */
  notice: string | null;
  /** `preview` lets the bag fill in immediately, before the server answers.
   *  Without it the shopper taps Add to Bag and watches nothing happen for the
   *  ~1.5s the round trip takes. */
  addItem: (productId: string, quantity?: number, preview?: CartItemPreview) => Promise<void>;
  /** Rejects with the server's reason (e.g. "Add 2 more totes for another free bag"). */
  addFreeGift: (productId: string) => Promise<void>;
  updateQuantity: (productId: string, quantity: number, isFreeGift?: boolean) => Promise<void>;
  removeItem: (productId: string, isFreeGift?: boolean) => Promise<void>;
  clearCart: () => Promise<void>;
  refresh: () => Promise<void>;
}

const CartContext = createContext<CartContextValue | null>(null);

function toDisplayItems(cart: BackendCart): DisplayCartItem[] {
  return cart.items
    .filter((item) => item.productId && typeof item.productId === 'object')
    .map((item) => ({
      productId: item.productId._id,
      name: item.productId.title,
      image: item.productId.thumbnail,
      price: item.unitPrice,
      quantity: item.quantity,
      colorHex: colorHexFromLabel(item.productId.color || ''),
      colorLabel: item.productId.color,
      stock: item.productId.stock,
      isFreeGift: item.isFreeGift === true,
    }));
}

// The free line and the paid line of one tote share a productId, so a ?free=1 query tells the server which.
const freeQuery = (isFreeGift: boolean) => (isFreeGift ? '?free=1' : '');

function removedNotice(cart: BackendCart): string | null {
  if (!(cart.freeGiftsRemoved > 0)) return null;
  return isSaleOn()
    ? 'Your free bag was removed: add 2 totes to get it back'
    : 'Buy 2 Get 1 has ended, so the free bag was removed';
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<DisplayCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);
  const [offer, setOffer] = useState<BackendOffer | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  // Mirrors `items` synchronously. An optimistic add has to capture the exact
  // list it is replacing so a rejected request can put it back, and reading
  // that from state would give whatever the last render saw.
  const itemsRef = useRef<DisplayCartItem[]>([]);
  const commitItems = useCallback((next: DisplayCartItem[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const commitMeta = useCallback((cart: BackendCart | null) => {
    setOffer(cart?.offer ?? null);
    setNotice(cart ? removedNotice(cart) : null);
  }, []);

  const refresh = useCallback(async () => {
    if (!user) {
      commitItems([]);
      commitMeta(null);
      setHasLoaded(true);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get<{ data: BackendCart }>('/api/cart');
      commitItems(toDisplayItems(res.data));
      commitMeta(res.data);
    } catch {
      // Not logged in, or a transient error — cart just stays empty.
      commitItems([]);
      commitMeta(null);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [user, commitItems, commitMeta]);

  useEffect(() => {
    setHasLoaded(false);
    refresh();
  }, [refresh]);

  // toDisplayItems drops any item whose productId came back as a bare id string
  // instead of the populated product, because such an item has no title, price
  // or image to show. If that silently emptied the list we would tell the
  // shopper their tote was added and then show them an empty bag, so fall back
  // to re-reading the cart instead of trusting the mapped result.
  const applyCart = useCallback(
    async (cart: BackendCart) => {
      const mapped = toDisplayItems(cart);
      if (cart.items.length > 0 && mapped.length === 0) {
        await refresh();
        return;
      }
      commitItems(mapped);
      commitMeta(cart);
    },
    [refresh, commitItems, commitMeta]
  );

  const addItem = useCallback(
    async (productId: string, quantity = 1, preview?: CartItemPreview) => {
      const previous = itemsRef.current;

      // Draw the row straight away, then let the server's copy replace it.
      if (preview) {
        const isPaid = (i: DisplayCartItem) => i.productId === productId && !i.isFreeGift;
        const existing = previous.find(isPaid);
        commitItems(
          existing
            ? previous.map((i) => (isPaid(i) ? { ...i, quantity: i.quantity + quantity } : i))
            : [
                ...previous,
                {
                  productId,
                  quantity,
                  name: preview.name,
                  image: preview.image,
                  price: preview.price,
                  colorHex: preview.colorHex,
                  colorLabel: preview.colorLabel,
                  isFreeGift: false,
                  // Real stock arrives with the server's reply a moment later.
                  // Assume there is room until then rather than greying out the
                  // quantity control on a guess.
                  stock: Number.MAX_SAFE_INTEGER,
                },
              ]
        );
      }

      try {
        const res = await api.post<{ cart: BackendCart }>('/api/cart/add', { productId, quantity });
        await applyCart(res.cart);
      } catch (err) {
        // Out of stock, over the per-item limit, signed out — put the bag back
        // the way it was rather than leaving a row that was never saved.
        if (preview) commitItems(previous);
        throw err;
      }
    },
    [applyCart, commitItems]
  );

  const addFreeGift = useCallback(
    async (productId: string) => {
      const res = await api.post<{ cart: BackendCart }>('/api/cart/add', { productId, quantity: 1, isFreeGift: true });
      await applyCart(res.cart);
    },
    [applyCart]
  );

  const updateQuantity = useCallback(
    async (productId: string, quantity: number, isFreeGift = false) => {
      const res = await api.patch<{ data: BackendCart }>(
        `/api/cart/update-quantity/${productId}${freeQuery(isFreeGift)}`,
        { quantity }
      );
      await applyCart(res.data);
    },
    [applyCart]
  );

  const removeItem = useCallback(
    async (productId: string, isFreeGift = false) => {
      const res = await api.delete<{ data: BackendCart }>(
        `/api/cart/remove-item/${productId}${freeQuery(isFreeGift)}`
      );
      await applyCart(res.data);
    },
    [applyCart]
  );

  const clearCart = useCallback(async () => {
    const res = await api.delete<{ cart: BackendCart }>('/api/cart/clear');
    await applyCart(res.cart);
  }, [applyCart]);

  const itemCount = items.reduce((acc, i) => acc + i.quantity, 0);
  const subtotal = items.reduce((acc, i) => acc + i.price * i.quantity, 0);

  return (
    <CartContext.Provider
      value={{
        items,
        itemCount,
        subtotal,
        isLoading,
        hasLoaded,
        offer,
        freeSlotsLeft: freeSlotsLeft(items),
        notice,
        addItem,
        addFreeGift,
        updateQuantity,
        removeItem,
        clearCart,
        refresh,
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export function useCart(): CartContextValue {
  const ctx = useContext(CartContext);
  if (!ctx) throw new Error('useCart must be used within a CartProvider');
  return ctx;
}
