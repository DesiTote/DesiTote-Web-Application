import React from 'react';
import { 
  Leaf, 
  ShieldCheck, 
  Sparkles, 
  UserCheck, 
  ArrowRight, 
  Heart, 
  Truck, 
  RefreshCw, 
  Lock, 
  Headphones,
  CheckCircle2
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default function Review() {
  const brandPillars = [
    {
      icon: <Leaf className="w-5 h-5 text-emerald-600" />,
      title: "SUSTAINABLE MATERIALS",
      desc: "Eco-friendly fabrics that care for the planet.",
      color: "bg-emerald-50 text-emerald-700"
    },
    {
      icon: <ShieldCheck className="w-5 h-5 text-rose-500" />,
      title: "BUILT TO LAST",
      desc: "Durable, high-quality craftsmanship.",
      color: "bg-rose-50 text-rose-700"
    },
    {
      icon: <Sparkles className="w-5 h-5 text-amber-500" />,
      title: "FUNCTIONAL DESIGN",
      desc: "Smart details for ultimate convenience.",
      color: "bg-amber-50 text-amber-700"
    },
    {
      icon: <UserCheck className="w-5 h-5 text-cyan-600" />,
      title: "ETHICAL PRODUCTION",
      desc: "Made responsibly for a better tomorrow.",
      color: "bg-cyan-50 text-cyan-700"
    }
  ];

  const reviews = [
    {
      name: "ALEXA R.",
      text: "The quality is incredible! My tote has become my everyday essential. Stylish, sturdy, and sustainable.",
      avatar: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?auto=format&fit=crop&q=80&w=120"
    },
    {
      name: "JESSICA M.",
      text: "Love the minimal design and how much it fits. Perfect for work, errands, and weekend getaways.",
      avatar: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?auto=format&fit=crop&q=80&w=120"
    },
    {
      name: "DAVID L.",
      text: "Finally a tote that looks good and does good. You can feel the quality in every detail.",
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120"
    }
  ];

  const valueProps = [
    { icon: <Truck className="w-5 h-5 text-slate-700" />, title: "FREE SHIPPING", desc: "On orders above ₹999" },
    { icon: <RefreshCw className="w-5 h-5 text-slate-700" />, title: "EASY RETURNS", desc: "Hassle-free returns within 7 days" },
    { icon: <Lock className="w-5 h-5 text-slate-700" />, title: "SECURE PAYMENTS", desc: "100% safe & encrypted transactions" },
    { icon: <Headphones className="w-5 h-5 text-slate-700" />, title: "SUPPORT 24/7", desc: "We're here to help, anytime" }
  ];

  return (
    <div className="w-full bg-[#FCFBF4] text-slate-800 antialiased overflow-hidden selection:bg-rose-100">
      
      {/* SECTION 1: HERO & BRAND PILLARS */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12 md:py-20 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
        
        {/* Left Informational Block */}
        <div className="lg:col-span-6 space-y-8">
          <div className="space-y-3">
            <Badge variant="outline" className="border-rose-200 bg-rose-50/50 text-rose-600 font-semibold tracking-wider text-[10px] px-2.5 py-0.5 rounded-full uppercase">
              Why Choose Desitotes
            </Badge>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 tracking-tight leading-[1.15]">
              Thoughtful by Design.<br />
              Made for <span className="relative inline-block text-rose-500 after:content-[''] after:absolute after:left-0 after:bottom-1 after:w-full after:h-[6px] after:bg-amber-300 after:-z-10 after:rounded-full">Real Life.</span>
            </h1>
            <p className="text-slate-600 max-w-md text-sm md:text-base leading-relaxed">
              We believe a tote bag should do more than carry your things—it should reflect your values and simplify your day.
            </p>
          </div>

          {/* Pillars Layout */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            {brandPillars.map((pillar, idx) => (
              <div key={idx} className="flex items-start gap-3">
                <div className={`p-2 rounded-xl shrink-0 ${pillar.color.split(' ')[0]}`}>
                  {pillar.icon}
                </div>
                <div className="space-y-0.5">
                  <h4 className="text-xs font-bold text-slate-900 tracking-wide uppercase">{pillar.title}</h4>
                  <p className="text-xs text-slate-500 leading-normal">{pillar.desc}</p>
                </div>
              </div>
            ))}
          </div>

          {/* Call to Actions using shadcn Buttons */}
          <div className="flex items-center gap-3 pt-2">
            <Button size="lg" className="rounded-full bg-rose-500 hover:bg-rose-600 text-white font-semibold px-6 shadow-sm group">
              EXPLORE OUR STORY 
              <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
            </Button>
            <Button size="lg" variant="outline" className="rounded-full p-3 bg-white hover:bg-slate-50 border-slate-200 text-slate-600 hover:text-rose-500 shadow-sm">
              <Heart className="w-5 h-5 fill-none" />
            </Button>
          </div>
        </div>

        {/* Right Product Showcase Grid */}
        <div className="lg:col-span-6 relative flex justify-center items-end bg-[#FEF3C7]/40 rounded-3xl p-6 sm:p-10 min-h-[420px] border border-amber-100/50">
          <div className="flex gap-4 items-end relative z-10 w-full justify-center max-w-md">
            {/* Teal Canvas */}
            <div className="w-1/3 bg-cyan-600 aspect-[3/4] rounded-2xl shadow-xl transform -rotate-3 hover:rotate-0 transition-all duration-300 flex items-center justify-center text-white font-bold text-xs border-2 border-white/20">Teal Bag</div>
            {/* Off-White Canvas */}
            <div className="w-1/3 bg-[#F5F2EB] aspect-[3/4] border border-slate-200 rounded-2xl shadow-2xl z-10 transform translate-y-[-16px] flex items-center justify-center text-slate-700 font-bold text-xs">Cream Bag</div>
            {/* Yellow Canvas */}
            <div className="w-1/3 bg-amber-400 aspect-[3/4] rounded-2xl shadow-xl transform rotate-3 hover:rotate-0 transition-all duration-300 flex items-center justify-center text-slate-800 font-bold text-xs border-2 border-white/20">Yellow Bag</div>
          </div>
          
          {/* Accent Flairs */}
          <span className="absolute top-6 right-8 text-emerald-600/20 text-5xl select-none pointer-events-none">🍃</span>
          <span className="absolute bottom-6 left-8 text-amber-500/20 text-5xl select-none pointer-events-none">✨</span>
        </div>
      </section>

      {/* SECTION 2: TESTIMONIALS STRIP */}
      <section className="bg-[#FFFDF9] border-y border-slate-100 py-16">
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            
            {/* Copy Block */}
            <div className="lg:col-span-4 space-y-4">
              <div className="space-y-1">
                <Badge variant="secondary" className="bg-cyan-50 text-cyan-700 border-none font-semibold text-[10px] tracking-wider px-2 py-0.5 rounded-full uppercase">
                  LOVED BY THOUSANDS
                </Badge>
                <h2 className="text-3xl md:text-4xl font-extrabold text-slate-900 tracking-tight leading-tight">
                  Real People.<br />
                  <span className="text-cyan-600">Real Reviews.</span>
                </h2>
              </div>
              
              <div className="flex items-center gap-2">
                <div className="flex text-amber-400 text-sm tracking-tighter">★★★★★</div>
                <span className="text-xs font-medium text-slate-500">4.9/5 from 2,500+ happy customers</span>
              </div>

              <Button size="sm" className="rounded-full bg-cyan-600 hover:bg-cyan-700 text-white font-semibold px-4 shadow-sm group">
                READ ALL REVIEWS 
                <ArrowRight className="w-3.5 h-3.5 ml-1.5 group-hover:translate-x-0.5 transition-transform" />
              </Button>
            </div>

            {/* Testimonial Cards via shadcn Card components */}
            <div className="lg:col-span-8 grid grid-cols-1 md:grid-cols-3 gap-6">
              {reviews.map((rev, idx) => (
                <Card key={idx} className="bg-white border-slate-100/80 rounded-2xl shadow-sm hover:shadow-md transition-all flex flex-col justify-between relative overflow-hidden group">
                  <span className="absolute top-2 right-4 text-cyan-100/60 text-6xl font-serif select-none pointer-events-none group-hover:text-cyan-200/50 transition-colors">“</span>
                  <CardContent className="pt-6 p-5 flex flex-col justify-between h-full space-y-6">
                    <div>
                      <div className="text-amber-400 text-xs mb-2.5">★★★★★</div>
                      <p className="text-slate-600 text-xs leading-relaxed font-normal">
                        {rev.text}
                      </p>
                    </div>
                    
                    <div className="flex items-center gap-3">
                      <img src={rev.avatar} alt={rev.name} className="w-8 h-8 rounded-full object-cover ring-2 ring-slate-100" />
                      <div>
                        <h5 className="text-xs font-bold text-slate-900 tracking-wide">{rev.name}</h5>
                        <span className="text-[10px] font-medium text-emerald-600 flex items-center gap-0.5 mt-0.5">
                          <CheckCircle2 className="w-3 h-3 fill-emerald-50" /> Verified Buyer
                        </span>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

          </div>
        </div>
      </section>

      {/* SECTION 3: UTILITY PROPS FOOTER */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 py-12">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 md:gap-4">
          {valueProps.map((prop, idx) => (
            <div key={idx} className="flex items-center md:items-start gap-3.5">
              <div className="p-2.5 bg-slate-100 rounded-xl shrink-0">
                {prop.icon}
              </div>
              <div className="space-y-0.5">
                <h5 className="text-xs font-bold text-slate-900 tracking-wide">{prop.title}</h5>
                <p className="text-xs text-slate-500 font-normal leading-tight">{prop.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

    </div>
  );
}

// "use client";

// import Link from "next/link";
// import { Star } from "lucide-react";
// import { useFeaturedReviews } from "@/hooks/useReview";

// export default function FeaturedReviewsSection() {
//     const { data, isLoading, isError } = useFeaturedReviews(3);

//     if (isError || (!isLoading && (!data || data.length === 0))) return null;

//     return (
//         <section className="relative w-full bg-[#F5EEDE] py-16 sm:py-24">
//             <div className="max-w-7xl mx-auto px-6 sm:px-8 lg:px-12">
//                 <div className="mb-2 flex items-center gap-2 text-xs font-semibold uppercase tracking-widest text-[#7A2A28]">
//                     <span className="h-px w-6 bg-[#7A2A28]" />
//                     From Our Customers
//                 </div>
//                 <h2 className="mb-10 font-serif text-4xl text-[#1B2A41]">Loved by Everyday Carriers</h2>

//                 <div className="grid gap-6 sm:grid-cols-3">
//                     {isLoading || !data
//                         ? Array.from({ length: 3 }).map((_, i) => (
//                               <div key={i} className="h-40 animate-pulse rounded-2xl bg-[#FBF8F1]" />
//                           ))
//                         : data.map((review) => (
//                               <Link
//                                   key={review.id}
//                                   href={review.product.slug ? `/shop/${review.product.slug}` : "#"}
//                                   className="block rounded-2xl border border-[#1B2A41]/10 bg-[#FBF8F1] p-6 hover:border-[#C6941E]/60 transition-colors"
//                               >
//                                   <div className="flex mb-3">
//                                       {[1, 2, 3, 4, 5].map((star) => (
//                                           <Star
//                                               key={star}
//                                               className={`h-4 w-4 ${
//                                                   star <= review.rating
//                                                       ? "fill-[#C6941E] text-[#C6941E]"
//                                                       : "fill-transparent text-[#1B2A41]/20"
//                                               }`}
//                                           />
//                                       ))}
//                                   </div>

//                                   {review.title && (
//                                       <p className="font-bold text-sm text-[#1B2A41] mb-1">{review.title}</p>
//                                   )}
//                                   <p className="text-sm text-[#1B2A41]/70 leading-relaxed line-clamp-3">
//                                       {review.comment}
//                                   </p>

//                                   <p className="mt-4 text-xs font-semibold text-[#1B2A41]/50">
//                                       {review.reviewerName} · on {review.product.title}
//                                   </p>
//                               </Link>
//                           ))}
//                 </div>
//             </div>
//         </section>
//     );
// }