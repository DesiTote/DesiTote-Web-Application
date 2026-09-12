import React from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { playPop } from '../utils/audio';

interface LookbookProps {
  onQuickViewByProductId: (productId: string) => void;
  formatPrice: (inr: number) => string;
}

export const PrintGallery: React.FC<LookbookProps> = ({
  onQuickViewByProductId,
  formatPrice,
}) => {
  const { products } = useProducts();
  const printedTotes = products.filter((p) => p.category === 'printed');

  return (
    <section id="gallery" className="py-24 bg-gradient-to-b from-[#F7F2E8] via-[#F4E7D3] to-[#F7F2E8] border-t border-[#0B1420]/10 relative overflow-hidden">
      {/* Immersive UI Ambient Blurs */}
      <div className="ambient-glow-container">
        <div className="ambient-glow-espresso opacity-20" />
        <div className="ambient-radial-gold opacity-15" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-16 gap-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#B87D00] to-transparent" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#B87D00] font-mono font-medium">
                Printed Collection
              </span>
            </div>
            <h2 className="text-4xl sm:text-5xl font-serif font-light text-[#0B1420] leading-tight">
              <span className="italic text-[#0B1420]/70">Prints With</span>{' '}
              <span className="text-[#340E09] font-serif font-bold not-italic">Personality</span>
            </h2>
            <p className="text-[#0B1420]/60 text-sm sm:text-base max-w-xl font-light tracking-wide leading-relaxed">
              Screen-printed by hand on 320 GSM cotton canvas — each design available with or without a zip.
            </p>
          </div>
        </div>

        {/* Gallery Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {printedTotes.map((product) => {
            const displayVariant = product.variants[0];
            return (
              <motion.div
                key={product.id}
                layout
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3 }}
                className="group relative rounded-[32px] overflow-hidden bg-[#0B1420]/[0.03] border border-[#0B1420]/10 hover:border-[#B87D00]/50 flex flex-col shadow-2xl transition-all duration-300 cursor-pointer"
                onClick={() => {
                  playPop();
                  onQuickViewByProductId(product.id);
                }}
              >
                {/* Image — contained (not cropped) on a neutral backdrop so the whole
                    tote, handles to base, always stays in frame. */}
                <div className="relative aspect-[4/5] bg-[#efe9dd] overflow-hidden">
                  <img
                    src={displayVariant.image}
                    alt={product.name}
                    referrerPolicy="no-referrer"
                    className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-700"
                  />

                  {/* Top Size Pill */}
                  <div className="absolute top-4 left-4 z-10">
                    <span className="px-3 py-1 rounded-full bg-black/70 backdrop-blur-md border border-white/20 text-[10px] font-mono font-medium text-white uppercase tracking-wider">
                      {product.size}
                    </span>
                  </div>
                </div>

                {/* Card Content */}
                <div className="p-5 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1">
                    <p className="text-sm text-[#0B1420] font-serif font-medium line-clamp-2 leading-relaxed">
                      {product.name}
                    </p>
                    <p className="text-xs text-[#0B1420]/60 line-clamp-2 leading-relaxed font-light">
                      {product.tagline}
                    </p>
                  </div>

                  {/* Shop The Look Button Pill */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      playPop();
                      onQuickViewByProductId(product.id);
                    }}
                    className="w-full py-2.5 px-4 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] hover:from-[#05090F] hover:to-[#4a1a10] text-[#F7F2E8] text-[10px] font-mono uppercase tracking-wider flex items-center justify-between transition-all duration-200 cursor-pointer shadow-lg shadow-[#B87D00]/15"
                  >
                    <span className="truncate">View Design</span>
                    <div className="flex items-center gap-1">
                      <span className="font-display tabular-nums font-semibold text-xs">{formatPrice(displayVariant.price)}</span>
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </button>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
