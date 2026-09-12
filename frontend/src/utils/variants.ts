import { Product, ProductVariant } from '../types';

export interface ColorGroup {
  label: string;
  colorHex: string;
  variants: ProductVariant[];
}

/**
 * Groups a product's flat variant list into color swatches, the way most
 * clothing/apparel sites do — pick a color first, then a size/option within it.
 * Variants that share a `colorLabel` (or, lacking one, the same `name`) become
 * one swatch; picking that swatch reveals its own zip / no-zip options.
 */
export function getColorGroups(product: Product): ColorGroup[] {
  const map = new Map<string, ProductVariant[]>();
  for (const v of product.variants) {
    const key = v.colorLabel || v.name;
    if (!map.has(key)) map.set(key, []);
    map.get(key)!.push(v);
  }
  return Array.from(map.entries()).map(([label, variants]) => ({
    label,
    colorHex: variants[0].colorHex,
    variants,
  }));
}
