import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Eye, Check, Flame } from 'lucide-react';
import { PriceTag } from './PriceTag';
import { Product, ProductVariant } from '../types';
import { playPop, playSnap } from '../utils/audio';
import { filterOptions, firstMatch, getColorGroups, withVariantFirst } from '../utils/variants';
import { colorHexFromLabel } from '../lib/adaptProducts';
import { useProducts } from '../context/ProductsContext';

export type BagType = 'all' | 'bestseller' | 'plain' | 'printed';
export interface CatalogFilters {
  type: BagType;
  color: string | null;
  zip: string | null;
}
export const NO_FILTERS: CatalogFilters = { type: 'all', color: null, zip: null };

/** Takes the shopper to the filter chips, so the bags are on screen rather than the section heading. */
export const scrollToBags = () => {
  const reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  document.getElementById('catalog-filters')?.scrollIntoView({ behavior: reduce ? 'auto' : 'smooth' });
};

interface ProductCatalogProps {
  products: Product[];
  /** Owned by the home page, so the shop nav at the top can set them too. */
  filters: CatalogFilters;
  onFiltersChange: (filters: CatalogFilters) => void;
  onAddToCart: (item: {
    id: string;
    name: string;
    variantId: string;
    variantName: string;
    colorHex: string;
    image: string;
    price: number;
  }) => void;
  onQuickView: (product: Product) => void;
  formatPrice: (inr: number) => string;
}

const CHIP_BASE =
  'shrink-0 whitespace-nowrap px-3.5 py-2 sm:px-4 rounded-full text-[10px] font-mono uppercase tracking-widest border cursor-pointer flex items-center gap-1.5 transition-[color,background-color,border-color,transform] duration-150 active:scale-[0.97]';
