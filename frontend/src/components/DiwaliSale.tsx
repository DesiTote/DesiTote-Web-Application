import React from 'react';
import { motion } from 'motion/react';
import { ArrowRight, Banknote, Hand, Truck } from 'lucide-react';
import { useProducts } from '../context/ProductsContext';
import { SALE, isSaleOn, saleLastDay } from '../lib/sale';
import { playPop } from '../utils/audio';

/** Homepage banner for the sale; renders nothing once it ends. */
export const DiwaliSaleBanner: React.FC = () => {
  const { products } = useProducts();
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
      {/* Outer shell + inner panel with concentric radii, so the banner sits in the page like a framed plate. */}
      <div className="max-w-7xl mx-auto p-1.5 rounded-[32px] bg-[#0B1420]/[0.04] ring-1 ring-[#0B1420]/[0.06]">
        <div className="rounded-[26px] overflow-hidden bg-gradient-to-br from-[#340E09] via-[#1d1112] to-[#0B1420] text-[#F7F2E8] relative shadow-[inset_0_1px_1px_rgba(255,255,255,0.12)]">
          {/* Warm lamp-light glow behind the bags */}
          <div
            className="absolute -right-24 -top-24 w-[420px] h-[420px] rounded-full bg-[#E8A33D]/20 blur-3xl pointer-events-none"
            aria-hidden
          />
          <FestoonLights />
          <Rangoli className="absolute -left-24 -bottom-32 w-64 sm:w-72 text-[#E8A33D] opacity-[0.18]" />
          <Rangoli className="hidden md:block absolute right-[38%] -top-16 w-40 text-[#E8A33D] opacity-[0.08]" />
          <div className="relative grid grid-cols-1 md:grid-cols-12 items-center gap-8 px-6 pt-16 pb-12 sm:px-12 sm:pt-20 sm:pb-16">
            <div className="md:col-span-7 space-y-5 text-center md:text-left">
              <span className="inline-flex items-center gap-2 rounded-full bg-[#E8A33D]/15 ring-1 ring-[#E8A33D]/40 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.18em] text-[#E8A33D]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#E8A33D]" aria-hidden />
                Live now
              </span>
              <h2 className="text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.05] tracking-tight text-balance">
                The <span className="font-bold text-[#E8A33D]">{SALE.name}</span>
              </h2>
              <p className="text-sm sm:text-base text-pretty text-[#F7F2E8]/75 max-w-md mx-auto md:mx-0 leading-relaxed">
                Flat {SALE.percent}% off every tote, already taken off the price. No code needed. Ends {saleLastDay()}.
              </p>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={shopNow}
                className="group inline-flex items-center gap-3 pl-7 pr-2 py-2 rounded-full bg-[#F7F2E8] text-[#0B1420] text-xs font-semibold uppercase tracking-widest hover:bg-white transition-colors cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A33D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#1d1112]"
              >
                Shop the sale
                <span className="w-8 h-8 rounded-full bg-[#0B1420] text-[#F7F2E8] flex items-center justify-center transition-transform duration-200 ease-[cubic-bezier(0.23,1,0.32,1)] group-hover:translate-x-0.5">
                  <ArrowRight className="w-3.5 h-3.5" />
                </span>
              </motion.button>
            </div>
  
            {photos.length > 0 && (
              <div className="md:col-span-5 flex justify-center md:justify-end">
                <div className="relative w-[230px] sm:w-[260px] h-[250px] sm:h-[290px]">
                  {photos.map((src, i) => (
                    <img
                      key={src}
                      src={src}
                      alt=""
                      loading="lazy"
                      style={{ transform: `rotate(${i === 0 ? -7 : 6}deg)` }}
                      className={`absolute w-[150px] sm:w-[170px] aspect-[2/3] object-cover rounded-2xl shadow-2xl shadow-black/40 ring-1 ring-white/10 ${
                        i === 0 ? 'left-0 top-4' : 'right-0 top-0'
                      }`}
                    />
                  ))}
                  <OffSeal percent={SALE.percent} />
                  <Diya className="absolute -bottom-7 -left-6 w-16 sm:w-20" />
                  <Diya className="absolute -bottom-8 -right-4 w-14 sm:w-16" flameDelay="-0.7s" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Reassurance strip under the offer, the way the big festive sale pages do it. */}
      <ul className="max-w-7xl mx-auto mt-3 grid grid-cols-3 gap-2 text-[11px] sm:text-xs text-[#0B1420]/70">
        {[
          { Icon: Banknote, text: 'Cash on delivery' },
          { Icon: Truck, text: 'Free shipping over ₹999' },
          { Icon: Hand, text: 'Handmade in India' },
        ].map(({ Icon, text }) => (
          <li key={text} className="flex flex-col sm:flex-row items-center justify-center gap-1.5 sm:gap-2 rounded-2xl bg-[#0B1420]/[0.04] px-2 py-3 text-center">
            <Icon className="w-4 h-4 text-[#B87D00] shrink-0" aria-hidden />
            {text}
          </li>
        ))}
      </ul>
    </section>
  );
};

/* ── Decorations ──────────────────────────────────────────────
 * Plain SVG so they stay crisp and cost nothing to load. The bulb twinkle and
 * flame flicker live in index.css and stop under reduced motion. */

