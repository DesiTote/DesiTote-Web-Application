import React from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { ArrowRight } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { SALE, isSaleOn, saleLastDay } from '../lib/sale';
import { playPop } from '../utils/audio';

/** Homepage banner for the sale; renders nothing once it ends. */
export const DiwaliSaleBanner: React.FC = () => {
  const { products } = useProducts();
  const reduceMotion = useReducedMotion();
  if (!isSaleOn()) return null;

  // Two printed designs, one per colour where possible, so the banner shows real bags.
  const printed = products.filter((p) => p.category === 'printed');
  const photos = [
    printed.flatMap((p) => p.variants).find((v) => v.colorLabel === 'Natural')?.image,
    printed.flatMap((p) => p.variants).find((v) => v.colorLabel === 'Black')?.image,
  ].filter(Boolean) as string[];

  const shopNow = () => {
    playPop();
    document.getElementById('catalog')?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <section aria-label={SALE.name} className="px-4 sm:px-6 lg:px-8 pb-12 sm:pb-16 bg-[#F7F2E8]">
      <div className="max-w-7xl mx-auto rounded-[28px] overflow-hidden bg-gradient-to-br from-[#340E09] via-[#1d1112] to-[#0B1420] text-[#F7F2E8] relative">
        {/* Warm lamp-light glow behind the bags */}
        <div
          className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-[#E8A33D]/20 blur-3xl pointer-events-none"
          aria-hidden
        />
        <div className="relative grid grid-cols-1 md:grid-cols-12 items-center gap-8 px-6 py-10 sm:px-12 sm:py-14">
          <div className="md:col-span-7 space-y-5 text-center md:text-left">
            <p className="text-[11px] uppercase tracking-[0.22em] text-[#E8A33D] font-semibold">{SALE.name}</p>
            <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight">
              <span className="font-bold text-[#E8A33D]">{SALE.percent}% off</span> every tote
            </h2>
            <p className="text-sm sm:text-base text-[#F7F2E8]/70 font-light max-w-md mx-auto md:mx-0 leading-relaxed">
              Prices already include the discount, no code needed. Ends {saleLastDay()}.
            </p>
            <motion.button
              whileTap={{ scale: 0.97 }}
              onClick={shopNow}
              className="inline-flex items-center gap-2 px-7 py-3.5 rounded-full bg-[#F7F2E8] text-[#0B1420] text-xs font-semibold uppercase tracking-widest hover:bg-white transition-colors cursor-pointer"
            >
              Shop the sale
              <ArrowRight className="w-3.5 h-3.5" />
            </motion.button>
          </div>

          {photos.length > 0 && (
            <div className="md:col-span-5 flex justify-center md:justify-end">
              <div className="relative w-[230px] sm:w-[260px] h-[250px] sm:h-[290px]">
                {photos.map((src, i) => (
                  <motion.img
                    key={src}
                    src={src}
                    alt=""
                    loading="lazy"
                    initial={reduceMotion ? false : { opacity: 0, y: 24, rotate: 0 }}
                    whileInView={{ opacity: 1, y: 0, rotate: i === 0 ? -7 : 6 }}
                    viewport={{ once: true, amount: 0.4 }}
                    transition={{ duration: 0.7, delay: i * 0.12, ease: [0.16, 1, 0.3, 1] }}
                    className={`absolute w-[150px] sm:w-[170px] aspect-[2/3] object-cover rounded-2xl shadow-2xl shadow-black/40 ring-1 ring-white/10 ${
                      i === 0 ? 'left-0 top-4' : 'right-0 top-0'
                    }`}
                    style={reduceMotion ? { rotate: i === 0 ? -7 : 6 } : undefined}
                  />
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </section>
  );
};
