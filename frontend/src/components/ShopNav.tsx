import React from 'react';
import { Product } from '../types';
import { BagType, CatalogFilters } from './ProductCatalog';
import { filterOptions, iconImage } from '../utils/variants';
import { customOrderUrl } from '../lib/whatsapp';
import { isSaleOn } from '../lib/sale';
import { playSnap } from '../utils/audio';
import iconBlack from '../assets/images/icon-black.webp';
import iconNatural from '../assets/images/icon-natural.webp';
import iconOffWhite from '../assets/images/icon-off-white.webp';
import iconWithZip from '../assets/images/icon-with-zip.webp';
import iconWithoutZip from '../assets/images/icon-without-zip.webp';
import iconCustom from '../assets/images/icon-custom-order.webp';

const TABS: { id: BagType; label: string }[] = [
  { id: 'all', label: 'All' },
  { id: 'printed', label: 'Printed' },
  { id: 'plain', label: 'Plain' },
  { id: 'bestseller', label: 'Bestsellers' },
];

// Cut-outs of real Desi Totes photos, one different bag per icon. A colour added
// later in the admin falls back to a catalogue photo until it gets its own.
const ICON_ART: Record<string, string> = {
  Black: iconBlack,
  Natural: iconNatural,
  'Off White': iconOffWhite,
  'With Zip': iconWithZip,
  'Without Zip': iconWithoutZip,
};

// The panel and the active tab share this colour, so the tab reads as part of the panel (Myntra's folder tab).
const PANEL = 'bg-[#FCFAF5]';
const ICON = 'flex w-[72px] shrink-0 snap-start flex-col items-center gap-1.5 cursor-pointer transition-transform duration-150 active:scale-[0.97]';
// Brand maroon ring all year; the selected icon's ring is thicker and solid.
const DISC = 'block size-16 sm:size-[72px] rounded-full p-[3px] transition-[box-shadow] duration-150';
const RING_IDLE = 'ring-2 ring-[#340E09]/60';
const RING_ON = 'ring-[3px] ring-[#340E09]';

interface ShopNavProps {
  products: Product[];
  filters: CatalogFilters;
  onChange: (filters: CatalogFilters) => void;
}

/**
 * Top of the home page, the way Myntra opens: bag-type tabs, then a row of photo icons.
 * Every tap opens the bags on the shop page, filtered to that choice.
 */
export const ShopNav: React.FC<ShopNavProps> = ({ products, filters, onChange }) => {
  const { colors, zips } = filterOptions(products);

  const apply = (next: CatalogFilters) => {
    playSnap();
    onChange(next);
  };

  const icons = [
    ...colors.map((color) => ({
      label: color,
      on: filters.color === color,
      image: ICON_ART[color] ?? iconImage(products, (_, v) => v.colorLabel === color),
      next: { ...filters, color: filters.color === color ? null : color },
    })),
    ...zips.map((zip) => ({
      label: zip,
      on: filters.zip === zip,
      image: ICON_ART[zip] ?? iconImage(products, (_, v) => v.badge === zip),
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
                  <span className={`${DISC} ${RING_IDLE}`}>
                    <span className="block size-full rounded-full bg-[#0B1420]/[0.06] animate-pulse" />
                  </span>
                  <span className="h-3 w-12 rounded-full bg-[#0B1420]/[0.06] animate-pulse" />
                </li>
              ))
            : icons.map((icon) => (
                <li key={icon.label}>
                  <button aria-pressed={icon.on} onClick={() => apply(icon.next)} className={ICON}>
                    <span className={`${DISC} ${icon.on ? RING_ON : RING_IDLE}`}>
                      {icon.image && (
                        <img
                          src={icon.image}
                          alt=""
                          loading="lazy"
                          decoding="async"
                          className="size-full rounded-full object-contain p-1 bg-white"
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
              <span className={`${DISC} ${RING_IDLE}`}>
                <img src={iconCustom} alt="" loading="lazy" decoding="async" className="size-full rounded-full object-contain p-1 bg-white" />
              </span>
              <span className="text-[11px] leading-tight text-center text-[#0B1420]/75">Custom orders</span>
            </a>
          </li>
        </ul>
        {!isSaleOn() && (
          <p className="px-4 pb-3 text-center text-[11px] text-[#340E09]">10% off your first order, taken off at checkout</p>
        )}
      </div>
    </section>
  );
};
