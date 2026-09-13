import React, { useState } from 'react';
import { motion } from 'motion/react';
import {
  Sparkles,
  ShoppingBag,
  ShieldCheck,
  Check,
  Heart,
  Recycle
} from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { playPop, playSnap } from '../utils/audio';
import { getColorGroups } from '../utils/variants';

interface BestsellerSpotlightProps {
  onAddToCart: (item: {
    id: string;
    name: string;
    variantId: string;
    variantName: string;
    colorHex: string;
    image: string;
    price: number;
  }) => void;
  formatPrice: (inr: number) => string;
}

export const BestsellerSpotlight: React.FC<BestsellerSpotlightProps> = ({
  onAddToCart,
  formatPrice,
}) => {
  const { products } = useProducts();

  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(0);
  const [isLiked, setIsLiked] = useState(false);
  const [addedSuccess, setAddedSuccess] = useState(false);

  const spotlightProduct = products.find((p) => p.id === 'desi-print-kaleshi-aurat') || products[0];
  if (!spotlightProduct) return null;
  const colorGroups = getColorGroups(spotlightProduct);

  const activeGroup = colorGroups[selectedColorIdx] || colorGroups[0];
  const currentVariant = activeGroup.variants[selectedOptionIdx] || activeGroup.variants[0];

  const handleSelectColor = (idx: number) => {
    playSnap();
    const currentBadge = currentVariant.badge;
    const newGroup = colorGroups[idx];
    const matchIdx = currentBadge ? newGroup.variants.findIndex((v) => v.badge === currentBadge) : -1;
    setSelectedColorIdx(idx);
    setSelectedOptionIdx(matchIdx >= 0 ? matchIdx : 0);
  };

  const handleSelectOption = (idx: number) => {
    playSnap();
    setSelectedOptionIdx(idx);
  };

  const handleAddToCart = () => {
    playPop();
    setAddedSuccess(true);
    onAddToCart({
      id: spotlightProduct.id,
      name: spotlightProduct.name,
      variantId: currentVariant.id,
      variantName: currentVariant.name,
      colorHex: currentVariant.colorHex,
      image: currentVariant.image,
      price: currentVariant.price,
    });
    setTimeout(() => setAddedSuccess(false), 2000);
  };

  return (
    <section id="bestseller-spotlight" className="relative py-24 sm:py-32 bg-gradient-to-b from-[#F7F2E8] via-[#F4E7D3] to-[#F7F2E8] overflow-hidden border-t border-b border-[#0B1420]/10">
      {/* Background ambient lighting */}
      <div className="ambient-glow-container">
        <div className="ambient-radial-gold opacity-20" />
        <div className="ambient-glow-espresso opacity-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 mb-12 sm:mb-16">
          <div className="space-y-3">
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-[#B87D00]/12 border border-[#B87D00]/40 text-[#340E09] text-xs font-mono font-semibold tracking-wider uppercase shadow-sm">
              <Sparkles className="w-3.5 h-3.5 text-[#B87D00]" />
              <span>Design Spotlight</span>
            </div>
            <h2 className="text-3xl sm:text-5xl lg:text-6xl font-serif font-light text-[#0B1420] tracking-tight leading-tight">
              The <span className="italic font-normal text-[#B87D00]">Kaleshi Aurat</span> Tote
            </h2>
          </div>
        </div>

        {/* Spotlight Showcase Card */}
        <div className="rounded-[32px] sm:rounded-[40px] bg-white/60 border border-[#0B1420]/10 shadow-xl shadow-[#0B1420]/5 p-4 sm:p-6 lg:p-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 items-center">

            {/* Visual Showcase (Left 7 Cols) */}
            <div className="lg:col-span-7 space-y-4">
              <div className="relative rounded-2xl sm:rounded-3xl overflow-hidden border border-[#0B1420]/10 bg-[#efe9dd] shadow-lg group aspect-[4/3] sm:aspect-[16/11]">

                {/* Main Display Image */}
                <motion.img
                  key={currentVariant.id}
                  initial={{ opacity: 0, scale: 0.96 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.4 }}
                  src={currentVariant.image}
                  alt={`${spotlightProduct.name} in ${activeGroup.label}`}
                  referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
                  className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
                />

                {/* Floating Ribbon */}
                <div className="absolute top-4 left-4 sm:top-6 sm:left-6 flex flex-wrap gap-2">
                  <span className="px-3 py-1 rounded-full bg-[#0B1420] text-[#F7F2E8] text-[11px] font-bold uppercase tracking-widest shadow-lg flex items-center gap-1.5">
                    <Sparkles className="w-3 h-3 text-[#B87D00]" />
                    Kaleshi Aurat
                  </span>
                  <span className="px-3 py-1 rounded-full bg-white/80 backdrop-blur-md text-[#340E09] border border-[#0B1420]/15 text-[11px] font-mono">
                    {spotlightProduct.fabric}
                  </span>
                </div>

                {/* Wishlist Heart */}
                <button
                  onClick={() => {
                    playSnap();
                    setIsLiked(!isLiked);
                  }}
                  className={`absolute top-4 right-4 sm:top-6 sm:right-6 p-2.5 rounded-full backdrop-blur-md border transition-all cursor-pointer ${
                    isLiked
                      ? 'bg-[#ef4444] text-white border-[#ef4444]'
                      : 'bg-white/80 text-[#0B1420]/60 border-[#0B1420]/15 hover:text-[#0B1420] hover:bg-white'
                  }`}
                >
                  <Heart className={`w-4 h-4 ${isLiked ? 'fill-white' : ''}`} />
                </button>

                {/* Bottom Details Bar inside Image */}
                <div className="absolute bottom-4 left-4 right-4 sm:bottom-6 sm:left-6 sm:right-6 flex items-center justify-between">
                  <div className="bg-white/85 backdrop-blur-md px-4 py-2 rounded-xl border border-[#0B1420]/10 shadow-sm">
                    <p className="text-[11px] font-mono text-[#0B1420]/50 uppercase">Size</p>
                    <p className="text-xs sm:text-sm font-semibold text-[#0B1420]">{spotlightProduct.size}</p>
                  </div>
                  <div className="bg-white/85 backdrop-blur-md px-4 py-2 rounded-xl border border-[#0B1420]/10 text-right shadow-sm">
                    <p className="text-[11px] font-mono text-[#0B1420]/50 uppercase">Option</p>
                    <p className="text-xs sm:text-sm font-bold text-[#B87D00]">{currentVariant.badge || currentVariant.name}</p>
                  </div>
                </div>
              </div>

              {/* Color Swatches (only shown when the design comes in more than one color) */}
              {colorGroups.length > 1 && (
                <div className="flex items-center gap-2.5">
                  <span className="text-[10px] font-mono uppercase tracking-wider text-[#0B1420]/50">Color:</span>
                  {colorGroups.map((group, idx) => {
                    const isActive = selectedColorIdx === idx;
                    return (
                      <button
                        key={group.label}
                        onClick={() => handleSelectColor(idx)}
                        className={`w-8 h-8 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                          isActive ? 'border-[#B87D00] scale-105' : 'border-[#0B1420]/15 opacity-70 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: group.colorHex }}
                        title={group.label}
                      >
                        {isActive && (
                          <Check
                            className="w-3.5 h-3.5 stroke-[3]"
                            style={{ color: group.colorHex === '#efe9dd' ? '#0B1420' : '#F7F2E8' }}
                          />
                        )}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* With Zip / Without Zip Option Strip */}
              {activeGroup.variants.length > 1 && (
                <div className="grid grid-cols-2 gap-3">
                  {activeGroup.variants.map((variant, idx) => {
                    const isActive = selectedOptionIdx === idx;
                    return (
                      <button
                        key={variant.id}
                        onClick={() => handleSelectOption(idx)}
                        className={`flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left cursor-pointer ${
                          isActive
                            ? 'bg-[#B87D00]/10 border-[#B87D00] shadow-sm'
                            : 'bg-white/40 border-[#0B1420]/10 hover:border-[#0B1420]/25 hover:bg-white/60'
                        }`}
                      >
                        <img
                          src={variant.image}
                          alt={variant.name}
                          referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
                          className="w-12 h-12 rounded-lg object-cover border border-[#0B1420]/10 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-semibold text-[#0B1420] truncate">{variant.badge || variant.name}</p>
                          <p className="text-[10px] text-[#B87D00] font-mono">{formatPrice(variant.price)}</p>
                        </div>
                      </button>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Product Specifications & Fast Checkout (Right 5 Cols) */}
            <div className="lg:col-span-5 space-y-6 sm:space-y-7">
              <div className="space-y-3">
                <div className="flex items-baseline gap-3">
                  <span className="font-display tabular-nums text-3xl sm:text-4xl font-semibold tracking-tight text-[#0B1420]">
                    {formatPrice(currentVariant.price)}
                  </span>
                </div>
                <p className="text-sm text-[#0B1420]/70 leading-relaxed font-light">
                  {spotlightProduct.description}
                </p>
              </div>

              {/* Core Feature Highlights */}
              <div className="space-y-2.5 py-4 border-t border-b border-[#0B1420]/10">
                <p className="text-[11px] font-mono uppercase tracking-widest text-[#B87D00] font-semibold">
                  Details
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-[#0B1420]/80">
                  {spotlightProduct.features.map((feature, idx) => (
                    <div key={idx} className="flex items-center gap-2">
                      <Check className="w-4 h-4 text-[#B87D00] shrink-0" />
                      <span>{feature}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleAddToCart}
                  className="w-full py-4 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] hover:from-[#05090F] hover:to-[#4a1a10] text-[#F7F2E8] font-bold text-xs uppercase tracking-widest flex items-center justify-center gap-2.5 transition-all shadow-xl shadow-[#B87D00]/20 cursor-pointer group"
                >
                  {addedSuccess ? (
                    <>
                      <Check className="w-4 h-4" />
                      <span>Added to Your Bag!</span>
                    </>
                  ) : (
                    <>
                      <ShoppingBag className="w-4 h-4 transition-transform group-hover:-translate-y-0.5" />
                      <span>Add to Bag • {formatPrice(currentVariant.price)}</span>
                    </>
                  )}
                </button>
              </div>

              {/* Shipping & value promise */}
              <div className="flex items-center justify-center gap-4 text-[11px] text-[#0B1420]/50 font-mono flex-wrap">
                <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-[#B87D00]" /> Free Shipping Over ₹999</span>
                <span>•</span>
                <span className="flex items-center gap-1"><Recycle className="w-3.5 h-3.5 text-[#B87D00]" /> Reusable &amp; Plastic-Free</span>
              </div>

            </div>

          </div>
        </div>

      </div>
    </section>
  );
};
