import React, { useState } from 'react';
import { motion } from 'motion/react';
import { ShoppingBag, Eye, Check, Flame } from 'lucide-react';
import { Product } from '../types';
import { playPop, playSnap } from '../utils/audio';
import { getColorGroups } from '../utils/variants';

interface ProductCatalogProps {
  products: Product[];
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

export const ProductCatalog: React.FC<ProductCatalogProps> = ({
  products,
  onAddToCart,
  onQuickView,
  formatPrice,
}) => {
  const [activeCategory, setActiveCategory] = useState<'all' | 'bestseller' | 'plain' | 'printed'>('all');

  // Two-step picker per product card, like a clothing site: color swatch first, then option (zip/no zip).
  const [selectedColorIdx, setSelectedColorIdx] = useState<Record<string, number>>({});
  const [selectedOptionIdx, setSelectedOptionIdx] = useState<Record<string, number>>({});

  const categories = [
    { id: 'all', label: 'All Totes' },
    { id: 'bestseller', label: '🔥 Bestsellers' },
    { id: 'plain', label: 'Plain Canvas' },
    { id: 'printed', label: 'Printed Designs' },
  ];

  const filteredProducts = activeCategory === 'all'
    ? products
    : activeCategory === 'bestseller'
    ? products.filter((p) => p.isBestSeller)
    : products.filter((p) => p.category === activeCategory);

  const getActiveGroup = (product: Product) => {
    const groups = getColorGroups(product);
    const idx = selectedColorIdx[product.id] || 0;
    return groups[idx] || groups[0];
  };

  const getActiveVariant = (product: Product) => {
    const group = getActiveGroup(product);
    const idx = selectedOptionIdx[product.id] || 0;
    return group.variants[idx] || group.variants[0];
  };

  const handleSelectColor = (product: Product, colorIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    playSnap();
    const groups = getColorGroups(product);
    const currentOptIdx = selectedOptionIdx[product.id] || 0;
    const currentGroup = groups[selectedColorIdx[product.id] || 0];
    const currentBadge = currentGroup?.variants[currentOptIdx]?.badge;
    const newGroup = groups[colorIdx];
    const matchIdx = currentBadge ? newGroup.variants.findIndex((v) => v.badge === currentBadge) : -1;

    setSelectedColorIdx((prev) => ({ ...prev, [product.id]: colorIdx }));
    setSelectedOptionIdx((prev) => ({ ...prev, [product.id]: matchIdx >= 0 ? matchIdx : 0 }));
  };

  const handleSelectOption = (productId: string, optionIdx: number, e: React.MouseEvent) => {
    e.stopPropagation();
    playSnap();
    setSelectedOptionIdx((prev) => ({ ...prev, [productId]: optionIdx }));
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
    <section id="catalog" className="py-24 bg-gradient-to-b from-[#F7F2E8] via-[#F0E2DC] to-[#F7F2E8] border-t border-[#0B1420]/10 relative overflow-hidden">
      {/* Immersive UI Ambient Blurs */}
      <div className="ambient-glow-container">
        <div className="ambient-glow-slate opacity-20" />
        <div className="ambient-radial-gold opacity-15" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
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

          {/* Filter Pills (Immersive UI Rounded-Full) */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => {
              const isSelected = activeCategory === cat.id;
              return (
                <button
                  key={cat.id}
                  onClick={() => {
                    playSnap();
                    setActiveCategory(cat.id as typeof activeCategory);
                  }}
                  className={`px-4 py-2 rounded-full text-[10px] font-mono uppercase tracking-widest transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#0B1420] to-[#340E09] text-[#F7F2E8] font-bold shadow-lg shadow-[#B87D00]/20 border border-[#0B1420]'
                      : 'bg-[#0B1420]/[0.04] text-[#0B1420]/60 hover:text-[#0B1420] hover:bg-[#0B1420]/[0.08] border border-[#0B1420]/15'
                  }`}
                >
                  {cat.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Product Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {filteredProducts.map((product) => {
            const colorGroups = getColorGroups(product);
            const activeColorIdx = selectedColorIdx[product.id] || 0;
            const activeGroup = colorGroups[activeColorIdx] || colorGroups[0];
            const activeOptionIdx = selectedOptionIdx[product.id] || 0;
            const activeVariant = activeGroup.variants[activeOptionIdx] || activeGroup.variants[0];

            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="group rounded-[32px] sm:rounded-[36px] bg-[#0B1420]/[0.03] border border-[#0B1420]/10 hover:border-[#B87D00]/50 backdrop-blur-xl transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-2xl"
              >
                {/* Image Showcase Container — object-contain + a fixed neutral backdrop so the
                    whole tote (handles to base) always stays in frame, never cropped. */}
                <div
                  onClick={() => onQuickView(product)}
                  className="relative aspect-[4/5] overflow-hidden cursor-pointer flex items-center justify-center bg-[#efe9dd]"
                >
                  {/* Product Image */}
                  <img
                    src={activeVariant.image}
                    alt={`${product.name} in ${activeGroup.label}`}
                    referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
                    className="w-full h-full object-contain p-3 group-hover:scale-105 transition-transform duration-500"
                  />

                  {/* Top Badges (Immersive UI rounded-full pills) */}
                  <div className="absolute top-6 left-6 flex flex-col gap-1.5 z-10">
                    {product.isBestSeller && (
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-[#B87D00]/40 text-[#B87D00] text-[9px] font-mono font-bold uppercase tracking-wider flex items-center gap-1 shadow-md">
                        <Flame className="w-3 h-3 text-[#B87D00]" /> Bestseller
                      </span>
                    )}
                    {product.isNewDrop && (
                      <span className="px-3 py-1 rounded-full bg-black/80 backdrop-blur-md border border-white/20 text-white text-[9px] font-mono font-bold uppercase tracking-wider shadow-md">
                        New
                      </span>
                    )}
                  </div>

                  {/* Quick View Hover Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playPop();
                      onQuickView(product);
                    }}
                    className="absolute bottom-6 right-6 p-3 rounded-full bg-black/80 hover:bg-black text-white border border-white/20 opacity-0 group-hover:opacity-100 transition-all duration-200 shadow-xl hover:scale-110 flex items-center gap-1.5 text-xs font-semibold backdrop-blur-md"
                  >
                    <Eye className="w-3.5 h-3.5 text-[#F7F2E8]" />
                    <span className="text-[10px] uppercase font-mono tracking-wider hidden sm:inline">Inspect</span>
                  </button>
                </div>

                {/* Card Content & Details */}
                <div className="p-6 space-y-4 flex-1 flex flex-col justify-between">
                  <div className="space-y-2">
                    {/* Category & Size */}
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#B87D00]">
                        {product.category === 'plain' ? 'Plain Canvas' : 'Printed Design'}
                      </span>
                      <span className="text-[10px] font-mono uppercase tracking-wider text-[#0B1420]/50">{product.size}</span>
                    </div>

                    {/* Title */}
                    <h3
                      onClick={() => onQuickView(product)}
                      className="text-lg font-serif font-medium text-[#0B1420] group-hover:text-[#B87D00] transition-colors cursor-pointer"
                    >
                      {product.name}
                    </h3>
                    <p className="text-xs text-[#0B1420]/60 line-clamp-2 leading-relaxed font-light">
                      {product.tagline}
                    </p>
                  </div>

                  {/* Color Swatches Row */}
                  <div className="pt-3 border-t border-white/5 space-y-2.5">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        {colorGroups.map((group, gIdx) => {
                          const isChosen = activeColorIdx === gIdx;
                          return (
                            <button
                              key={group.label}
                              onClick={(e) => handleSelectColor(product, gIdx, e)}
                              className={`w-7 h-7 rounded-full border transition-all cursor-pointer flex items-center justify-center ${
                                isChosen ? 'ring-2 ring-offset-2 ring-offset-[#F7F2E8] ring-[#0B1420] scale-105' : 'border-[#0B1420]/15 opacity-70 hover:opacity-100'
                              }`}
                              style={{ backgroundColor: group.colorHex }}
                              title={group.label}
                            >
                              {isChosen && (
                                <Check
                                  className="w-3 h-3 stroke-[3]"
                                  style={{ color: group.colorHex === '#efe9dd' ? '#0B1420' : '#F7F2E8' }}
                                />
                              )}
                            </button>
                          );
                        })}
                      </div>
                      <span className="text-[10px] font-mono text-[#0B1420]/50 uppercase tracking-wider">
                        {activeGroup.label}
                      </span>
                    </div>

                    {/* Zip / No-Zip Option Pills (only when the color has more than one option) */}
                    {activeGroup.variants.length > 1 && (
                      <div className="flex items-center gap-1.5">
                        {activeGroup.variants.map((v, vIdx) => {
                          const isChosen = activeOptionIdx === vIdx;
                          return (
                            <button
                              key={v.id}
                              onClick={(e) => handleSelectOption(product.id, vIdx, e)}
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
                  <div className="pt-3 border-t border-white/10 flex items-center justify-between gap-3">
                    <div>
                      <div className="flex items-baseline gap-2">
                        <span className="font-display tabular-nums text-2xl sm:text-3xl font-semibold tracking-tight text-[#0B1420]">
                          {formatPrice(activeVariant.price)}
                        </span>
                      </div>
                      <span className="text-[9px] text-[#0B1420]/50 block font-mono uppercase tracking-wider">
                        {activeVariant.badge || 'Made to Order'}
                      </span>
                    </div>

                    <motion.button
                      whileTap={{ scale: 0.94 }}
                      onClick={(e) => handleAdd(product, e)}
                      className="px-5 py-2.5 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] hover:from-[#05090F] hover:to-[#4a1a10] text-[#F7F2E8] font-semibold text-[10px] uppercase tracking-widest flex items-center gap-1.5 transition-all duration-200 cursor-pointer shadow-lg shadow-[#B87D00]/15"
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
