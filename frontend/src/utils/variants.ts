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

/** First colour swatch and option that pass `matches` (a shop filter), else the first ones. */
export function firstMatch(product: Product, matches: (v: ProductVariant) => boolean) {
  const groups = getColorGroups(product);
  const colorIdx = Math.max(0, groups.findIndex((g) => g.variants.some(matches)));
  const optionIdx = Math.max(0, groups[colorIdx].variants.findIndex(matches));
  return { colorIdx, optionIdx };
}

/** The product with `variant` as its first swatch and option, which is where the popup opens. */
export function withVariantFirst(product: Product, variant: ProductVariant): Product {
  const key = (v: ProductVariant) => v.colorLabel || v.name;
  const rank = (v: ProductVariant) => (v.id === variant.id ? 0 : key(v) === key(variant) ? 1 : 2);
  return { ...product, variants: [...product.variants].sort((a, b) => rank(a) - rank(b)) };
}
