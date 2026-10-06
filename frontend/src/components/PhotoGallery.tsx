import React, { useEffect, useState } from 'react';
import { motion } from 'motion/react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { keyStep, stepPhoto, swipeStep } from '../utils/gallery';

interface PhotoGalleryProps {
  /** Main photo first. Remount (via `key`) to start again from it. */
  photos: string[];
  alt: string;
  badge?: string;
}

/**
 * The product popup's photo area: one big photo, a strip of the rest under
 * it. Phones swipe the big photo; desktops get arrows on hover and the arrow
 * keys. Switching is instant on purpose — shoppers flick through these many
 * times, and a transition would only make each step feel slower.
 */
export const PhotoGallery: React.FC<PhotoGalleryProps> = ({ photos, alt, badge }) => {
  const [idx, setIdx] = useState(0);
  const count = photos.length;
  const step = (delta: number) => setIdx((i) => stepPhoto(i, delta, count));

  useEffect(() => {
    if (count < 2) return;
    const onKey = (e: KeyboardEvent) => {
      const delta = keyStep(e);
      if (delta) step(delta);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [count]);

  const arrow =
    'absolute top-1/2 -translate-y-1/2 z-10 hidden sm:flex p-2 rounded-full bg-[#F7F2E8]/90 border border-[#0B1420]/10 shadow-md text-[#0B1420]/70 hover:text-[#0B1420] opacity-0 group-hover:opacity-100 focus-visible:opacity-100 transition-[opacity,transform] duration-150 ease-out active:scale-[0.97] cursor-pointer';

  return (
    <div className="space-y-3">
      <div className="group relative aspect-square rounded-[24px] sm:rounded-[28px] overflow-hidden bg-[#efe9dd] border border-[#0B1420]/10 p-3">
        <motion.img
          key={photos[idx]}
          src={photos[idx]}
          alt={count > 1 ? `${alt}, photo ${idx + 1} of ${count}` : alt}
          referrerPolicy="no-referrer"
          /* Eager, unlike the grid thumbnails: this is the one image the
             shopper just asked to see, so deferring it only delays it. */
          loading="eager"
          fetchPriority="high"
          decoding="async"
          draggable={false}
          /* The photo follows the finger with some give, springs back, and
             the release decides whether that was a swipe. Vertical movement
             is left to the browser so the popup still scrolls on a phone. */
          drag={count > 1 ? 'x' : false}
          dragSnapToOrigin
          dragElastic={0.25}
          onDragEnd={(_, info) => step(swipeStep(info.offset, info.velocity))}
          /* object-contain, not cover: the whole tote — text and print to
             the base — must stay in frame. object-cover cropped the bottom
             off tall designs like the Kaleshi Aurat print. The neutral
             backdrop and padding make the letterboxing intentional. */
          className="w-full h-full object-contain rounded-[20px] touch-pan-y select-none"
        />
        {badge && (
          <span className="absolute top-6 left-6 px-3 py-1 rounded-full bg-[#0B1420] text-[#F7F2E8] text-[9px] font-mono font-bold uppercase tracking-widest shadow-md">
            {badge}
          </span>
        )}
        {count > 1 && (
          <>
            <button onClick={() => step(-1)} aria-label="Previous photo" className={`${arrow} left-5`}>
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button onClick={() => step(1)} aria-label="Next photo" className={`${arrow} right-5`}>
              <ChevronRight className="w-4 h-4" />
            </button>
          </>
        )}
      </div>

      {count > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {photos.map((src, i) => (
            <button
              key={src}
              onClick={() => setIdx(i)}
              aria-label={`Show photo ${i + 1} of ${count}`}
              aria-current={i === idx}
              className={`shrink-0 w-16 h-16 rounded-xl overflow-hidden border-2 bg-[#efe9dd] cursor-pointer transition-[opacity,border-color,transform] duration-150 ease-out active:scale-[0.97] ${
                i === idx ? 'border-[#0B1420]' : 'border-transparent opacity-60 hover:opacity-100'
              }`}
            >
              <img src={src} alt="" loading="lazy" decoding="async" referrerPolicy="no-referrer" draggable={false} className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
