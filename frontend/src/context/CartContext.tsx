import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from 'react';
import { api } from '../lib/api';
import { BackendCart } from '../lib/apiTypes';
import { colorHexFromLabel } from '../lib/adaptProducts';
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
  /** `preview` lets the bag fill in immediately, before the server answers.
   *  Without it the shopper taps Add to Bag and watches nothing happen for the
   *  ~1.5s the round trip takes. */
  addItem: (productId: string, quantity?: number, preview?: CartItemPreview) => Promise<void>;
  updateQuantity: (productId: string, quantity: number) => Promise<void>;
  removeItem: (productId: string) => Promise<void>;
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
      price: item.productId.discountPrice,
      quantity: item.quantity,
      colorHex: colorHexFromLabel(item.productId.color || ''),
      colorLabel: item.productId.color,
      stock: item.productId.stock,
    }));
}

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const [items, setItems] = useState<DisplayCartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [hasLoaded, setHasLoaded] = useState(false);

  // Mirrors `items` synchronously. An optimistic add has to capture the exact
  // list it is replacing so a rejected request can put it back, and reading
  // that from state would give whatever the last render saw.
  const itemsRef = useRef<DisplayCartItem[]>([]);
  const commitItems = useCallback((next: DisplayCartItem[]) => {
    itemsRef.current = next;
    setItems(next);
  }, []);

  const refresh = useCallback(async () => {
    if (!user) {
      commitItems([]);
      setHasLoaded(true);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get<{ data: BackendCart }>('/api/cart');
      commitItems(toDisplayItems(res.data));
    } catch {
      // Not logged in, or a transient error — cart just stays empty.
      commitItems([]);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [user, commitItems]);

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
    },
    [refresh, commitItems]
  );

  const addItem = useCallback(
    async (productId: string, quantity = 1, preview?: CartItemPreview) => {
      const previous = itemsRef.current;

      // Draw the row straight away, then let the server's copy replace it.
      if (preview) {
        const existing = previous.find((i) => i.productId === productId);
        commitItems(
          existing
            ? previous.map((i) =>
                i.productId === productId ? { ...i, quantity: i.quantity + quantity } : i
              )
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

  const updateQuantity = useCallback(
    async (productId: string, quantity: number) => {
      const res = await api.patch<{ data: BackendCart }>(`/api/cart/update-quantity/${productId}`, { quantity });
      await applyCart(res.data);
    },
    [applyCart]
  );

  const removeItem = useCallback(
    async (productId: string) => {
      const res = await api.delete<{ data: BackendCart }>(`/api/cart/remove-item/${productId}`);
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
        addItem,
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
