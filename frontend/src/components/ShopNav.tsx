import React from 'react';
import { MessageCircle } from 'lucide-react';
import { Product } from '../types';
import { BagType, CatalogFilters, scrollToBags } from './ProductCatalog';
import { filterOptions, iconImage } from '../utils/variants';
import { customOrderUrl } from '../lib/whatsapp';
import { isSaleOn } from '../lib/sale';
import { playSnap } from '../utils/audio';

const TABS: { id: BagType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'printed', label: 'Printed' },
  { id: 'plain', label: 'Plain' },
  { id: 'bestseller', label: 'Bestsellers' },
];

// The panel and the active tab share this colour, so the tab reads as part of the panel (Myntra's folder tab).
const PANEL = 'bg-[#FCFAF5]';
const ICON = 'flex w-[72px] shrink-0 snap-start flex-col items-center gap-1.5 cursor-pointer transition-transform duration-150 active:scale-[0.97]';
const DISC = 'block size-16 sm:size-[72px] rounded-full p-[3px] ring-2 transition-[box-shadow] duration-150';

interface ShopNavProps {
  products: Product[];
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
}

/**
 * Top of the home page, the way Myntra opens: bag-type tabs, then a row of photo icons.
 * Every tap filters the product grid and takes the shopper to it.
 */
export const ShopNav: React.FC<ShopNavProps> = ({ products, filters, onChange }) => {
  const festive = isSaleOn();
  const { colors, zips } = filterOptions(products);
  const idleRing = festive ? 'ring-[#E8A33D]' : 'ring-[#0B1420]/10';

  const apply = (next: CatalogFilters) => {
    playSnap();
    onChange(next);
    scrollToBags();
  };

  // Each icon gets a different bag, so Black and With Zip never show the same photo.
  const used = new Set<string>();
  const photo = (keep: (p: Product, v: Product['variants'][number]) => boolean) => {
    const image = iconImage(products, (p, v) => keep(p, v) && !used.has(v.image)) ?? iconImage(products, keep);
    if (image) used.add(image);
    return image;
  };

  const icons = [
    ...colors.map((color) => ({
      label: color,
      on: filters.color === color,
      image: photo((_, v) => v.colorLabel === color),
      next: { ...filters, color: filters.color === color ? null : color },
    })),
    ...zips.map((zip) => ({
      label: zip,
      on: filters.zip === zip,
      image: photo((_, v) => v.badge === zip),
      next: { ...filters, zip: filters.zip === zip ? null : zip },
    })),
  ];

  return (
    <section id="hero" aria-label="Shop totes" className="bg-[#F7F2E8] pt-3 sm:pt-6">
      <h1 className="sr-only">Desi Totes: handmade cotton canvas tote bags, printed and plain</h1>

      <div className="max-w-xl mx-auto px-4 flex">
        {TABS.map((tab) => {
          const on = filters.type === tab.id;
          return (
            <button
              key={tab.id}
              aria-pressed={on}
              onClick={() => apply({ ...filters, type: tab.id })}
              className={`relative -mb-px flex-1 min-w-0 rounded-t-2xl border border-b-0 px-1 pt-3 pb-2.5 text-[11px] sm:text-xs uppercase tracking-[0.12em] cursor-pointer transition-colors duration-150 ${
                on ? `${PANEL} border-[#340E09]/20 font-semibold text-[#340E09]` : 'border-transparent text-[#0B1420]/60 hover:text-[#0B1420]'
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className={`${PANEL} border-y border-[#340E09]/20`}>
        <ul className="max-w-7xl mx-auto flex gap-3 sm:gap-6 overflow-x-auto scrollbar-hide snap-x px-4 py-4 sm:justify-center">
          {products.length === 0
            ? Array.from({ length: 6 }, (_, i) => (
                <li key={i} className={ICON} aria-hidden>
                  <span className={`${DISC} ring-[#0B1420]/10`}>
                    <span className="block size-full rounded-full bg-[#0B1420]/[0.06] animate-pulse" />
                  </span>
                  <span className="h-3 w-12 rounded-full bg-[#0B1420]/[0.06] animate-pulse" />
                </li>
              ))
            : icons.map((icon) => (
                <li key={icon.label}>
                  <button aria-pressed={icon.on} onClick={() => apply(icon.next)} className={ICON}>
                    <span className={`${DISC} ${icon.on ? 'ring-[#340E09]' : idleRing}`}>
                      {icon.image && (
                        <img
                          src={icon.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="size-full rounded-full object-contain p-1.5 bg-white"
                        />
                      )}
                    </span>
                    <span className={`text-[11px] leading-tight text-center ${icon.on ? 'font-semibold text-[#340E09]' : 'text-[#0B1420]/75'}`}>
                      {icon.label}
                    </span>
                  </button>
                </li>
              ))}

          <li>
            <a href={customOrderUrl} target="_blank" rel="noreferrer" aria-label="Custom orders on WhatsApp" className={ICON}>
              <span className={`${DISC} ${idleRing}`}>
                <span className="flex size-full items-center justify-center rounded-full bg-[#0B1420]">
                  <MessageCircle className="size-6 text-[#25D366]" aria-hidden />
                </span>
              </span>
              <span className="text-[11px] leading-tight text-center text-[#0B1420]/75">Custom orders</span>
            </a>
          </li>
        </ul>
      </div>
    </section>
  );
};
