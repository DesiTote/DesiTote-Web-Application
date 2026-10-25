import React from 'react';
import { ArrowRight, Banknote, Hand, Truck } from 'lucide-react';
import { SALE, isSaleOn, saleLastDay } from '../lib/sale';
import { playPop } from '../utils/audio';
import { scrollToBags } from './ProductCatalog';
import bannerWide from '../assets/images/diwali-banner-wide.webp';
import bannerTall from '../assets/images/diwali-banner-tall.webp';

const firstDay = SALE.startsAt.toLocaleDateString('en-IN', { day: 'numeric', timeZone: 'Asia/Kolkata' });

/**
 * Homepage banner for the sale; renders nothing outside the sale dates.
 * The festive scene is one ChatGPT image built from the real tote photos, with no text baked in,
 * so the offer below stays sharp, readable and correct if the dates or percent change.
 */
export const DiwaliSaleBanner: React.FC = () => {
  if (!isSaleOn()) return null;

  const shopNow = () => {
    playPop();
    scrollToBags();
  };

  return (
    <section aria-label={SALE.name} className="bg-[#F7F2E8] px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6">
      <div className="relative max-w-7xl mx-auto overflow-hidden rounded-2xl sm:rounded-[28px] bg-[#1d1112]">
        <picture>
          <source media="(min-width: 768px)" srcSet={bannerWide} width={1536} height={768} />
          <img
            src={bannerTall}
            width={1024}
            height={1365}
            alt="Desi Totes canvas totes among lit diyas and marigolds"
            fetchPriority="high"
            decoding="async"
            className="block w-full h-auto"
          />
        </picture>

        {/* Shade under the words only: the bottom on phones, the left half on wider screens. */}
        <div className="absolute inset-x-0 bottom-0 md:inset-y-0 md:right-auto md:w-[58%] flex flex-col justify-end md:justify-center gap-3 sm:gap-4 p-5 pt-28 sm:p-8 md:p-12 lg:p-16 bg-gradient-to-t md:bg-gradient-to-r from-[#140a0b]/90 via-[#140a0b]/55 to-transparent text-[#F7F2E8]">
          <p className="text-sm sm:text-base font-semibold tracking-wide text-[#E8A33D]">{SALE.name}</p>
          <h2 className="text-5xl sm:text-6xl lg:text-7xl font-extrabold leading-[0.95] tracking-tight text-balance">
            Flat {SALE.percent}% off
          </h2>
          <p className="text-[13px] sm:text-base text-pretty text-[#F7F2E8]/80 md:max-w-[34ch]">
            Every tote, {firstDay} to {saleLastDay()}.
          </p>
          <button
            onClick={shopNow}
            className="mt-1 self-start inline-flex items-center gap-2.5 rounded-full bg-[#F7F2E8] pl-6 pr-2 py-2 text-sm font-semibold text-[#0B1420] cursor-pointer transition-[background-color,transform] duration-150 hover:bg-white active:scale-[0.97] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#E8A33D] focus-visible:ring-offset-2 focus-visible:ring-offset-[#140a0b]"
          >
            Shop the sale
            <span className="flex size-8 items-center justify-center rounded-full bg-[#0B1420] text-[#F7F2E8]">
              <ArrowRight className="size-3.5" aria-hidden />
            </span>
          </button>
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
