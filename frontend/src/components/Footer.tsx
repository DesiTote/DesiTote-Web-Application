import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Send, CheckCircle2, MessageCircle, Heart, Shield, Sparkles } from 'lucide-react';
import { playPop } from '../utils/audio';
import { DesiLogo } from './DesiLogo';

export const Footer: React.FC = () => {
  const [email, setEmail] = useState('');
  const [subscribed, setSubscribed] = useState(false);

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email.trim()) return;
    playPop();
    setSubscribed(true);
    setEmail('');
  };

  return (
    <footer className="bg-[#030304] border-t border-white/10 pt-20 pb-12 text-white/50 text-xs relative overflow-hidden">
      {/* Immersive UI Ambient Blurs */}
      <div className="ambient-glow-container">
        <div className="ambient-glow-espresso opacity-15" />
        <div className="ambient-radial-gold opacity-10" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16 relative z-10">
        
        {/* Newsletter & Brand Highlight Banner */}
        <div className="rounded-[36px] bg-white/[0.02] p-8 sm:p-12 border border-white/10 flex flex-col lg:flex-row items-center justify-between gap-8 backdrop-blur-2xl shadow-2xl">
          <div className="space-y-2.5 text-center lg:text-left max-w-md">
            <div className="flex items-center justify-center lg:justify-start gap-2.5">
              <div className="w-6 h-[1px] bg-[#0B1420]" />
              <span className="text-[10px] uppercase tracking-[0.25em] text-[#B87D00] font-mono font-medium">
                The Atelier Circle
              </span>
            </div>
            <h3 className="text-2xl sm:text-3xl font-serif font-light text-white leading-tight">
              <span className="italic text-white/90">Get</span>{' '}
              <span className="text-[#B87D00] font-serif font-bold not-italic">10% Off Your First Order</span>
            </h3>
            <p className="text-white/50 text-xs sm:text-sm font-light leading-relaxed">
              Plus first access to new print drops.
            </p>
          </div>

          <div className="w-full max-w-md">
            {subscribed ? (
              <motion.div 
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="p-4 rounded-full bg-[#B87D00]/15 border border-[#B87D00]/40 text-[#B87D00] flex items-center justify-center gap-3 shadow-lg"
              >
                <CheckCircle2 className="w-5 h-5 text-[#B87D00] shrink-0" />
                <span className="font-mono text-xs uppercase tracking-wider">You're in! Watch your inbox for new print drops.</span>
              </motion.div>
            ) : (
              <form onSubmit={handleSubscribe} className="flex gap-2">
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email address"
                  className="flex-1 px-5 py-3.5 rounded-full bg-white/[0.04] border border-white/10 text-white placeholder-white/30 focus:outline-none focus:border-[#B87D00] text-xs font-light"
                />
                <motion.button
                  whileHover={{ scale: 1.04, y: -1 }}
                  whileTap={{ scale: 0.96 }}
                  type="submit"
                  className="px-6 py-3.5 rounded-full bg-gradient-to-r from-[#0B1420] to-[#340E09] hover:from-[#05090F] hover:to-[#4a1a10] text-[#F7F2E8] font-semibold text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-[#B87D00]/15 shrink-0 flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Join</span>
                  <Send className="w-3 h-3" />
                </motion.button>
              </form>
            )}
          </div>
        </div>

        {/* Multi-column navigation links */}
        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-8 pt-4">
          
          {/* Brand Info */}
          <div className="col-span-2 space-y-4">
            <DesiLogo size="md" variant="horizontal" dark />
            <p className="text-xs text-white/50 max-w-sm leading-relaxed font-light">
              Handmade cotton canvas tote bags — plain and printed, made to order. Reusable, washable, and proudly Desi.
            </p>
            <div className="flex items-center gap-3 pt-1">
              <a
                href="https://wa.me/"
                target="_blank"
                rel="noreferrer"
                className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/[0.03] hover:bg-white/[0.08] text-white/70 hover:text-white border border-white/10 transition-colors text-[10px] font-mono uppercase tracking-wider"
              >
                <MessageCircle className="w-3.5 h-3.5 text-emerald-400" />
                <span>Chat on WhatsApp</span>
              </a>
            </div>
          </div>

          {/* Shop */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-[#B87D00]">Shop</h4>
            <ul className="space-y-2.5 text-white/50 font-light">
              <li><a href="#catalog" className="hover:text-white transition-colors">Plain Canvas Totes</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Printed Designs</a></li>
              <li><a href="#bestseller-spotlight" className="hover:text-white transition-colors">Bestsellers</a></li>
            </ul>
          </div>

          {/* Craft & Integrity */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-[#B87D00]">About</h4>
            <ul className="space-y-2.5 text-white/50 font-light">
              <li><a href="#gallery" className="hover:text-white transition-colors">320 GSM Cotton Canvas</a></li>
              <li><a href="#gallery" className="hover:text-white transition-colors">Reusable &amp; Plastic-Free</a></li>
              <li><a href="#reviews" className="hover:text-white transition-colors">Customer Reviews</a></li>
              <li><a href="#faq" className="hover:text-white transition-colors">FAQs</a></li>
            </ul>
          </div>

          {/* Support */}
          <div className="space-y-3">
            <h4 className="text-[10px] font-mono font-medium uppercase tracking-[0.2em] text-[#B87D00]">Support</h4>
            <ul className="space-y-2.5 text-white/50 font-light">
              <li><span className="hover:text-white cursor-pointer">Order Tracking</span></li>
              <li><span className="hover:text-white cursor-pointer">Washing &amp; Care</span></li>
              <li><span className="hover:text-white cursor-pointer">Bulk &amp; Custom Orders</span></li>
              <li><span className="hover:text-white cursor-pointer">contact@desitotes.example</span></li>
            </ul>
          </div>

        </div>

        {/* Bottom Legal & Craftsmanship Badge */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row items-center justify-between gap-4 text-[10px] font-mono text-white/40 uppercase tracking-wider">
          <div className="flex items-center gap-1.5">
            <span>Handmade with pride in India.</span>
          </div>
          <div className="flex gap-4">
            <span className="hover:text-white cursor-pointer">Privacy Protocol</span>
            <span>•</span>
            <span className="hover:text-white cursor-pointer">Terms of Service</span>
            <span>•</span>
            <span>© {new Date().getFullYear()} Desi Totes.</span>
          </div>
        </div>

      </div>
    </footer>
  );
};
