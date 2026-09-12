import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ShoppingBag, X } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { playPop, playSnap } from '../utils/audio';

interface StickyQuickBarProps {
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

export const StickyQuickBar: React.FC<StickyQuickBarProps> = ({
  onAddToCart,
  formatPrice,
}) => {
  const { products } = useProducts();
  const quickProduct = products.find((p) => p.id === 'desi-hobo-tote') || products[0];
  const [visible, setVisible] = useState(false);
  const [dismissed, setDismissed] = useState(false);
  const [selectedVariantIndex, setSelectedVariantIndex] = useState(0);

  const selectedVariant = quickProduct?.variants[selectedVariantIndex] || quickProduct?.variants[0];

  useEffect(() => {
    const handleScroll = () => {
      if (window.scrollY > 450 && !dismissed) {
        setVisible(true);
      } else {
        setVisible(false);
      }
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, [dismissed]);

  const handleAdd = () => {
    playPop();
    onAddToCart({
      id: quickProduct.id,
      name: quickProduct.name,
      variantId: selectedVariant.id,
      variantName: selectedVariant.name,
      colorHex: selectedVariant.colorHex,
      image: selectedVariant.image,
      price: selectedVariant.price,
    });
  };

  if (!visible || dismissed || !quickProduct || !selectedVariant) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ y: 80, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        exit={{ y: 80, opacity: 0 }}
        className="fixed bottom-5 left-1/2 -translate-x-1/2 z-30 w-[92%] max-w-lg"
      >
        <div className="p-2 sm:p-2.5 pl-3 rounded-full bg-[#0a0b0e]/95 backdrop-blur-2xl border border-[#0B1420]/30 shadow-2xl shadow-black/90 flex items-center justify-between gap-3">

          {/* Mini info */}
          <div className="flex items-center gap-2.5">
            <img
              src={selectedVariant.image}
              alt={quickProduct.name}
              referrerPolicy="no-referrer"
              className="w-9 h-9 rounded-full object-cover border border-white/20 shrink-0"
            />
            <div className="hidden sm:block">
              <span className="text-xs font-serif font-medium text-white block truncate">
                {quickProduct.name}
              </span>
              <span className="text-[9px] text-[#B87D00] font-mono uppercase tracking-wider">
                {quickProduct.fabric} • {quickProduct.size}
              </span>
            </div>
          </div>

          {/* Quick Variant Pick */}
          <div className="flex items-center gap-1.5">
            {quickProduct.variants.map((v, idx) => (
              <button
                key={v.id}
                onClick={() => {
                  playSnap();
                  setSelectedVariantIndex(idx);
                }}
                className={`w-5 h-5 rounded-full border border-white/20 transition-all cursor-pointer ${
                  selectedVariantIndex === idx ? 'ring-2 ring-[#B87D00] scale-110' : 'opacity-60 hover:opacity-100'
                }`}
                style={{ backgroundColor: v.colorHex }}
                title={v.name}
              />
            ))}
          </div>

          {/* Action button */}
          <div className="flex items-center gap-1.5">
            <button
              onClick={handleAdd}
              className="px-4 py-2 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] hover:from-[#05090F] hover:to-[#4a1a10] text-[#F7F2E8] font-semibold text-[10px] uppercase tracking-widest flex items-center gap-1.5 shadow-lg shadow-[#B87D00]/20 cursor-pointer transition-all"
            >
              <ShoppingBag className="w-3 h-3" />
              <span>Add — {formatPrice(selectedVariant.price)}</span>
            </button>

            <button
              onClick={() => setDismissed(true)}
              className="p-1 rounded-full text-white/40 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

        </div>
      </motion.div>
    </AnimatePresence>
  );
};
