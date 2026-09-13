import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, ArrowUpRight, RotateCw, Leaf } from 'lucide-react';
import { playPop, playSnap } from '../utils/audio';
import { useProducts } from '../context/ProductsContext';
import { DesiLogo } from './DesiLogo';

interface HeroProps {
  onAddToCart: (product: {
    id: string;
    name: string;
    variantId: string;
    variantName: string;
    colorHex: string;
    image: string;
    price: number;
  }) => void;
  currency: 'INR' | 'USD';
  formatPrice: (inr: number) => string;
}

export const Hero: React.FC<HeroProps> = ({
  onAddToCart,
  currency,
  formatPrice,
}) => {
  const { products } = useProducts();
  const heroProduct = products.find((p) => p.id === 'desi-hobo-tote') || products[0];
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);
  const [isRotating, setIsRotating] = useState(false);

  if (!heroProduct) return null;

  const currentVariant = heroProduct.variants[selectedVariantIndex] || heroProduct.variants[0];

  const handleSelectVariant = (index: number) => {
    playSnap();
    setSelectedVariantIndex(index);
  };

  const handleQuickAdd = () => {
    playPop();
    onAddToCart({
      id: heroProduct.id,
      name: heroProduct.name,
      variantId: currentVariant.id,
      variantName: currentVariant.name,
      colorHex: currentVariant.colorHex,
      image: currentVariant.image,
      price: currentVariant.price,
    });
  };

  return (
    <section id="hero" className="relative pt-8 pb-20 md:py-24 overflow-hidden bg-[#F7F2E8]">
      {/* Immersive UI Ambient Background Blurs & Radial Glows */}
      <div className="ambient-glow-container">
        <div className="ambient-glow-espresso" />
        <div className="ambient-glow-slate" />
        <div className="ambient-radial-gold" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-x-14 lg:gap-y-8 items-center">

          {/* Intro copy. Kept separate from the purchase controls below so the
              product photo can slot between the two when the grid collapses to
              one column — stacked as one block, "Add to Bag" would come before
              the shopper had seen the bag. */}
          <div className="order-1 lg:col-start-1 lg:row-start-1 lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">

            {/* Top Available Now Indicator */}
            <div className="flex flex-col sm:flex-row items-center gap-3 justify-center lg:justify-start flex-wrap">
              <div className="flex items-center gap-2.5">
                <DesiLogo size="xs" variant="badge" />
                <span className="text-[10px] uppercase tracking-[0.25em] text-[#B87D00] font-mono font-medium">
                  देसी Totes
                </span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0B1420]/5 border border-[#0B1420]/10 text-[10px] tracking-widest uppercase text-[#0B1420]/60">
                <Leaf className="w-3 h-3 text-[#3f6b3f]" />
                <span>Handmade Cotton Canvas • Made in India</span>
              </div>
            </div>

            {/* Display Headline */}
            <div className="space-y-3">
              <h1 className="text-5xl sm:text-6xl xl:text-7xl font-serif font-light leading-[0.9] tracking-tight text-[#0B1420]">
                <span className="block italic text-[#0B1420]/80">Carry It</span>
                <span className="block text-[#340E09] font-serif font-bold not-italic mt-1">
                  Desi Style
                </span>
              </h1>
              <p className="text-sm sm:text-base text-[#0B1420]/60 max-w-lg mx-auto lg:mx-0 leading-relaxed font-light tracking-wide pt-1">
                Sturdy 320 GSM cotton canvas totes, hand-finished in plain silhouettes and fun printed designs. Reusable, washable, and kind to the planet.
              </p>
            </div>
          </div>

          {/* Purchase controls — on phones these follow the product photo. */}
          <div className="order-3 lg:order-2 lg:col-start-1 lg:row-start-2 lg:col-span-6 space-y-6 sm:space-y-8 text-center lg:text-left">

            {/* Selected Colour & Swatches in Frosted Glass */}
            <div className="space-y-2.5 p-4 rounded-[22px] bg-white/50 border border-[#0B1420]/10 max-w-md mx-auto lg:mx-0">
              <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.15em] font-mono">
                <span className="text-[#0B1420]/50">{heroProduct.name.toUpperCase()}:</span>
                <span className="font-semibold text-[#0B1420]">{currentVariant.name}</span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                {heroProduct.variants.map((variant, index) => {
                  const isActive = selectedVariantIndex === index;
                  return (
                    <button
                      key={variant.id}
                      onClick={() => handleSelectVariant(index)}
                      className={`group relative flex items-center justify-center p-0.5 rounded-full transition-all cursor-pointer ${
                        isActive ? 'ring-2 ring-[#0B1420] scale-110' : 'hover:scale-105 opacity-70 hover:opacity-100'
                      }`}
                      title={variant.name}
                    >
                      <span
                        className="w-7 h-7 rounded-full border border-[#0B1420]/15 shadow-inner flex items-center justify-center"
                        style={{ backgroundColor: variant.colorHex }}
                      />
                    </button>
                  );
                })}
                <span className="text-[10px] text-[#0B1420]/50 font-mono ml-auto tracking-wider">
                  {formatPrice(currentVariant.price)}
                </span>
              </div>
            </div>

            {/* CTA & Pricing Area with Rounded-Full Pills */}
            <div className="space-y-4 pt-1">
              <div className="flex flex-col sm:flex-row items-center gap-3.5 justify-center lg:justify-start">
                {/* Main Add to Cart */}
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleQuickAdd}
                  className="w-full sm:w-auto px-8 py-3.5 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] hover:from-[#05090F] hover:to-[#4a1a10] text-[#F7F2E8] font-semibold text-[11px] uppercase tracking-widest flex items-center justify-center gap-2.5 shadow-xl shadow-[#B87D00]/15 transition-all cursor-pointer group"
                >
                  <ShoppingBag className="w-4 h-4 group-hover:scale-110 transition-transform" />
                  <span>ADD TO BAG — {formatPrice(currentVariant.price)}</span>
                </motion.button>

                {/* Shop All CTA */}
                <motion.a
                  href="#catalog"
                  onClick={(e) => {
                    e.preventDefault();
                    playPop();
                    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
                  }}
                  whileHover={{ scale: 1.03, y: -1 }}
                  whileTap={{ scale: 0.97 }}
                  className="w-full sm:w-auto px-7 py-3.5 rounded-full border border-[#0B1420]/25 bg-[#0B1420]/5 hover:bg-[#0B1420]/10 text-[#0B1420] font-medium text-[11px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all group cursor-pointer"
                >
                  <span>SHOP ALL TOTES</span>
                  <ArrowUpRight className="w-3.5 h-3.5 text-[#0B1420]/50 group-hover:text-[#0B1420] transition-transform" />
                </motion.a>
              </div>

              {/* Material Badges */}
              <div className="flex flex-wrap items-center justify-center lg:justify-start gap-2 pt-2">
                <span className="px-3 py-1 rounded-full bg-[#0B1420]/5 border border-[#0B1420]/10 text-[9px] uppercase tracking-widest text-[#0B1420]/60">
                  320 GSM Cotton Canvas
                </span>
                <span className="px-3 py-1 rounded-full bg-[#0B1420]/5 border border-[#0B1420]/10 text-[9px] uppercase tracking-widest text-[#0B1420]/60">
                  Reusable &amp; Washable
                </span>
                <span className="px-3 py-1 rounded-full bg-[#0B1420]/10 border border-[#0B1420]/30 text-[9px] uppercase tracking-widest text-[#0B1420]">
                  Plain &amp; Printed Designs
                </span>
              </div>
            </div>

          </div>

          {/* Right Column: Immersive Glass Canvas Showcase */}
          <div className="order-2 lg:order-3 lg:col-start-7 lg:row-start-1 lg:row-span-2 lg:col-span-6 relative">
            <div className="relative mx-auto max-w-lg rounded-[36px] sm:rounded-[40px] bg-white/50 p-3 border border-[#0B1420]/10 shadow-2xl">

              {/* Top Card Controls Bar */}
              <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#0B1420]/10 text-xs">
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full bg-[#0B1420]/15 text-[#0B1420] font-mono font-bold text-[9px] tracking-widest uppercase border border-[#0B1420]/30">
                    {heroProduct.isBestSeller ? 'Bestseller' : 'Featured'}
                  </span>
                  <span className="text-[#0B1420]/50 font-mono text-[10px] tracking-wider uppercase hidden xs:inline">{currentVariant.badge || 'In Stock'}</span>
                </div>
              </div>

              {/* Main Visual Display Area */}
              <div className="relative aspect-square w-full rounded-[28px] overflow-hidden bg-white flex items-center justify-center p-6 group border border-[#0B1420]/10">

                {/* Subtle Amber Glow Under Product */}
                <div className="absolute inset-0 opacity-25 blur-3xl transition-colors duration-500 bg-[#c8a27b]" />

                <AnimatePresence mode="wait">
                  <motion.div
                    key={currentVariant.id}
                    initial={{ opacity: 0, scale: 0.94 }}
                    animate={{
                      opacity: 1,
                      scale: 1,
                      rotate: isRotating ? 360 : 0
                    }}
                    exit={{ opacity: 0, scale: 0.94 }}
                    transition={{ duration: 0.4 }}
                    className="relative w-full h-full flex items-center justify-center"
                  >
                    <img
                      src={currentVariant.image}
                      alt={`${heroProduct.name} — ${currentVariant.name}`}
                      referrerPolicy="no-referrer"
                      /* The largest thing on the first screen, and it cannot
                         start downloading until the catalogue call returns -
                         so once we do have it, ask for it ahead of everything
                         else on the page. */
                      loading="eager"
                      fetchPriority="high"
                      decoding="async"
                      className="w-full h-full object-cover rounded-2xl shadow-2xl transition-transform duration-500 group-hover:scale-105"
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Rotate trigger button */}
                <button
                  onClick={() => {
                    playSnap();
                    setIsRotating(!isRotating);
                  }}
                  title="Rotate Preview"
                  className="absolute bottom-4 right-4 p-2.5 rounded-full bg-black/60 hover:bg-black/90 text-white/60 hover:text-white border border-white/15 backdrop-blur-md transition-all"
                >
                  <RotateCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin text-[#0B1420]' : ''}`} />
                </button>
              </div>

              {/* Bottom Quick-Action Bar */}
              <div className="px-4 py-3 flex items-center justify-between text-[11px] text-[#0B1420]/50">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#0B1420]" />
                  <span className="text-[#0B1420]/70 font-mono text-[10px] uppercase tracking-wider">Made to order</span>
                </div>
                <span className="text-[#0B1420] font-mono text-[10px] uppercase tracking-wider">
                  {heroProduct.fabric}
                </span>
              </div>

            </div>
          </div>

        </div>
      </div>
    </section>
  );
};
