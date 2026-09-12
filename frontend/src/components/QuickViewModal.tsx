import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { X, ShoppingBag, Check, Ruler, Layers } from 'lucide-react';
import { Product } from '../types';
import { playPop, playSnap } from '../utils/audio';
import { getColorGroups } from '../utils/variants';
import { useCloseOnBack } from '../hooks/useCloseOnBack';

interface QuickViewModalProps {
  product: Product | null;
  onClose: () => void;
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

export const QuickViewModal: React.FC<QuickViewModalProps> = ({
  product,
  onClose,
  onAddToCart,
  formatPrice,
}) => {
  // Two-step picker: color swatch first, then with-zip / without-zip option.
  const [selectedColorIdx, setSelectedColorIdx] = useState(0);
  const [selectedOptionIdx, setSelectedOptionIdx] = useState(0);

  // Reset the picker whenever a different product is opened.
  useEffect(() => {
    setSelectedColorIdx(0);
    setSelectedOptionIdx(0);
  }, [product?.id]);

  // Back button closes the product instead of leaving the shop.
  useCloseOnBack(Boolean(product), onClose);

  if (!product) return null;

  const colorGroups = getColorGroups(product);
  const activeGroup = colorGroups[selectedColorIdx] || colorGroups[0];
  const activeVariant = activeGroup.variants[selectedOptionIdx] || activeGroup.variants[0];

  const handleSelectColor = (idx: number) => {
    playSnap();
    const currentBadge = activeVariant.badge;
    const newGroup = colorGroups[idx];
    const matchIdx = currentBadge ? newGroup.variants.findIndex((v) => v.badge === currentBadge) : -1;
    setSelectedColorIdx(idx);
    setSelectedOptionIdx(matchIdx >= 0 ? matchIdx : 0);
  };

  const handleSelectOption = (idx: number) => {
    playSnap();
    setSelectedOptionIdx(idx);
  };

  const handleAdd = () => {
    playPop();
    onAddToCart({
      id: product.id,
      name: product.name,
      variantId: activeVariant.id,
      variantName: activeVariant.name,
      colorHex: activeVariant.colorHex,
      image: activeVariant.image,
      price: activeVariant.price,
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="w-full max-w-3xl rounded-[32px] sm:rounded-[36px] bg-[#F7F2E8] border border-[#0B1420]/10 p-6 sm:p-8 shadow-2xl shadow-[#0B1420]/20 relative my-8 backdrop-blur-2xl"
      >
        <button
          onClick={onClose}
          className="absolute top-5 right-5 p-2 rounded-full bg-[#0B1420]/5 hover:bg-[#0B1420]/10 text-[#0B1420]/60 hover:text-[#0B1420] transition-colors cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">

          {/* Left: Big Preview Image */}
          <div className="relative aspect-square rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#efe9dd] border border-[#0B1420]/10 p-3">
            <img
              src={activeVariant.image}
              alt={`${product.name} in ${activeGroup.label}`}
              referrerPolicy="no-referrer"
              loading="lazy"
              decoding="async"
              className="w-full h-full object-cover rounded-[20px]"
            />
            {activeVariant.badge && (
              <span className="absolute top-6 left-6 px-3 py-1 rounded-full bg-[#0B1420] text-[#F7F2E8] text-[9px] font-mono font-bold uppercase tracking-widest shadow-md">
                {activeVariant.badge}
              </span>
            )}
          </div>

          {/* Right: Product specs and checkout */}
          <div className="space-y-4">
            <div>
              <span className="text-[10px] font-mono uppercase tracking-wider text-[#B87D00]">
                {product.category === 'plain' ? 'Plain Canvas' : 'Printed Design'}
              </span>
              <h2 className="text-2xl sm:text-3xl font-serif font-light text-[#0B1420] leading-tight">{product.name}</h2>
              <p className="text-xs text-[#0B1420]/50 mt-1 font-mono">{product.tagline}</p>
            </div>

            {/* Price */}
            <div className="flex items-baseline gap-2.5">
              <span className="font-display tabular-nums text-2xl sm:text-3xl font-semibold tracking-tight text-[#B87D00]">
                {formatPrice(activeVariant.price)}
              </span>
            </div>

            <p className="text-xs text-[#0B1420]/60 leading-relaxed border-t border-[#0B1420]/10 pt-3 font-light">
              {product.description}
            </p>

            {/* Color Swatch Selector */}
            <div className="space-y-2 pt-1">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-[#0B1420]/40 text-[10px] uppercase tracking-wider">COLOR:</span>
                <span className="font-bold text-[#0B1420] text-xs">{activeGroup.label}</span>
              </div>
              <div className="flex gap-2.5 flex-wrap">
                {colorGroups.map((group, idx) => {
                  const isChosen = selectedColorIdx === idx;
                  return (
                    <button
                      key={group.label}
                      onClick={() => handleSelectColor(idx)}
                      className={`w-9 h-9 rounded-full border-2 transition-all cursor-pointer flex items-center justify-center ${
                        isChosen ? 'border-[#B87D00] scale-105' : 'border-[#0B1420]/15 opacity-70 hover:opacity-100'
                      }`}
                      style={{ backgroundColor: group.colorHex }}
                      title={group.label}
                    >
                      {isChosen && (
                        <Check
                          className="w-3.5 h-3.5 stroke-[3]"
                          style={{ color: group.colorHex === '#efe9dd' ? '#0B1420' : '#F7F2E8' }}
                        />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Zip / No-Zip Option Selector */}
            {activeGroup.variants.length > 1 && (
              <div className="space-y-2">
                <span className="text-[#0B1420]/40 text-[10px] uppercase tracking-wider font-mono">OPTION:</span>
                <div className="flex gap-2.5 flex-wrap">
                  {activeGroup.variants.map((v, idx) => (
                    <button
                      key={v.id}
                      onClick={() => handleSelectOption(idx)}
                      className={`px-3 py-1.5 rounded-full border text-[10px] font-mono uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                        selectedOptionIdx === idx
                          ? 'bg-[#B87D00]/15 border-[#B87D00] text-[#0B1420]'
                          : 'border-[#0B1420]/15 text-[#0B1420]/60 hover:text-[#0B1420] hover:border-[#0B1420]/30'
                      }`}
                    >
                      {selectedOptionIdx === idx && <Check className="w-3 h-3" />}
                      <span>{v.badge || v.name}</span>
                      <span className="text-[#0B1420]/40">{formatPrice(v.price)}</span>
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Key specs bullet list */}
            <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-[#0B1420]/50 pt-2 border-t border-[#0B1420]/10 uppercase tracking-wider">
              <span className="flex items-center gap-1.5"><Ruler className="w-3.5 h-3.5 text-[#B87D00]" /> {product.size}</span>
              <span className="flex items-center gap-1.5"><Layers className="w-3.5 h-3.5 text-[#B87D00]" /> {product.fabric}</span>
            </div>

            {/* Add to Bag CTA */}
            <motion.button
              whileTap={{ scale: 0.98 }}
              onClick={handleAdd}
              className="w-full py-4 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] hover:from-[#05090F] hover:to-[#4a1a10] text-[#F7F2E8] font-semibold text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 shadow-xl shadow-[#B87D00]/20 cursor-pointer transition-all"
            >
              <ShoppingBag className="w-3.5 h-3.5" />
              <span>Add to Bag — {formatPrice(activeVariant.price)}</span>
            </motion.button>
          </div>

        </div>
      </motion.div>
    </div>
  );
};
