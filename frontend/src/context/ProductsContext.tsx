import React, { createContext, useContext, useEffect, useState } from 'react';
import { api } from '../lib/api';
import { BackendProductsPage } from '../lib/apiTypes';
import { adaptProducts } from '../lib/adaptProducts';
import { Product } from '../types';

interface ProductsContextValue {
  products: Product[];
  isLoading: boolean;
  error: string | null;
  findById: (familyId: string) => Product | undefined;
}

const ProductsContext = createContext<ProductsContextValue | null>(null);

const PAGE_LIMIT = 40;

export const ProductsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setIsLoading(true);
        const first = await api.get<{ data: BackendProductsPage }>(
          `/api/products?limit=${PAGE_LIMIT}&page=1`
        );
        const allItems = [...first.data.products];
        const totalPages = first.data.pagination.totalPages;

        // Show the first page as soon as it lands. The hero renders nothing
        // until it has a product, and waiting for all three pages of the
        // catalogue meant the bag on the homepage appeared two round trips
        // later than it needed to.
        if (!cancelled) {
          setProducts(adaptProducts(allItems));
          setError(null);
          setIsLoading(false);
        }

        const rest = await Promise.all(
          Array.from({ length: Math.max(0, totalPages - 1) }, (_, i) =>
            api.get<{ data: BackendProductsPage }>(`/api/products?limit=${PAGE_LIMIT}&page=${i + 2}`)
          )
        );
        for (const page of rest) allItems.push(...page.data.products);

        if (!cancelled && rest.length) {
          setProducts(adaptProducts(allItems));
        }
      } catch (err) {
        if (!cancelled) setError('Could not load the catalog. Please refresh the page.');
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const findById = (familyId: string) => products.find((p) => p.id === familyId);

  return (
    <ProductsContext.Provider value={{ products, isLoading, error, findById }}>
      {children}
    </ProductsContext.Provider>
  );
};

export function useProducts(): ProductsContextValue {
  const ctx = useContext(ProductsContext);
  if (!ctx) throw new Error('useProducts must be used within a ProductsProvider');
  return ctx;
}
