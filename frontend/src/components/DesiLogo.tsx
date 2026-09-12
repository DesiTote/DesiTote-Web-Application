import React from 'react';
import { motion } from 'motion/react';
import logoImage from '../assets/images/logo.jpg';

export interface DesiLogoProps {
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | number;
  variant?: 'badge' | 'horizontal' | 'stacked';
  showSubtitle?: boolean;
  className?: string;
  useImage?: boolean;
  /** Set true when placing the horizontal/stacked wordmark on a dark background (e.g. the Footer). */
  dark?: boolean;
}

export const DesiLogo: React.FC<DesiLogoProps> = ({
  size = 'md',
  variant = 'horizontal',
  showSubtitle = true,
  className = '',
  useImage = true, // Use the client's real logo photo by default
  dark = false,
}) => {
  // Generous dimension mapping in pixels for high visibility
  const getDimension = () => {
    if (typeof size === 'number') return size;
    switch (size) {
      case 'xs': return 36;
      case 'sm': return 48;
      case 'md': return 62;
      case 'lg': return 86;
      case 'xl': return 120;
      default: return 62;
    }
  };

  const dim = getDimension();
  // Phones get a smaller mark. At full size the horizontal logo is 257px wide,
  // which together with the navbar's action buttons overflows a 375px screen —
  // and iOS Safari responds by zooming the whole page out, leaving a dead strip
  // down the side of the site.
  const mobileDim = Math.round(dim * 0.78);

  // The circular badge element (renders high-contrast, razor-sharp client mandala emblem)
  const badgeElement = (
    <div
      className="relative shrink-0 rounded-full overflow-hidden shadow-2xl border-2 border-[#0B1420] bg-[#F7F2E8] group transition-all duration-300 hover:scale-105 hover:shadow-[0_0_20px_rgba(200,162,123,0.45)] ring-2 ring-white/10 w-[var(--logo-dim-mobile)] h-[var(--logo-dim-mobile)] sm:w-[var(--logo-dim)] sm:h-[var(--logo-dim)]"
      style={{ '--logo-dim': `${dim}px`, '--logo-dim-mobile': `${mobileDim}px` } as React.CSSProperties}
    >
      {useImage ? (
        <img
          src={logoImage}
          alt="देसी totes client logo"
          referrerPolicy="no-referrer"
          className="w-full h-full object-cover rounded-full"
        />
      ) : (
        /* Ultra-crisp, high-contrast vector SVG rendition of the client's circular mandala emblem */
        <svg
          viewBox="0 0 200 200"
          className="w-full h-full select-none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Base cream canvas layer */}
          <circle cx="100" cy="100" r="99" fill="#F7F2E8" />

          {/* Outer scalloped rim (24 symmetrical architectural lobes) */}
          <path
            d="M 100,6 
               C 107,6 113,9 118,13 C 124,10 131,12 137,17 C 143,16 150,20 154,27 C 160,28 166,33 169,41 C 174,44 179,51 180,59 C 184,64 187,72 187,80 C 190,87 191,95 189,103 C 191,111 189,119 186,126 C 185,134 181,142 176,148 C 173,156 167,162 161,167 C 156,174 149,179 142,182 C 135,188 127,190 119,192 C 112,196 104,197 96,196 C 88,197 80,195 73,191 C 65,189 58,185 52,180 C 45,176 39,170 35,163 C 30,157 25,150 23,142 C 19,135 16,127 16,119 C 14,111 15,103 17,95 C 16,87 18,79 22,72 C 24,64 29,57 34,52 C 38,45 44,40 51,37 C 56,31 63,27 70,24 C 77,19 85,17 93,16 Z"
            fill="#0B1420"
          />

          {/* Radiant golden inner rim */}
          <circle cx="100" cy="100" r="85" fill="#F7F2E8" stroke="#0B1420" strokeWidth="3" />

          {/* Ornamental Mandala / Rangoli filigree ring */}
          <g stroke="#0B1420" strokeWidth="1.2" fill="none">
            {Array.from({ length: 16 }).map((_, i) => {
              const angle = (i * 360) / 16;
              return (
                <g key={i} transform={`rotate(${angle} 100 100)`}>
                  {/* Outer floral petal in warm gold */}
                  <path
                    d="M 94,22 C 96,28 100,32 100,36 C 100,32 104,28 106,22 Z"
                    fill="#0B1420"
                  />
                  {/* Inner petal in deep royal maroon */}
                  <path
                    d="M 96,36 C 98,42 100,46 100,50 C 100,46 102,42 104,36 Z"
                    fill="#782025"
                  />
                  {/* Rangoli stippled dots */}
                  <circle cx="100" cy="27" r="1.8" fill="#FFFFFF" />
                  <circle cx="91" cy="30" r="1.4" fill="#0B1420" />
                  <circle cx="109" cy="30" r="1.4" fill="#0B1420" />
                </g>
              );
            })}
          </g>

          {/* Concentric inner medallion ring with rich contrast */}
          <circle cx="100" cy="100" r="54" fill="#FFFFFF" stroke="#0B1420" strokeWidth="2.5" />
          <circle cx="100" cy="100" r="50" fill="none" stroke="#0B1420" strokeWidth="1.5" strokeDasharray="3 2" />

          {/* Center Brandmark Typography */}
          <g textAnchor="middle">
            {/* "देसी" in heavy, authentic Devanagari script */}
            <text
              x="100"
              y="97"
              fill="#0B1420"
              fontSize="34"
              fontWeight="900"
              fontFamily="'Plus Jakarta Sans', 'Noto Sans Devanagari', 'Poppins', 'Segoe UI', system-ui, sans-serif"
              letterSpacing="0.5"
            >
              देसी
            </text>

            {/* "totes" in clean, crisp lowercase sans-serif */}
            <text
              x="100"
              y="122"
              fill="#0B1420"
              fontSize="19"
              fontWeight="800"
              fontFamily="'Plus Jakarta Sans', system-ui, sans-serif"
              letterSpacing="0.5"
            >
              totes
            </text>
          </g>
        </svg>
      )}

      {/* Radiant gold ring highlight on hover */}
      <div className="absolute inset-0 rounded-full ring-1 ring-[#0B1420]/40 pointer-events-none group-hover:ring-2 group-hover:ring-[#0B1420] transition-all" />
    </div>
  );

  if (variant === 'badge') {
    return badgeElement;
  }

  if (variant === 'stacked') {
    return (
      <div className={`flex flex-col items-center text-center gap-2.5 ${className}`}>
        {badgeElement}
        <div className="flex flex-col items-center">
          <div className="flex items-center gap-2">
            <span className={`text-2xl sm:text-3xl font-black tracking-tight font-display flex items-baseline gap-1.5 ${dark ? 'text-white' : 'text-[#0B1420]'}`}>
              <span className={dark ? 'text-[#B87D00] font-black' : 'text-[#0B1420] font-black'}>देसी</span>{' '}
              <span className={`font-light tracking-widest lowercase ${dark ? 'text-white' : 'text-[#0B1420]'}`}>totes</span>
            </span>
          </div>
          {showSubtitle && (
            <span className={`text-[10px] tracking-[0.28em] uppercase font-mono mt-1 font-semibold ${dark ? 'text-white/70' : 'text-[#0B1420]/70'}`}>
              Cotton Canvas Totes
            </span>
          )}
        </div>
      </div>
    );
  }

  // Default: horizontal variant (for Navbar, Header, Footer) - Bold, highly visible, and elegant
  return (
    <div className={`flex items-center gap-2.5 sm:gap-3.5 min-w-0 ${className}`}>
      {badgeElement}
      {/* Below 360px there is no room for the wordmark beside the navbar's
          action buttons, so the badge carries the brand on its own. */}
      <div className="flex-col justify-center min-w-0 hidden min-[360px]:flex">
        <div className="flex items-center gap-2.5 min-w-0">
          <span className={`text-xl sm:text-2xl font-black tracking-tight font-display flex items-baseline gap-1.5 whitespace-nowrap ${dark ? 'text-white' : 'text-[#0B1420]'}`}>
            <span className={`font-black drop-shadow-[0_0_12px_rgba(200,162,123,0.3)] ${dark ? 'text-[#B87D00]' : 'text-[#0B1420]'}`}>देसी</span>
            <span className={`font-light tracking-wide lowercase ${dark ? 'text-white' : 'text-[#0B1420]'}`}>totes</span>
          </span>
          <span className={`hidden sm:inline-block text-[9px] uppercase tracking-[0.24em] px-2.5 py-0.5 rounded-full font-mono font-bold shadow-sm ${dark ? 'bg-[#B87D00]/15 text-[#B87D00] border border-[#B87D00]/40' : 'bg-[#0B1420]/15 text-[#0B1420] border border-[#0B1420]/40'}`}>
            Atelier
          </span>
        </div>
        {showSubtitle && (
          <span className={`hidden sm:block text-[10.5px] tracking-[0.18em] uppercase font-mono font-semibold ${dark ? 'text-white/75' : 'text-[#0B1420]/75'}`}>
            320 GSM Cotton Canvas
          </span>
        )}
      </div>
    </div>
  );
};
