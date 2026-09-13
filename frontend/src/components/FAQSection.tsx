import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronDown, HelpCircle, ShieldCheck } from 'lucide-react';
import { playSnap } from '../utils/audio';

export const FAQSection: React.FC = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const faqs = [
    {
      q: 'What fabric are Desi Totes bags made from?',
      a: 'Every tote is made from 320 GSM cotton canvas — a heavyweight, durable fabric that holds its shape and is built for everyday use, not just single-use carrying.'
    },
    {
      q: 'What sizes are available?',
      a: 'Our printed totes are 14" x 16" — roomy enough for books, groceries, or everyday essentials. Plain totes come in Hobo, Single Flap, Double Pocket, and Hobo Front-Pocket silhouettes, each available in Black and Off White.'
    },
    {
      q: 'What does "With Zip" vs "Without Zip" mean?',
      a: 'Some of our totes are offered both with a zip closure at the top (for a little extra security) and without one (for a more open, classic tote feel) — pick whichever you prefer when adding to your bag.'
    },
    {
      q: 'How do I clean my tote?',
      a: 'Spot clean with a damp cloth and mild soap for everyday marks. For a deeper clean, hand wash in cold water and air-dry flat in the shade to keep the print and shape looking their best.'
    },
    {
      q: 'Are these bags reusable and eco-friendly?',
      a: 'Yes. Every Desi Totes bag is made to be reused again and again, so you can leave single-use plastic bags behind — that’s the whole idea behind देसी totes.'
    },
    {
      q: 'What is your shipping policy?',
      a: 'We offer free shipping across India on orders over ₹999. Reach out to us on WhatsApp for delivery timelines to your city.'
    }
  ];

  const toggle = (idx: number) => {
    playSnap();
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <section id="faq" className="py-24 bg-[#F7F2E8] border-t border-[#0B1420]/10 relative overflow-hidden">
      {/* Immersive UI Ambient Blurs */}
      <div className="ambient-glow-container">
        <div className="ambient-glow-espresso opacity-20" />
        <div className="ambient-radial-gold opacity-15" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">

        <div className="text-center mb-16 space-y-3">
          <div className="flex items-center justify-center gap-2.5">
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#B87D00] to-transparent" />
            <span className="text-[10px] uppercase tracking-[0.25em] text-[#B87D00] font-mono font-medium">
              Questions &amp; Support
            </span>
            <div className="w-8 h-[1px] bg-gradient-to-r from-transparent via-[#B87D00] to-transparent" />
          </div>
          <h2 className="text-4xl sm:text-5xl font-serif font-light text-[#0B1420] leading-tight">
            <span className="italic text-[#0B1420]/70">Frequently Asked</span>{' '}
            <span className="text-[#340E09] font-serif font-bold not-italic">Questions</span>
          </h2>
          <p className="text-[#0B1420]/60 text-sm sm:text-base font-light tracking-wide leading-relaxed">
            Everything about fabric, sizing, care, and delivery.
          </p>
        </div>

        <div className="space-y-3.5">
          {faqs.map((faq, idx) => {
            const isOpen = openIndex === idx;
            return (
              <div
                key={idx}
                className="rounded-[24px] sm:rounded-[28px] bg-[#0B1420]/[0.03] border border-[#0B1420]/10 hover:border-[#B87D00]/40 overflow-hidden transition-all duration-200"
              >
                <button
                  onClick={() => toggle(idx)}
                  className="w-full p-5 sm:p-6 text-left flex items-center justify-between gap-4 cursor-pointer hover:bg-[#0B1420]/[0.03]"
                >
                  <span className="text-sm sm:text-base font-serif font-medium text-[#0B1420]">
                    {faq.q}
                  </span>
                  <span className={`p-2 rounded-full bg-[#0B1420]/5 text-[#0B1420]/60 transition-transform duration-300 ${isOpen ? 'rotate-180 text-[#0B1420] bg-[#0B1420]/15 border border-[#0B1420]/30' : ''}`}>
                    <ChevronDown className="w-4 h-4" />
                  </span>
                </button>

                <AnimatePresence>
                  {isOpen && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: 'auto', opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25 }}
                    >
                      <div className="px-5 sm:px-6 pb-6 text-xs sm:text-sm text-[#0B1420]/70 leading-relaxed font-light border-t border-[#0B1420]/10 pt-4">
                        {faq.a}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })}
        </div>

      </div>
    </section>
  );
};