/** A string of fairy lights sagging in two swags across the top of the banner. */
const FestoonLights: React.FC = () => {
  // Bulbs sit on the two quadratic swags of the wire: (0,6)→(600,6) via (300,56), and the mirror.
  const bulbs: { x: number; y: number }[] = [];
  for (const [x0, cx] of [[0, 300], [600, 900]]) {
    for (let k = 1; k <= 7; k++) {
      const t = k / 8;
      bulbs.push({ x: (1 - t) ** 2 * x0 + 2 * (1 - t) * t * cx + t * t * (x0 + 600), y: 6 + 2 * (1 - t) * t * 50 });
    }
  }
  return (
    <svg
      viewBox="0 0 1200 90"
      preserveAspectRatio="xMidYMin slice"
      className="absolute inset-x-0 top-0 w-full h-16 sm:h-20 pointer-events-none"
      aria-hidden
    >
      <defs>
        <radialGradient id="bulb-glow">
          <stop offset="0" stopColor="#FFD58A" stopOpacity="0.9" />
          <stop offset="1" stopColor="#FFD58A" stopOpacity="0" />
        </radialGradient>
      </defs>
      <path d="M0 6 Q300 56 600 6 Q900 56 1200 6" fill="none" stroke="#F7F2E8" strokeOpacity="0.25" strokeWidth="1.5" />
      {bulbs.map((b, i) => (
        <g key={i} className="diwali-twinkle" style={{ animationDelay: `${(i * 0.37) % 2.4}s` }}>
          <circle cx={b.x} cy={b.y + 12} r="14" fill="url(#bulb-glow)" />
          <rect x={b.x - 2.5} y={b.y} width="5" height="5" rx="1" fill="#F7F2E8" fillOpacity="0.4" />
          <ellipse cx={b.x} cy={b.y + 11} rx="4.5" ry="6" fill={i % 3 === 1 ? '#F7F2E8' : '#FFC75A'} />
        </g>
      ))}
    </svg>
  );
};

/** Eight-petal rangoli in currentColor, drawn as outlines so it reads as a faint pattern. */
const Rangoli: React.FC<{ className?: string }> = ({ className }) => (
  <svg viewBox="-100 -100 200 200" className={`pointer-events-none ${className ?? ''}`} aria-hidden>
    <g fill="none" stroke="currentColor" strokeWidth="1.4">
      <circle r="96" strokeDasharray="2 6" strokeLinecap="round" />
      <circle r="78" />
      {Array.from({ length: 16 }, (_, i) => (
        <path key={`o${i}`} d="M0 -78 Q12 -62 0 -46 Q-12 -62 0 -78Z" transform={`rotate(${i * 22.5})`} />
      ))}
      <circle r="44" />
      {Array.from({ length: 8 }, (_, i) => (
        <ellipse key={`p${i}`} cx="0" cy="-26" rx="9" ry="18" transform={`rotate(${i * 45})`} />
      ))}
      <circle r="7" fill="currentColor" />
    </g>
    {Array.from({ length: 8 }, (_, i) => (
      <circle key={`d${i}`} cx="0" cy="-62" r="2.4" fill="currentColor" transform={`rotate(${i * 45 + 22.5})`} />
    ))}
  </svg>
);

/** Gold "FLAT 25% OFF" seal pinned to the photo stack, like the festive sale stamps. */
const OffSeal: React.FC<{ percent: number }> = ({ percent }) => (
  <div className="absolute -top-5 -left-6 sm:-left-10 z-10 w-24 h-24 sm:w-28 sm:h-28 -rotate-12 rounded-full bg-gradient-to-br from-[#FFE2A3] via-[#E8A33D] to-[#B87D00] p-1 shadow-xl shadow-black/40">
    <div className="w-full h-full rounded-full border border-dashed border-[#340E09]/40 flex flex-col items-center justify-center text-[#340E09] leading-none">
      <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-[0.2em]">Flat</span>
      <span className="text-3xl sm:text-4xl font-extrabold tracking-tight tabular-nums">{percent}%</span>
      <span className="text-[10px] sm:text-xs font-bold uppercase tracking-[0.2em]">Off</span>
    </div>
  </div>
);

/** A clay diya with a flickering flame. */
const Diya: React.FC<{ className?: string; flameDelay?: string }> = ({ className, flameDelay }) => (
  <svg viewBox="0 0 80 64" className={`pointer-events-none drop-shadow-[0_0_14px_rgba(255,170,60,0.45)] ${className ?? ''}`} aria-hidden>
    <defs>
      <linearGradient id="diya-flame" x1="0" y1="1" x2="0" y2="0">
        <stop offset="0" stopColor="#FF7A1A" />
        <stop offset="0.55" stopColor="#FFB23E" />
        <stop offset="1" stopColor="#FFF1C2" />
      </linearGradient>
      <linearGradient id="diya-clay" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#C8642E" />
        <stop offset="1" stopColor="#7A2E12" />
      </linearGradient>
    </defs>
    <circle cx="40" cy="22" r="16" fill="#FFB23E" fillOpacity="0.18" />
    <path
      className="diwali-flame"
      style={{ animationDelay: flameDelay }}
      d="M40 6 C46 16 47 23 40 30 C33 23 34 16 40 6Z"
      fill="url(#diya-flame)"
    />
    <path d="M6 34 Q40 30 74 34 Q70 58 40 60 Q10 58 6 34Z" fill="url(#diya-clay)" />
    <path d="M6 34 Q40 30 74 34 Q40 40 6 34Z" fill="#E8A33D" />
    <path d="M20 46 Q40 50 60 46" fill="none" stroke="#E8A33D" strokeOpacity="0.6" strokeWidth="1.5" strokeDasharray="1 4" strokeLinecap="round" />
  </svg>
);
