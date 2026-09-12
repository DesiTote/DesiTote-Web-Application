import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ShoppingBag, Volume2, VolumeX, Menu, X, Leaf, User, LogOut, Package } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { playPop, toggleSound, isSoundActive } from '../utils/audio';
import { DesiLogo } from './DesiLogo';
import { BackendUser } from '../lib/apiTypes';

interface NavbarProps {
  cartCount: number;
  onOpenCart: () => void;
  currency: 'INR' | 'USD';
  onToggleCurrency: () => void;
  onNavigate: (sectionId: string) => void;
  user: BackendUser | null;
  onOpenAuth: () => void;
  onLogout: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  cartCount,
  onOpenCart,
  currency,
  onToggleCurrency,
  onNavigate,
  user,
  onOpenAuth,
  onLogout,
}) => {
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [accountMenuOpen, setAccountMenuOpen] = useState(false);
  const [soundOn, setSoundOn] = useState(isSoundActive());
  const [hoveredNav, setHoveredNav] = useState<string | null>(null);
  const [activeSection, setActiveSection] = useState<string>('hero');

  const handleSoundToggle = () => {
    const next = toggleSound();
    setSoundOn(next);
    if (next) playPop();
  };

  const navItems = [
    { label: 'Bestsellers', target: 'bestseller-spotlight' },
    { label: 'Shop All', target: 'catalog' },
    { label: 'Printed Designs', target: 'gallery' },
    { label: 'Reviews', target: 'reviews' },
    { label: 'FAQs', target: 'faq' },
  ];

  const handleNavClick = (target: string) => {
    playPop();
    setActiveSection(target);
    onNavigate(target);
    setMobileMenuOpen(false);
  };

  return (
    <>
      {/* Top Immersive UI Announcement Strip */}
      <div className="bg-[#0B1420] text-[#F7F2E8] py-2.5 px-4 text-[12px] sm:text-[13px] tracking-[0.04em] uppercase font-semibold border-b border-[#F7F2E8]/20">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 mx-auto sm:mx-0">
            <span className="w-2 h-2 rounded-full bg-[#ef4444] animate-pulse shrink-0"></span>
            <span>Handmade cotton canvas totes, made to order in India</span>
            <span className="hidden md:inline text-[#F7F2E8]/40">|</span>
            <span className="hidden md:inline text-[#F7F2E8]/90">Free shipping over ₹999</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-[11px] uppercase tracking-[0.1em] text-[#F7F2E8]/85 font-medium">
            <span className="flex items-center gap-1"><Leaf className="w-3.5 h-3.5 text-[#F7F2E8]" /> 100% Cotton Canvas</span>
            <span>•</span>
            <span>Free Shipping Over ₹999</span>
          </div>
        </div>
      </div>

      {/* Main Sticky Navbar */}
      <header className="sticky top-0 z-40 bg-[#F7F2E8]/98 backdrop-blur-2xl border-b border-[#0B1420]/15 shadow-[0_1px_0_rgba(11,20,32,0.04)] transition-all duration-300">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center gap-3 xl:gap-6">
          
          {/* Logo & Brand Identity (Client Official Brandmark).
              Allowed to shrink (and clip) rather than shrink-0 — the action
              buttons opposite are fixed width, so a rigid logo is what pushed
              the header past the edge of the screen on phones. */}
          <motion.div
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNavClick('hero')}
            className="cursor-pointer py-1 min-w-0 overflow-hidden"
          >
            <DesiLogo size="md" variant="horizontal" />
          </motion.div>

          {/* Desktop Nav Links with smooth micro-interaction indicator */}
          <div className="hidden lg:block flex-1 min-w-0">
            <nav 
              onMouseLeave={() => setHoveredNav(null)}
              className="scrollbar-hide flex items-center gap-0.5 px-2 py-1.5 rounded-full bg-[#0B1420]/[0.04] border border-[#0B1420]/15 overflow-x-auto max-w-full w-max mx-auto"
            >
              {navItems.map((item) => {
                const isHovered = hoveredNav === item.target;
                const isActive = activeSection === item.target;

                return (
                  <button
                    key={item.target}
                    onClick={() => handleNavClick(item.target)}
                    onMouseEnter={() => setHoveredNav(item.target)}
                    className="font-display relative px-2.5 xl:px-3 py-2 text-[12.5px] xl:text-[13px] tracking-[0em] font-semibold transition-colors flex items-center gap-1.5 cursor-pointer rounded-full whitespace-nowrap shrink-0"
                  >
                    {/* Floating indicator background pill */}
                    {(isHovered || isActive) && (
                      <motion.div
                        layoutId="navbar-indicator-pill"
                        className={`absolute inset-0 rounded-full ${
                          isActive 
                            ? 'bg-[#0B1420] border border-[#0B1420]' 
                            : 'bg-[#0B1420]/8 border border-[#0B1420]/15'
                        }`}
                        transition={{ type: 'spring', stiffness: 450, damping: 30 }}
                      />
                    )}

                    <span className={`relative z-10 transition-colors ${
                      isActive ? 'text-[#F7F2E8]' : isHovered ? 'text-[#0B1420]' : 'text-[#0B1420]/80'
                    }`}>
                      {item.label}
                    </span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* Right Action Tools */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 ml-auto lg:ml-0">
            {/* Currency Toggle with animated micro-interaction */}
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => {
                playPop();
                onToggleCurrency();
              }}
              title="Toggle Currency"
              className="hidden sm:flex px-3.5 py-1.5 rounded-full border border-[#0B1420]/25 bg-[#0B1420]/5 hover:bg-[#0B1420]/10 text-[12px] font-mono tracking-wide text-[#0B1420]/80 hover:text-[#0B1420] transition-all items-center gap-1 cursor-pointer"
            >
              <span className={currency === 'INR' ? 'text-[#0B1420] font-bold' : 'text-[#0B1420]/50'}>₹ INR</span>
              <span className="text-[#0B1420]/40">/</span>
              <span className={currency === 'USD' ? 'text-[#0B1420] font-bold' : 'text-[#0B1420]/50'}>$ USD</span>
            </motion.button>

            {/* Sound Effects Toggle */}
            <motion.button
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.92 }}
              onClick={handleSoundToggle}
              title={soundOn ? 'Mute micro-haptics' : 'Enable micro-haptics'}
              className="hidden md:flex p-2 rounded-full border border-[#0B1420]/25 bg-[#0B1420]/5 hover:bg-[#0B1420]/10 text-[#0B1420]/70 hover:text-[#0B1420] transition-colors cursor-pointer"
            >
              {soundOn ? <Volume2 className="w-3.5 h-3.5 text-[#0B1420]" /> : <VolumeX className="w-3.5 h-3.5 text-[#0B1420]/45" />}
            </motion.button>

            {/* Account Menu */}
            <div className="relative">
              <motion.button
                whileHover={{ scale: 1.08 }}
                whileTap={{ scale: 0.92 }}
                onClick={() => {
                  if (!user) {
                    playPop();
                    onOpenAuth();
                    return;
                  }
                  setAccountMenuOpen((v) => !v);
                }}
                title={user ? user.fullName : 'Log in'}
                className="p-2 rounded-full border border-[#0B1420]/25 bg-[#0B1420]/5 hover:bg-[#0B1420]/10 text-[#0B1420]/70 hover:text-[#0B1420] transition-colors cursor-pointer"
              >
                <User className="w-3.5 h-3.5" />
              </motion.button>

              <AnimatePresence>
                {accountMenuOpen && user && (
                  <motion.div
                    initial={{ opacity: 0, y: -6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                    className="absolute right-0 top-full mt-2 w-52 rounded-2xl bg-[#F7F2E8] border border-[#0B1420]/15 shadow-xl overflow-hidden z-50"
                  >
                    <div className="px-4 py-3 border-b border-[#0B1420]/10">
                      <p className="text-xs font-semibold text-[#0B1420] truncate">{user.fullName}</p>
                      <p className="text-[10px] text-[#0B1420]/50 truncate">{user.email}</p>
                    </div>
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        navigate('/orders');
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[#0B1420]/80 hover:bg-[#0B1420]/5 cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5" /> My Orders
                    </button>
                    {user.role === 'ADMIN' && (
                      <button
                        onClick={() => {
                          setAccountMenuOpen(false);
                          navigate('/admin');
                        }}
                        className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-[#0B1420]/80 hover:bg-[#0B1420]/5 cursor-pointer"
                      >
                        <User className="w-3.5 h-3.5" /> Admin Panel
                      </button>
                    )}
                    <button
                      onClick={() => {
                        setAccountMenuOpen(false);
                        onLogout();
                      }}
                      className="w-full flex items-center gap-2 px-4 py-2.5 text-xs text-rose-600 hover:bg-rose-50 cursor-pointer"
                    >
                      <LogOut className="w-3.5 h-3.5" /> Log Out
                    </button>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Cart Button with spring counter pulse */}
            <motion.button
              whileHover={{ scale: 1.04, y: -1 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => {
                playPop();
                onOpenCart();
              }}
              className="font-display relative flex items-center gap-2 sm:gap-2.5 px-3 sm:px-5 py-2 rounded-full border border-[#0B1420] bg-[#0B1420] hover:bg-[#05090F] text-[#F7F2E8] text-[12px] uppercase tracking-[0.04em] font-semibold transition-all duration-300 cursor-pointer shadow-lg group"
            >
              <ShoppingBag className="w-3.5 h-3.5 group-hover:scale-110 transition-transform" />
              <span className="hidden sm:inline">Cart</span>
              <motion.span 
                key={cartCount}
                initial={{ scale: 1.4 }}
                animate={{ scale: 1 }}
                className="w-4 h-4 rounded-full bg-[#F7F2E8] text-[#0B1420] text-[10px] font-mono font-bold flex items-center justify-center transition-colors"
              >
                {cartCount}
              </motion.span>
            </motion.button>

            {/* Mobile Menu Toggle */}
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="lg:hidden p-2 rounded-full border border-[#0B1420]/25 bg-[#0B1420]/5 text-[#0B1420]/85 cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </motion.button>
          </div>
        </div>

        {/* Mobile Slide-down Menu */}
        <AnimatePresence>
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="lg:hidden bg-[#F7F2E8] border-b border-[#0B1420]/15 px-6 py-5 space-y-1 overflow-hidden shadow-lg"
            >
              {navItems.map((item) => (
                <button
                  key={item.target}
                  onClick={() => handleNavClick(item.target)}
                  className="font-display w-full flex items-center justify-between py-3 text-left text-[15px] tracking-[0.01em] font-semibold text-[#0B1420]/85 hover:text-[#0B1420] border-b border-[#0B1420]/8 last:border-b-0"
                >
                  <span>{item.label}</span>
                </button>
              ))}
              <div className="pt-4 border-t border-[#0B1420]/10">
                <button
                  onClick={() => handleNavClick('catalog')}
                  className="font-display w-full py-3 rounded-full bg-[#0B1420] text-[#F7F2E8] font-semibold text-[13px] uppercase tracking-[0.06em] text-center hover:bg-[#05090F] transition-colors"
                >
                  Shop All Totes
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </header>
    </>
  );
};
