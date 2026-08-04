"use client";

import Image from "next/image";
import { Leaf, ShieldCheck, ShoppingBag, Heart, ArrowRight } from "lucide-react";

export default function Trust() {
  const features = [
    {
      icon: <Leaf className="text-[#86BC42]" size={32} strokeWidth={1.5} />,
      title: "SUSTAINABLE MATERIALS",
      desc: "Eco-friendly fabrics that care for the planet.",
    },
    {
      icon: <ShieldCheck className="text-[#F4B400]" size={32} strokeWidth={1.5} />,
      title: "BUILT TO LAST",
      desc: "Durable, high-quality craftsmanship.",
    },
    {
      icon: <ShoppingBag className="text-[#E94E77]" size={32} strokeWidth={1.5} />,
      title: "TIMELESS DESIGN",
      desc: "Minimal, versatile and always in style.",
    },
    {
      icon: <Heart className="text-[#00A896]" size={32} strokeWidth={1.5} />,
      title: "MADE RESPONSIBLY",
      desc: "Ethical production for a better tomorrow.",
    },
  ];

  return (
    <section className="w-full relative overflow-hidden ">

      {/* --- SEAMLESS CONNECTION TO HERO --- */}
      {/* This creates the bottom half of the yellow stage seen in the Hero */}

      {/* --- BACKGROUND BLOBS (To match the Hero theme) --- */}
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] bg-[#FF407D] rounded-full opacity-10 blur-[100px]" />
      <div className="absolute bottom-[10%] left-[-5%] w-[30%] h-[30%] bg-[#00A896] rounded-full opacity-10 blur-[100px]" />

      <div className="relative z-10 w-full px-6 md:px-16 lg:px-24 pt-32 pb-20">

        {/* --- TOP FEATURES BAR --- */}
        {/* We keep this clean and white-backed to match the image precisely */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 mb-24 bg-white/60 backdrop-blur-md p-10 rounded-[40px] border border-white/50 shadow-sm">
          {features.map((item, idx) => (
            <div key={idx} className="flex items-start gap-5">
              <div className="shrink-0">{item.icon}</div>
              <div className="flex flex-col">
                <h3 className="text-[#1D264F] font-[900] text-sm tracking-wider mb-2">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-xs leading-relaxed max-w-[180px]">
                  {item.desc}
                </p>
              </div>
            </div>
          ))}
        </div>

        {/* --- LARGE CATEGORY CARDS --- */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-24">
          {[
            {
              tag: "FOR EVERY DAY",
              title: "Made For Your Every Move.",
              bg: "bg-[#FDE2E4]",
              img: "/images/Bag1.jpeg",
            },
            {
              tag: "SPACIOUS & PRACTICAL",
              title: "Carry More, Worry Less.",
              bg: "bg-[#FFF1C1]",
              img: "/images/Bag2.jpeg",
            },
            {
              tag: "EXPRESS YOUR STYLE",
              title: "Simple. Stylish. Unapologetically You.",
              bg: "bg-[#C4F1F1]",
              img: "/images/Bag1.jpeg",
            },
          ].map((cat, idx) => (
            <div
              key={idx}
              className={`${cat.bg} rounded-[50px] overflow-hidden flex flex-col min-h-[580px] relative group cursor-pointer shadow-lg hover:shadow-2xl transition-all duration-500 border-4 border-white/30`}
            >
              <div className="p-12 z-10">
                <p className="text-[11px] font-[900] tracking-[0.25em] text-[#1D264F]/60 mb-5">
                  {cat.tag}
                </p>
                <h2 className="text-4xl md:text-5xl font-serif font-medium text-[#1D264F] leading-[1.1] max-w-[220px] mb-8">
                  {cat.title}
                </h2>
                <button className="flex items-center gap-2 text-xs font-[900] tracking-widest text-[#1D264F] border-b-2 border-[#1D264F] pb-1 hover:gap-4 transition-all uppercase">
                  SHOP NOW <ArrowRight size={16} />
                </button>
              </div>
              <div className="mt-auto h-[300px] relative">
                <img src={cat.img} alt="" className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000" />
              </div>
            </div>
          ))}
        </div>

        {/* --- BOTTOM COLLECTION HEADER --- */}
        <div className="flex flex-col md:flex-row items-end justify-between mb-16">
          <div className="max-w-xl">
            <p className="text-[#FF407D] font-[900] text-sm tracking-[0.2em] mb-6 uppercase">
              Shop Our Collections
            </p>
            <h2 className="text-[#1D264F] text-5xl md:text-7xl font-semibold italic leading-[0.95] tracking-tight">
              Find The Tote <br />
              That <span className="text-[#00A896]">Fits You.</span>
            </h2>
          </div>
          <button className="mt-10 md:mt-0 bg-[#FF407D] hover:bg-[#e6356d] text-white px-12 py-6 rounded-full font-[900] text-sm tracking-widest transition-all shadow-[0_10px_25px_rgba(255,64,125,0.4)] hover:-translate-y-2 active:scale-95 uppercase">
            VIEW ALL COLLECTIONS →
          </button>
        </div>

        {/* --- MINI COLLECTION GRID --- */}
        {/* --- MINI COLLECTION GRID --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {[
            {
              name: "CLASSIC TOTES",
              color: "#00A896",
              desc: "Timeless designs for everyday essentials.",
              src: "/images/Bag1.jpeg" // Replace with your actual image path
            },
            {
              name: "WORK TOTES",
              color: "#F4B400",
              desc: "Functional and polished for your workday.",
              src: "/images/Bag2.jpeg"
            },
            {
              name: "WEEKEND TOTES",
              color: "#E94E77",
              desc: "Roomy and relaxed for your weekend getaways.",
              src: "/images/Bag1.jpeg"
            },
            {
              name: "MINI TOTES",
              color: "#1D264F",
              desc: "Small in size, big on convenience.",
              src: "/images/Bag2.jpeg"
            },
          ].map((item, idx) => (
            <div key={idx} className="group cursor-pointer">

              {/* --- IMAGE TAG IS HERE --- */}
              <div className="bg-white rounded-[40px] aspect-square mb-8 overflow-hidden relative border-4 border-white shadow-md group-hover:shadow-xl transition-all">
                <Image
                  src={item.src}
                  alt={item.name}
                  fill
                  className="object-cover group-hover:scale-110 transition-transform duration-700"
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
                />
              </div>

              <div className="flex items-start gap-5">
                {/* Icon Box */}
                <div
                  style={{ backgroundColor: item.color }}
                  className="w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-lg"
                >
                  <ShoppingBag size={22} className="text-white" />
                </div>

                {/* Text Content */}
                <div>
                  <h4 className="text-[#1D264F] font-[900] text-base mb-2 uppercase tracking-tight">
                    {item.name}
                  </h4>
                  <p className="text-gray-500 text-xs leading-relaxed mb-4">
                    {item.desc}
                  </p>
                  <button className="text-[11px] font-[900] text-[#00A896] tracking-[0.1em] flex items-center gap-1 group-hover:gap-3 transition-all uppercase">
                    SHOP NOW →
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}