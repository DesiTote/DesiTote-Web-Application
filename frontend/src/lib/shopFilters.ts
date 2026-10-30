import type { BagType, CatalogFilters } from '../components/ProductCatalog';

const TYPES: BagType[] = ['all', 'bestseller', 'plain', 'printed'];

/** The /shop page keeps its filters in the address, so back, refresh and shared links all keep them. */
export function shopSearch(f: CatalogFilters): string {
  const p = new URLSearchParams();
  if (f.type !== 'all') p.set('type', f.type);
  if (f.color) p.set('color', f.color);
  if (f.zip) p.set('zip', f.zip);
  const q = p.toString();
  return q ? `?${q}` : '';
}

export function filtersFromSearch(search: string | URLSearchParams): CatalogFilters {
  const p = new URLSearchParams(search);
  const type = p.get('type') as BagType;
  return { type: TYPES.includes(type) ? type : 'all', color: p.get('color'), zip: p.get('zip') };
}
