"use client";
import Image from "next/image";
import { Leaf, Scan, User, Truck, ShoppingBag, LayoutGrid, Heart, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import Link from "next/link";
export default function Hero() {
  const router = useRouter();
  return (
    <>
      <section className="relative w-full overflow-hidden bg-[#F5EEDE]">
        {/* --- MAIN CONTENT --- */}
        <div className="relative z-10 w-full max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 pt-16 sm:pt-24 pb-16 sm:pb-20 grid grid-cols-1 lg:grid-cols-[1.15fr_1fr] gap-14 lg:gap-8 items-center">
          {/* LEFT: TEXT */}
          <div className="flex flex-col items-start text-left">
            {/* Eyebrow */}
            <div className="flex items-center gap-2.5 mb-7">
              <span className="w-[26px] h-px bg-[#7A2A28]" />
              <span className="font-mono text-xs sm:text-sm tracking-[0.18em] uppercase text-[#7A2A28]">
                Handcrafted Tote Co. — Estd. in Rajasthan
              </span>
            </div>

            {/* Headline — two lines, "Carried with pride." stays together */}
            <h1 className="font-display text-[#1B2A41] text-4xl leading-[1.15] sm:text-6xl lg:text-[3.75rem] mb-7">
              Stamped by hand.
              <br />
              <span className="whitespace-nowrap">Carried with pride.</span>
            </h1>

            {/* Subtitle */}
            <p className="text-[#1B2A41]/70 text-lg sm:text-xl max-w-[520px] mb-10 leading-relaxed">
              Small-batch tote bags in handwoven cotton, block-printed by
              artisan families across Rajasthan — made to hold your everyday,
              and a little bit of home.
            </p>

            {/* CTAs */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full sm:w-auto">
              <button onClick={() => router.push("/shop")} className="bg-[#C6941E] cursor-pointer hover:bg-[#A87A14] text-[#1B2A41] hover:text-[#FBF8F1] font-medium text-base sm:text-lg px-9 py-4 transition-colors duration-200 active:scale-[0.97]">
                Shop the Collection
              </button> 
              <Link
                href="/#craft"
                className="inline-flex items-center justify-center bg-transparent border border-[#1B2A41] hover:bg-[#1B2A41] text-[#1B2A41] hover:text-[#FBF8F1] font-medium text-base sm:text-lg px-9 py-4 transition-colors duration-200 active:scale-[0.97]"
              >
                See Our Craft
              </Link>
            </div>
          </div>

          {/* RIGHT: BRAND MARK VISUAL */}
          <div className="relative flex items-center justify-center min-h-[420px] sm:min-h-[520px] max-w-[440px] mx-auto w-full [perspective:1400px]">
            {/* soft ambient rings behind the mark */}
            <div className="absolute w-[92%] aspect-square rounded-full border border-dashed border-[#7A2A28]/25" />
            <div className="absolute w-[76%] aspect-square rounded-full bg-gradient-to-br from-[#C6941E]/15 via-[#F5EEDE] to-[#7A2A28]/10" />

            {/* tilted logo mark */}
            <div className="hero-tilt relative w-[58%] sm:w-[50%] aspect-square rounded-full overflow-hidden ring-1 ring-[#1B2A41]/10 [transform-style:preserve-3d]">
              <Image
                src="/images/DesiTotesLogo.png"
                alt="Desi Totes logo"
                fill
                sizes="(max-width: 768px) 50vw, 24vw"
                className="object-cover drop-shadow-[0_30px_40px_rgba(27,42,65,0.25)]"
                priority
              />
            </div>

            {/* soft ground shadow to sell the depth */}
            <div className="absolute bottom-[10%] w-[38%] h-4 rounded-full bg-[#1B2A41]/15 blur-md" />
          </div>
        </div>

        <style jsx global>{`
        .hero-tilt {
          transform: rotateY(-14deg) rotateX(6deg) rotateZ(-2deg);
          transition: transform 0.5s ease;
        }
        .hero-tilt:hover {
          transform: rotateY(-6deg) rotateX(3deg) rotateZ(-1deg) translateY(-6px);
        }
        @media (prefers-reduced-motion: reduce) {
          .hero-tilt {
            transform: none;
            transition: none;
          }
        }

        @keyframes story-rise {
          from { opacity: 0; transform: translateY(14px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .story-card {
          animation: story-rise 0.6s cubic-bezier(0.22, 1, 0.36, 1) both;
        }
        @media (prefers-reduced-motion: reduce) {
          .story-card {
            animation: none;
          }
        }
      `}</style>

        {/* --- DIVIDER --- */}
        <div className="relative z-10 max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          <div className="flex items-center gap-4">
            <span className="flex-1 h-px bg-[#1B2A41]/15" />
            <span className="w-3.5 h-3.5 rounded-full border border-[#7A2A28]/50 flex items-center justify-center">
              <span className="w-1.5 h-1.5 rounded-full bg-[#7A2A28]" />
            </span>
            <span className="flex-1 h-px bg-[#1B2A41]/15" />
          </div>
        </div>

        {/* --- USP STRIP --- */}
        <div className="relative z-10 bg-[#7A2A28] text-[#FBF8F1] mt-8">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12 py-6 sm:py-7 flex flex-wrap items-center justify-between gap-x-10 gap-y-4">
            <UspItem icon={<Leaf className="w-5 h-5" />} label="Handwoven Cotton" />
            <UspItem icon={<Scan className="w-5 h-5" />} label="Hand Block-Printed" />
            <UspItem icon={<User className="w-5 h-5" />} label="Fair-Wage Artisans" />
            <UspItem icon={<Truck className="w-5 h-5" />} label="Pan-India Delivery" />
          </div>
        </div>
      </section>

      {/* --- SHOP BY STORY --- */}
      <section className="relative w-full bg-[#F5EEDE] py-16 sm:py-24">
        <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
          {/* Eyebrow */}
          <div className="flex items-center gap-2.5 mb-5">
            <span className="w-[26px] h-px bg-[#7A2A28]" />
            <span className="font-mono text-xs sm:text-sm tracking-[0.18em] uppercase text-[#7A2A28]">
              Shop by Story
            </span>
          </div>

          {/* Heading */}
          <h2 className="font-display text-[#1B2A41] text-3xl sm:text-5xl mb-12 sm:mb-14">
            Every bag has its roots
          </h2>

          {/* Cards */}
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

                <h3 className="font-display text-[#1B2A41] text-xl sm:text-2xl mb-2">
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
    <div className="flex items-center gap-3 text-base sm:text-lg font-medium">
      <span className="text-[#C6941E]">{icon}</span>
      <span className="tracking-wide whitespace-nowrap">{label}</span>
    </div>
  );
}