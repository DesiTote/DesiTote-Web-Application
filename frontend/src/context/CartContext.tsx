import React, { createContext, useCallback, useContext, useEffect, useState } from 'react';
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

interface CartContextValue {
  items: DisplayCartItem[];
  itemCount: number;
  subtotal: number;
  isLoading: boolean;
  /** True once the initial fetch for the current user has finished (success or failure). Use this,
   *  not just `!isLoading`, to know whether `items` reflects a real answer yet — it starts false on
   *  every mount/user-change, before `isLoading` has had a chance to turn true. */
  hasLoaded: boolean;
  addItem: (productId: string, quantity?: number) => Promise<void>;
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

  const refresh = useCallback(async () => {
    if (!user) {
      setItems([]);
      setHasLoaded(true);
      return;
    }
    setIsLoading(true);
    try {
      const res = await api.get<{ data: BackendCart }>('/api/cart');
      setItems(toDisplayItems(res.data));
    } catch {
      // Not logged in, or a transient error — cart just stays empty.
      setItems([]);
    } finally {
      setIsLoading(false);
      setHasLoaded(true);
    }
  }, [user]);

  useEffect(() => {
    setHasLoaded(false);
    refresh();
  }, [refresh]);

  const addItem = useCallback(async (productId: string, quantity = 1) => {
    const res = await api.post<{ cart: BackendCart }>('/api/cart/add', { productId, quantity });
    setItems(toDisplayItems(res.cart));
  }, []);

  const updateQuantity = useCallback(async (productId: string, quantity: number) => {
    const res = await api.patch<{ data: BackendCart }>(`/api/cart/update-quantity/${productId}`, { quantity });
    setItems(toDisplayItems(res.data));
  }, []);

  const removeItem = useCallback(async (productId: string) => {
    const res = await api.delete<{ data: BackendCart }>(`/api/cart/remove-item/${productId}`);
    setItems(toDisplayItems(res.data));
  }, []);

  const clearCart = useCallback(async () => {
    const res = await api.delete<{ cart: BackendCart }>('/api/cart/clear');
    setItems(toDisplayItems(res.cart));
  }, []);

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