// Phones: each chip group is one swipeable row (Myntra style). Wider screens: chips wrap.
const CHIP_ROW = 'flex gap-2 overflow-x-auto scrollbar-hide -mx-4 px-4 sm:mx-0 sm:px-0 sm:flex-wrap sm:overflow-visible';
const CHIP_ON = 'bg-[#0B1420] text-[#F7F2E8] border-[#0B1420] font-bold';
const CHIP_OFF = 'bg-[#0B1420]/[0.04] text-[#0B1420]/70 border-[#0B1420]/15 hover:text-[#0B1420] hover:bg-[#0B1420]/[0.08]';

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  onQuickView,
  formatPrice,
  filters,
  onFiltersChange,
}) => {
  // Every colour/zip combination is a variant of a card, so these filter variants, not cards.
  const { type: activeCategory, color: colorFilter, zip: zipFilter } = filters;
  const { isLoading, error } = useProducts();

  // Two-step picker per product card, like a clothing site: color swatch first, then option (zip/no zip).
  const [selectedColorIdx, setSelectedColorIdx] = useState<Record<string, number>>({});
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<Record<string, number>>({});

  const categories = [
    { id: 'all', label: 'All Totes' },
    { id: 'bestseller', label: '🔥 Bestsellers' },
    { id: 'plain', label: 'Plain Canvas' },
    { id: 'printed', label: 'Printed Designs' },
  ];

  const { colors: colorOptions, zips: zipOptions } = filterOptions(products);

  const matchesFilters = (v: ProductVariant) =>
    (!colorFilter || v.colorLabel === colorFilter) && (!zipFilter || v.badge === zipFilter);

  const filteredProducts = (activeCategory === 'all'
    ? products
    : activeCategory === 'bestseller'
    ? products.filter((p) => p.isBestSeller)
    : products.filter((p) => p.category === activeCategory)
  ).filter((p) => p.variants.some(matchesFilters));

  const hasFilters = activeCategory !== 'all' || colorFilter !== null || zipFilter !== null;

  // A new colour or zip filter, from these chips or the shop nav, drops the shopper's swatch
  // picks so each card opens on its first matching option.
  useEffect(() => {
    setSelectedColorIdx({});
    setSelectedOptionIdx({});
  }, [colorFilter, zipFilter]);

  const toggleColor = (color: string) => {
    playSnap();
    onFiltersChange({ ...filters, color: colorFilter === color ? null : color });
  };

  const toggleZip = (zip: string) => {
    playSnap();
    onFiltersChange({ ...filters, zip: zipFilter === zip ? null : zip });
  };

  const clearFilters = () => {
    playSnap();
    onFiltersChange(NO_FILTERS);
  };

  // The shopper's own pick wins; otherwise the first colour/option that matches the filters.
  const getActiveIdx = (product: Product) =>
    selectedColorIdx[product.id] !== undefined
      ? { colorIdx: selectedColorIdx[product.id], optionIdx: selectedOptionIdx[product.id] || 0 }
      : firstMatch(product, matchesFilters);

  const getActiveVariant = (product: Product) => {
    const groups = getColorGroups(product);
    const { colorIdx, optionIdx } = getActiveIdx(product);
    const group = groups[colorIdx] || groups[0];
    return group.variants[optionIdx] || group.variants[0];
  };

  const openQuickView = (product: Product) => onQuickView(withVariantFirst(product, getActiveVariant(product)));

  const handleSelectColor = (product: Product, colorIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    playSnap();
    const groups = getColorGroups(product);
    const currentBadge = getActiveVariant(product).badge;
    const newGroup = groups[colorIdx];
    const matchIdx = currentBadge ? newGroup.variants.findIndex((v) => v.badge === currentBadge) : -1;

    setSelectedColorIdx((prev) => ({ ...prev, [product.id]: colorIdx }));
    setSelectedOptionIdx((prev) => ({ ...prev, [product.id]: matchIdx >= 0 ? matchIdx : 0 }));
  };

  const handleSelectOption = (product: Product, optionIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    playSnap();
    const { colorIdx } = getActiveIdx(product);
    setSelectedColorIdx((prev) => ({ ...prev, [product.id]: colorIdx }));
    setSelectedOptionIdx((prev) => ({ ...prev, [product.id]: optionIdx }));
  };

  const handleAdd = (product: Product, e: React.MouseEvent) => {
    e.stopPropagation();
    playPop();
    const variant = getActiveVariant(product);
    onAddToCart({
      id: product.id,
      name: product.name,
      variantId: variant.id,
      variantName: variant.name,
      colorHex: variant.colorHex,
      image: variant.image,
      price: variant.price,
    });
  };

  return (
    <section id="catalog" className="py-16 sm:py-24 bg-gradient-to-b from-[#F7F2E8] via-[#F0E2DC] to-[#F7F2E8] border-t border-[#0B1420]/10 relative overflow-hidden">
      {/* Immersive UI Ambient Blurs */}
      <div className="ambient-glow-container">
        <div className="ambient-glow-slate opacity-20" />
        <div className="ambient-radial-gold opacity-15" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="space-y-3 mb-8 sm:mb-10">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#B87D00] to-transparent" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B87D00] font-mono font-medium">
              The Permanent Lineup
            </span>
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-light text-[#0B1420] leading-tight">
            <span className="italic text-[#0B1420]/70">Made for</span>{' '}
            <span className="text-[#340E09] font-serif font-bold not-italic">Everyday Carry</span>
          </h2>
          <p className="text-[#0B1420]/60 text-sm sm:text-base max-w-xl font-light tracking-wide leading-relaxed">
            Hand-finished from 320 GSM cotton canvas — plain silhouettes in Black &amp; Off White, plus fun printed designs. Reusable, washable, and made to order.
          </p>
        </div>

        {/* Filters; scroll-mt clears the pinned navbar when the shop nav or banner scrolls here. */}
        <div id="catalog-filters" className="mb-6 sm:mb-10 space-y-3 scroll-mt-28">
          <div className="flex flex-col gap-2 sm:flex-row sm:flex-wrap sm:gap-x-5">
            <div className={CHIP_ROW}>
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  aria-pressed={activeCategory === cat.id}
                  onClick={() => {
                    playSnap();
                    onFiltersChange({ ...filters, type: cat.id as BagType });
                  }}
                  className={`${CHIP_BASE} ${activeCategory === cat.id ? CHIP_ON : CHIP_OFF}`}
                >
                  {cat.label}
                </button>
              ))}
            </div>

            {colorOptions.length > 0 && (
              <div className={CHIP_ROW}>
                {colorOptions.map((color) => (
                  <button
                    key={color}
                    aria-pressed={colorFilter === color}
                    onClick={() => toggleColor(color)}
                    className={`${CHIP_BASE} ${colorFilter === color ? CHIP_ON : CHIP_OFF}`}
                  >
                    <span
                      className={`w-3 h-3 rounded-full border ${colorFilter === color ? 'border-[#F7F2E8]/60' : 'border-[#0B1420]/20'}`}
                      style={{ backgroundColor: colorHexFromLabel(color) }}
                    />
                    {color}
                  </button>
                ))}

                {zipOptions.length > 0 && <span aria-hidden className="shrink-0 w-px my-1.5 bg-[#0B1420]/15" />}
                {zipOptions.map((zip) => (
                  <button
                    key={zip}
                    aria-pressed={zipFilter === zip}
                    onClick={() => toggleZip(zip)}
                    className={`${CHIP_BASE} ${zipFilter === zip ? CHIP_ON : CHIP_OFF}`}
                  >
                    {zip}
                  </button>
                ))}
              </div>
            )}
          </div>

          {products.length > 0 && (
            <div className="flex items-center gap-3 text-[11px] font-mono uppercase tracking-wider text-[#0B1420]/55" aria-live="polite">
              <span>
                {filteredProducts.length} {filteredProducts.length === 1 ? 'tote' : 'totes'}
              </span>
              {hasFilters && (
                <button onClick={clearFilters} className="underline underline-offset-4 hover:text-[#0B1420] cursor-pointer">
                  Clear filters
                </button>
              )}
            </div>
          )}
        </div>

        {/* Product Cards Grid */}
        {error && products.length === 0 && (
          <p className="text-center text-sm text-[#0B1420]/60 py-12">{error}</p>
        )}
        {products.length > 0 && filteredProducts.length === 0 && (
          <p className="text-center text-sm text-[#0B1420]/60 py-12">No totes match these filters.</p>
        )}
        {/* Phones: 2 per row and compact cards, so 3 rows (6 totes) fit on one screen. */}
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-2.5 sm:gap-8">
          {/* A sleeping API can take ~25s to answer; placeholders say "loading" instead of "empty". */}
          {isLoading && products.length === 0 && Array.from({ length: 6 }, (_, i) => (
            <div key={i} className={`rounded-2xl sm:rounded-[36px] border border-[#0B1420]/10 overflow-hidden animate-pulse ${i >= 3 ? 'lg:hidden' : ''}`}>
              <div className="aspect-square sm:aspect-[4/5] bg-[#efe9dd]" />
              <div className="p-3 sm:p-6 space-y-3">
                <div className="h-4 w-2/3 rounded-full bg-[#0B1420]/10" />
                <div className="h-4 w-1/3 rounded-full bg-[#0B1420]/10" />
              </div>
            </div>
          ))}
          {filteredProducts.map((product) => {
            const colorGroups = getColorGroups(product);
            const { colorIdx: activeColorIdx, optionIdx: activeOptionIdx } = getActiveIdx(product);
            const activeGroup = colorGroups[activeColorIdx] || colorGroups[0];
            const activeVariant = activeGroup.variants[activeOptionIdx] || activeGroup.variants[0];

            return (
              <motion.div
                key={product.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                onClick={() => openQuickView(product)}
                className="group cursor-pointer rounded-2xl sm:rounded-[36px] bg-[#0B1420]/[0.03] border border-[#0B1420]/10 hover:border-[#B87D00]/50 transition-colors duration-300 overflow-hidden flex flex-col justify-between shadow-md sm:shadow-2xl"
              >
                {/* Image Showcase Container — object-contain + a fixed neutral backdrop so the
                    whole tote (handles to base) always stays in frame, never cropped. */}
                <div className="relative aspect-square sm:aspect-[4/5] overflow-hidden flex items-center justify-center bg-[#efe9dd]">
                  {/* Product Image */}
                  <img
                    src={activeVariant.image}
                    alt={`${product.name} in ${activeGroup.label}`}
                    referrerPolicy="no-referrer"
                    loading="lazy"
                    decoding="async"
                    className="w-full h-full object-contain p-1 sm:p-3 group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Badges (Immersive UI rounded-full pills) */}
                  <div className="absolute top-2 left-2 sm:top-6 sm:left-6 flex flex-col gap-1.5 z-10">
                    {product.isBestSeller && (
                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#B87D00]/40 text-[#B87D00] text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Flame className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-[#B87D00]" /> Bestseller
                      </span>
                    )}
                    {product.isNewDrop && (
                      <span className="px-2 py-0.5 sm:px-3 sm:py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[8px] sm:text-[9px] font-mono font-bold uppercase tracking-wider shadow-md">
                        New
                      </span>
                    )}
                  </div>

                  {colorGroups.length > 1 && (
                    <div className="sm:hidden absolute bottom-1.5 left-1.5 flex gap-1 rounded-full bg-white/85 px-1.5 py-1" aria-hidden>
                      {colorGroups.map((group, gIdx) => (
                        <span
                          key={group.label}
                          className={`size-3 rounded-full border border-[#0B1420]/20 ${activeColorIdx === gIdx ? 'ring-1 ring-[#0B1420] ring-offset-1' : ''}`}
                          style={{ backgroundColor: group.colorHex }}
                        />
                      ))}
                    </div>
                  )}

                  {/* Quick View Hover Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playPop();
                      openQuickView(product);
                    }}
                    aria-label={`View ${product.name}`}
                    className="absolute bottom-6 right-6 p-3 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-all duration-200 shadow-xl hover:scale-110 flex items-center gap-1.5 text-xs font-semibold backdrop-blur-md"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#F7F2E8]" />
                    <span className="text-[10px] uppercase font-mono tracking-wider hidden sm:inline">Inspect</span>
                  </button>
                </div>

                {/* Card Content & Details. On phones the card is compact (name, swatches,
                    price); the tap opens the popup where zip option and Add live. */}
                <div className="p-2 sm:p-6 space-y-1 sm:space-y-4 flex-1 flex flex-col justify-between">
                  <div className="flex-1 space-y-1 sm:space-y-2">
                    {/* Category & Size */}
                    <div className="hidden sm:flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#B87D00]">
                        {product.category === 'plain' ? 'Plain Canvas' : 'Printed Design'}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#0B1420]/50">{product.size}</span>
                    </div>

                    {/* Title */}
                    <h3 className="text-[13px] sm:text-lg font-serif font-medium leading-snug text-[#0B1420] group-hover:text-[#B87D00] transition-colors line-clamp-1 sm:line-clamp-2">
                      {product.name}
                    </h3>
                    <p className="hidden sm:block text-xs text-[#0B1420]/60 line-clamp-2 leading-relaxed font-light">
                      {product.tagline}
                    </p>
                  </div>

                  {/* Color Swatches Row — swatch(es) and the colour name sit as
                      one left-aligned group. Pushed apart with justify-between,
                      a single-colour tote left one lone swatch on the left and
                      the label stranded on the right, which read as misaligned
                      against the option pills and price stacked below. */}
                  <div className="hidden sm:block pt-3 border-t border-white/5 space-y-2.5">
                    <div className="flex items-center gap-2 sm:gap-3">
                      <div className="flex items-center gap-1.5 sm:gap-2">
                        {colorGroups.map((group, gIdx) => {
                          const isChosen = activeColorIdx === gIdx;
                          return (
                            <button
                              key={group.label}
                              onClick={(e) => handleSelectColor(product, gIdx, e)}
                              aria-label={group.label}
                              className={`w-5 h-5 sm:w-7 sm:h-7 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                                isChosen ? 'ring-2 ring-offset-1 sm:ring-offset-2 ring-offset-[#F7F2E8] ring-[#0B1420] scale-105' : 'border-[#0B1420]/15 opacity-70 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: group.colorHex }}
                              title={group.label}
                            >
                              {isChosen && (
                                <Check
                                  className="w-2.5 h-2.5 sm:w-3 sm:h-3 stroke-[3]"
                                  style={{ color: group.colorHex === '#efe9dd' ? '#0B1420' : '#F7F2E8' }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-[9px] sm:text-[10px] font-mono text-[#0B1420]/50 uppercase tracking-wider truncate">
                        {activeGroup.label}
                      </span>
                    </div>

                    {/* Zip / No-Zip Option Pills (only when the color has more than one option) */}
                    {activeGroup.variants.length > 1 && (
                      <div className="hidden sm:flex items-center gap-1.5">
                        {activeGroup.variants.map((v, vIdx) => {
                          const isChosen = activeOptionIdx === vIdx;
                          return (
                            <button
                              key={v.id}
                              onClick={(e) => handleSelectOption(product, vIdx, e)}
                              className={`px-2.5 py-1 rounded-full text-[9px] font-mono uppercase tracking-wider border transition-all cursor-pointer ${
                                isChosen
                                  ? 'bg-[#0B1420] text-[#F7F2E8] border-[#0B1420]'
                                  : 'bg-transparent text-[#0B1420]/50 border-[#0B1420]/15 hover:text-[#0B1420] hover:border-[#0B1420]/30'
                              }`}
                            >
                              {v.badge || v.name}
                            </button>
                          );
                        })}
                      </div>
                    )}
                  </div>

                  {/* Price & Add to Bag */}
                  <div className="sm:pt-3 sm:border-t border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <PriceTag
                          price={activeVariant.price}
                          mrp={activeVariant.mrp}
                          formatPrice={formatPrice}
                          className="font-display tabular-nums text-[15px] sm:text-2xl lg:text-3xl font-semibold tracking-tight text-[#0B1420]"
                        />
                      </div>
                      <span className="hidden sm:block text-[9px] text-[#0B1420]/50 font-mono uppercase tracking-wider">
                        {activeVariant.badge || 'Made to Order'}
                      </span>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={(e) => handleAdd(product, e)}
                      className="hidden sm:flex px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] hover:from-[#05090F] hover:to-[#4a1a10] text-[#F7F2E8] font-semibold text-[10px] uppercase tracking-widest items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-lg shadow-[#B87D00]/15"
                    >
                      <ShoppingBag className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </motion.button>
                  </div>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
