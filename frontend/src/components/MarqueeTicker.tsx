import React from 'react';
import { Sparkles, Recycle, Ruler, Hand, HeartHandshake, CheckCircle2 } from 'lucide-react';

export const MarqueeTicker: React.FC = () => {
  const items1 = [
    { text: '100% COTTON CANVAS', icon: Sparkles },
    { text: '320 GSM HEAVYWEIGHT FABRIC', icon: Ruler },
    { text: 'HAND-FINISHED IN INDIA', icon: Hand },
    { text: 'PLAIN & PRINTED DESIGNS', icon: HeartHandshake },
    { text: 'WITH ZIP OR WITHOUT ZIP', icon: CheckCircle2 },
    { text: 'REUSABLE & PLASTIC-FREE', icon: Recycle },
  ];

  const items2 = [
    { text: 'MADE TO ORDER' },
    { text: 'BLACK & OFF WHITE AVAILABLE' },
    { text: 'FREE SHIPPING OVER ₹999' },
    { text: '14" X 16" PRINTED TOTES' },
    { text: 'EVERY REUSE SKIPS A PLASTIC BAG' },
    { text: 'देसी totes' },
  ];

  return (
    <section className="py-6 border-y border-[#0B1420]/10 bg-[#F7F2E8] overflow-hidden select-none space-y-3 relative z-10">
      {/* Forward ticker */}
      <div className="flex overflow-hidden">
        <div className="animate-marquee flex items-center gap-10 text-[11px] sm:text-xs font-semibold tracking-[0.22em] uppercase font-mono text-[#0B1420]/70">
          {[...items1, ...items1, ...items1].map((item, idx) => {
            const Icon = item.icon;
            return (
              <div key={idx} className="flex items-center gap-3 shrink-0">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0B1420]"></span>
                <Icon className="w-3.5 h-3.5 text-[#0B1420]" />
                <span>{item.text}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Reverse ticker with muted tone */}
      <div className="flex overflow-hidden">
        <div className="animate-marquee-reverse flex items-center gap-10 text-[10px] sm:text-[11px] font-mono tracking-[0.2em] uppercase text-[#0B1420]/50">
          {[...items2, ...items2, ...items2].map((item, idx) => (
            <div key={idx} className="flex items-center gap-3.5 shrink-0">
              <span className="text-[#0B1420]">✦</span>
              <span>{item.text}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
