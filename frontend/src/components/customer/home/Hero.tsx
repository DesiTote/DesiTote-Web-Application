"use client";

import Image from "next/image";
import { Leaf, Scan, User, Truck, ShoppingBag, LayoutGrid, Heart, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Hero() {
  const router = useRouter();

  return (
    <>
      <section className="relative w-full overflow-hidden bg-[#F5EEDE] min-h-[760px] sm:min-h-[820px] lg:min-h-[calc(100vh-108px)] lg:h-[calc(100vh-108px)] flex flex-col justify-start lg:justify-center">
        {/* --- MOBILE BACKGROUND IMAGE (9:16 vertical layout with tote bag anchored at bottom) --- */}
        <div className="absolute inset-0 z-0 block lg:hidden pointer-events-none">
          <Image
            src="/images/finalBgMobile.jpg"
            alt="DesiTote Artisanal Handcrafted Collection"
            fill
            priority
            quality={90}
            sizes="100vw"
            className="object-cover object-bottom"
          />
        </div>

        {/* --- DESKTOP HERO BACKGROUND IMAGE --- */}
        <div className="absolute inset-0 z-0 hidden lg:block pointer-events-none">
          <Image
            src="/images/finalBg.png"
            alt="DesiTote Artisanal Handcrafted Collection"
            fill
            priority
            quality={95}
            sizes="100vw"
            className="object-cover object-[right_bottom]"
          />
        </div>

        {/* --- OVERLAID LEFT TEXT & CTAS CONTENT --- */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-5 sm:px-8 lg:px-12 pt-5 sm:pt-8 lg:py-8 flex flex-col justify-start lg:justify-center h-full">
          <div className="max-w-xl lg:max-w-2xl flex flex-col items-start text-left">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 sm:gap-3 mb-3 sm:mb-4 lg:mb-5">
              <span className="w-6 sm:w-8 h-px bg-[#7A2A28]" />
              <span className="font-mono text-xs sm:text-sm tracking-[0.18em] uppercase font-bold text-[#7A2A28]">
                Handcrafted Tote Co. — Estd. in Maharashtra
              </span>
              <span className="w-8 sm:w-16 h-px bg-[#7A2A28]/30 hidden xs:block" />
            </div>

            {/* Headline with Gold Underline Highlight - Bold & Impactful like Hydr8 */}
            <h1 className="font-display text-[#1B2A41] text-[2.75rem] xs:text-[3.2rem] sm:text-5xl lg:text-[3.8rem] xl:text-[4.2rem] font-bold leading-[1.08] tracking-tight mb-3.5 sm:mb-5 [text-shadow:_0_2px_8px_rgba(27,42,65,0.1)]">
              Stamped by hand.
              <br />
              <span className="relative inline-block whitespace-nowrap z-0">
                Carried with pride.
                {/* Soft Accent Highlight Line */}
                <span className="absolute bottom-1 sm:bottom-2 left-0 w-full h-[6px] sm:h-[8px] bg-[#C6941E]/40 rounded-full -z-10" />
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#1B2A41]/80 text-sm sm:text-base lg:text-xl max-w-[360px] sm:max-w-[480px] mb-5 sm:mb-7 lg:mb-9 leading-relaxed">
              Small-batch tote bags in handwoven cotton, hand printed with love, to hold your everyday essentials.
            </p>

            {/* CTAs */}
            <div className="flex flex-row flex-wrap items-center gap-3 sm:gap-4 w-auto mb-5 sm:mb-7">
              <button
                onClick={() => router.push("/shop")}
                className="group inline-flex items-center justify-between gap-3 sm:gap-4 bg-[#C6941E] hover:bg-[#A87A14] text-[#1B2A41] font-bold text-sm sm:text-base lg:text-lg pl-6 sm:pl-8 pr-2 sm:pr-2.5 py-2.5 sm:py-3 rounded-full shadow-md hover:shadow-lg transition-all duration-300 active:scale-[0.98] cursor-pointer"
              >
                <span>Shop Now</span>
                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1B2A41]/10 flex items-center justify-center text-[#1B2A41] transition-all duration-300 group-hover:bg-[#1B2A41] group-hover:text-[#FBF8F1]">
                  <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </button>

              <Link
                href="/#craft"
                className="group inline-flex items-center justify-between gap-3 sm:gap-4 bg-[#FBF8F1]/85 backdrop-blur-sm border border-[#1B2A41]/25 hover:border-[#1B2A41] text-[#1B2A41] font-bold text-sm sm:text-base lg:text-lg pl-6 sm:pl-8 pr-2 sm:pr-2.5 py-2.5 sm:py-3 rounded-full transition-all duration-300 active:scale-[0.98] cursor-pointer shadow-xs"
              >
                <span>See Our Collection</span>
                <span className="w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-[#1B2A41]/10 flex items-center justify-center text-[#1B2A41] transition-all duration-300 group-hover:bg-[#1B2A41] group-hover:text-[#FBF8F1]">
                  <ArrowRight className="w-4 h-4 sm:w-4.5 sm:h-4.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                </span>
              </Link>
            </div>

            {/* USP BADGES (Hydr8 Clean Inline Style) */}
            <div className="flex flex-row flex-wrap items-center gap-3.5 sm:gap-6 pt-1">
              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#7A2A28]/10 text-[#7A2A28] flex items-center justify-center shrink-0">
                  <Leaf className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#1B2A41]/85 whitespace-nowrap">
                  Handwoven Cotton
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#7A2A28]/10 text-[#7A2A28] flex items-center justify-center shrink-0">
                  <Scan className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#1B2A41]/85 whitespace-nowrap">
                  Hand Block-Printed
                </span>
              </div>

              <div className="flex items-center gap-2">
                <span className="w-6 h-6 rounded-full bg-[#7A2A28]/10 text-[#7A2A28] flex items-center justify-center shrink-0">
                  <User className="w-3.5 h-3.5" />
                </span>
                <span className="text-xs sm:text-sm font-semibold text-[#1B2A41]/85 whitespace-nowrap">
                  Fair-Wage Artisans
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- VALUE PROPOSITION BANNER --- */}
      <section className="relative w-full bg-[#F5EEDE]">
        {/* Decorative Divider with Center Dot */}
        <div className="relative w-full max-w-5xl mx-auto px-6 py-6 sm:py-7 flex items-center justify-center">
          <div className="h-px flex-1 bg-gradient-to-r from-transparent via-[#7A2A28]/25 to-[#7A2A28]/35" />
          <div className="mx-4 sm:mx-6 w-5 h-5 sm:w-6 sm:h-6 rounded-full border border-[#7A2A28]/40 bg-[#F5EEDE] flex items-center justify-center shadow-xs">
            <span className="w-1.5 h-1.5 rounded-full bg-[#7A2A28]" />
          </div>
          <div className="h-px flex-1 bg-gradient-to-l from-transparent via-[#7A2A28]/25 to-[#7A2A28]/35" />
        </div>

        {/* Maroon Feature Ribbon */}
        <div className="w-full bg-[#7A2A28] py-4 sm:py-5 shadow-xs">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 sm:gap-8 lg:gap-12 items-center justify-items-center">
              {/* Handwoven Cotton */}
              <div className="flex items-center gap-2.5 sm:gap-3 text-[#FDFBF7]">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-[#DCAE58] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4.5 19C5.5 14 10 5 12 5s6.5 9 7.5 14" />
                </svg>
                <span className="text-xs sm:text-sm lg:text-[15px] font-medium tracking-wide whitespace-nowrap">
                  Handwoven Cotton
                </span>
              </div>

              {/* Hand Block-Printed */}
              <div className="flex items-center gap-2.5 sm:gap-3 text-[#FDFBF7]">
                <svg
                  className="w-5 h-5 sm:w-6 sm:h-6 text-[#DCAE58] shrink-0"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.75"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <rect x="3.5" y="3.5" width="17" height="17" rx="2" />
                  <circle cx="8" cy="8" r="1.2" fill="currentColor" stroke="none" />
                  <circle cx="8" cy="16" r="1.2" fill="currentColor" stroke="none" />
                </svg>
                <span className="text-xs sm:text-sm lg:text-[15px] font-medium tracking-wide whitespace-nowrap">
                  Hand Block-Printed
                </span>
              </div>

              {/* Fair-Wage Artisans */}
              <div className="flex items-center gap-2.5 sm:gap-3 text-[#FDFBF7]">
                <User className="w-5 h-5 sm:w-6 sm:h-6 text-[#DCAE58] shrink-0" strokeWidth={1.75} />
                <span className="text-xs sm:text-sm lg:text-[15px] font-medium tracking-wide whitespace-nowrap">
                  Fair-Wage Artisans
                </span>
              </div>

              {/* Pan-India Delivery */}
              <div className="flex items-center gap-2.5 sm:gap-3 text-[#FDFBF7]">
                <Truck className="w-5 h-5 sm:w-6 sm:h-6 text-[#DCAE58] shrink-0" strokeWidth={1.75} />
                <span className="text-xs sm:text-sm lg:text-[15px] font-medium tracking-wide whitespace-nowrap">
                  Pan-India Delivery
                </span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* --- SHOP BY STORY --- */}
      <section className="relative w-full bg-[#F5EEDE] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-[26px] h-px bg-[#7A2A28]" />
            <span className="font-mono text-xs sm:text-sm tracking-[0.18em] uppercase text-[#7A2A28] [text-shadow:_0_1px_2px_rgba(122,42,40,0.15)]">
              Shop by Story
            </span>
          </div>

          <h2 className="font-display text-[#1B2A41] text-3xl sm:text-5xl mb-12 sm:mb-14 [text-shadow:_0_2px_6px_rgba(27,42,65,0.1)]">
            Every bag has its roots
          </h2>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 sm:gap-6">
            {STORIES.map((story, i) => (
              <button
                key={story.title}
                onClick={() => router.push(story.href)}
                type="button"
                className="story-card group text-left bg-[#FBF8F1] border border-[#1B2A41]/10 p-6 sm:p-7 transition-all duration-300 hover:border-[#C6941E]/60 hover:-translate-y-1.5 hover:shadow-[0_18px_40px_-16px_rgba(27,42,65,0.25)] cursor-pointer"
                style={{ animationDelay: `${i * 0.1}s` }}
              >
                <div className="w-14 h-14 rounded-full bg-[#F5EEDE] flex items-center justify-center mb-6 transition-colors duration-300 group-hover:bg-[#C6941E]/20">
                  <story.icon className="w-6 h-6 text-[#1B2A41] transition-transform duration-300 group-hover:scale-110" strokeWidth={1.75} />
                </div>

                <h3 className="font-display text-[#1B2A41] text-xl sm:text-2xl mb-2 [text-shadow:_0_1px_2px_rgba(27,42,65,0.08)]">
                  {story.title}
                </h3>
                <p className="text-[#1B2A41]/60 text-sm leading-relaxed mb-6 min-h-[2.5rem]">
                  {story.description}
                </p>

                <span className="inline-flex items-center gap-1.5 text-[#7A2A28] font-mono text-xs tracking-[0.12em] uppercase font-bold">
                  Explore
                  <ArrowRight className="w-3.5 h-3.5 transition-transform duration-300 group-hover:translate-x-1" />
                </span>
              </button>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}

const STORIES = [
  {
    title: "Everyday Totes",
    description: "Light, sturdy, built for the daily run.",
    icon: ShoppingBag,
    href: "/shop",
  },
  {
    title: "Block-Print Edition",
    description: "Hand-stamped patterns, no two alike.",
    icon: LayoutGrid,
    href: "/shop",
  },
  {
    title: "Jute & Raw Cotton",
    description: "Undyed, unbleached, and honest.",
    icon: Leaf,
    href: "/shop",
  },
  {
    title: "Wedding & Gifting",
    description: "Festive totes for favors guests keep.",
    icon: Heart,
    href: "/shop",
  },
];

function UspItem({ icon, label }: { icon: React.ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-3 text-base sm:text-lg font-medium [text-shadow:_0_1px_2px_rgba(0,0,0,0.15)]">
      <span className="text-[#C6941E]">{icon}</span>
      <span className="tracking-wide whitespace-nowrap">{label}</span>
    </div>
  );
}