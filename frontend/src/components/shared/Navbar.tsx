"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { User, Menu, X, LogIn, ArrowRight } from "lucide-react";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/context/AuthContext";
import BaseSkeleton from "@/components/skeletons/BaseSkeleton";
import NavbarCart from "./NavBarCart";
import { navLinks } from "@/constants/customer/navbar";

export default function Navbar() {
  const { isLoggedIn, user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
      document.documentElement.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
      document.documentElement.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav className="w-full bg-[#FBF8F1] sticky top-0 left-0 z-40 font-body border-b border-[#1B2A41]/10">
      {/* Main Navbar Top Header Bar */}
      <div className="w-full px-5 sm:px-8 md:px-16 lg:px-24 py-3 sm:py-4 md:py-6 flex items-center justify-between bg-[#FBF8F1] relative z-20">

        {/* --- LOGO --- */}
        <div
          onClick={() => {
            setMobileOpen(false);
            router.push("/");
          }}
          className="flex items-center gap-2.5 sm:gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-9 h-9 sm:w-11 sm:h-11 md:w-14 md:h-14 shrink-0 rounded-full overflow-hidden ring-1 ring-[#1B2A41]/15 shadow-sm transition-transform duration-300 group-hover:rotate-[8deg]">
            <Image
              src="/images/DesiTotesLogo.png"
              alt="Desi Totes logo"
              fill
              sizes="56px"
              className="object-cover"
              priority
            />
          </div>
          <span className="flex items-baseline gap-1 sm:gap-1.5 leading-none">
            <span className="text-xl sm:text-2xl md:text-[34px] font-bold tracking-tight text-[#1B2A41]">
              Desi
            </span>
            <span className="text-xl sm:text-2xl md:text-[34px] font-semibold tracking-tight text-[#7A2A28]">
              Totes
            </span>
          </span>
        </div>

        {/* --- CENTER DESKTOP NAV LINKS --- */}
        <div className="hidden lg:flex items-center gap-12">
          {navLinks.map((link) => {
            const isActive =
              pathname === link.path || (link.name === "Home" && pathname === "/");
            return (
              <button
                key={link.name}
                onClick={() => router.push(link.path)}
                className="relative py-1 cursor-pointer bg-transparent border-none outline-none"
              >
                <span
                  className={`text-[17px] font-bold transition-colors duration-200 ${isActive ? "text-[#7A2A28]" : "text-[#1B2A41] hover:text-[#7A2A28]"
                    }`}
                >
                  {link.name}
                </span>
                {isActive && (
                  <div className="absolute -bottom-1 left-0 w-full h-0.75 bg-[#C6941E] rounded-full transition-all" />
                )}
              </button>
            );
          })}
        </div>

        {/* --- DESKTOP RIGHT ACTION ICONS AREA --- */}
        <div className="flex items-center gap-6 md:gap-8 text-[#1B2A41]">
          {/* DESKTOP AUTH CONTROLLER */}
          <div className="hidden lg:flex items-center gap-6 md:gap-8">
            {loading ? (
              <BaseSkeleton className="w-8 h-8 rounded-xl bg-[#1B2A41]/10" />
            ) : isLoggedIn ? (
              <>
                <NavbarCart />
                <button
                  onClick={() => router.push("/profile")}
                  className="w-8 h-8 rounded-xl hover:scale-110 duration-200 bg-[#1B2A41]/5 hover:bg-[#1B2A41]/10 text-[#1B2A41] flex items-center justify-center text-xs font-black tracking-wider transition-all cursor-pointer active:scale-95 border border-[#1B2A41]/10 shadow-sm"
                  title="View Profile"
                >
                  {user?.fullName?.charAt(0).toUpperCase() || <User size={16} />}
                </button>
              </>
            ) : (
              <button
                onClick={() => router.push("/login")}
                className="hover:scale-110 transition-all duration-200 cursor-pointer items-center justify-center animate-in fade-in"
                title="Sign In"
              >
                <User strokeWidth={2} size={26} className="text-[#1B2A41]" />
              </button>
            )}
          </div>

          {/* Mobile Toggle Button */}
          <button
            className="lg:hidden cursor-pointer p-0 text-[#1B2A41] bg-transparent border-none flex items-center justify-center relative w-[32px] h-[32px]"
            onClick={() => setMobileOpen(true)}
            aria-label="Open Navigation Menu"
          >
            <Menu size={28} className="text-[#1B2A41]" />
          </button>
        </div>
      </div>

      {/* --- FULLSCREEN MOBILE MENU MODAL OVERLAY --- */}
      <div
        className={`lg:hidden fixed inset-0 w-full h-[100dvh] bg-[#FBF8F1] z-[100] flex flex-col transition-all duration-300 ease-in-out ${
          mobileOpen
            ? "opacity-100 translate-y-0 pointer-events-auto"
            : "opacity-0 -translate-y-4 pointer-events-none"
        }`}
      >
        {/* Fullscreen Modal Header */}
        <div className="w-full px-5 sm:px-8 py-3.5 sm:py-4 flex items-center justify-between border-b border-[#1B2A41]/10 bg-[#FBF8F1] shrink-0">
          <div
            onClick={() => {
              setMobileOpen(false);
              router.push("/");
            }}
            className="flex items-center gap-2.5 cursor-pointer select-none"
          >
            <div className="relative w-9 h-9 sm:w-10 sm:h-10 shrink-0 rounded-full overflow-hidden ring-1 ring-[#1B2A41]/15 shadow-sm">
              <Image
                src="/images/DesiTotesLogo.png"
                alt="Desi Totes logo"
                fill
                sizes="40px"
                className="object-cover"
                priority
              />
            </div>
            <span className="flex items-baseline gap-1 leading-none">
              <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#1B2A41]">
                Desi
              </span>
              <span className="text-xl sm:text-2xl font-semibold tracking-tight text-[#7A2A28]">
                Totes
              </span>
            </span>
          </div>

          {/* Close Button */}
          <button
            onClick={() => setMobileOpen(false)}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#1B2A41]/5 hover:bg-[#1B2A41]/10 active:scale-95 text-[#1B2A41] flex items-center justify-center transition-all cursor-pointer border border-[#1B2A41]/10"
            aria-label="Close Navigation Menu"
          >
            <X size={22} className="text-[#1B2A41]" />
          </button>
        </div>

        {/* Scrollable Modal Body */}
        <div className="flex-1 overflow-y-auto px-5 sm:px-8 py-6 flex flex-col justify-between">
          {/* Navigation Links */}
          <div className="flex flex-col gap-1.5">
            <span className="text-[11px] font-mono uppercase tracking-[0.18em] text-[#7A2A28] font-bold px-3 mb-1">
              Menu Navigation
            </span>
            {navLinks.map((link) => {
              const isActive =
                pathname === link.path || (link.name === "Home" && pathname === "/");
              return (
                <button
                  key={link.name}
                  className={`w-full text-left py-3 px-4 rounded-xl font-display text-2xl font-bold transition-all duration-200 flex items-center justify-between group cursor-pointer ${
                    isActive
                      ? "bg-[#7A2A28]/10 text-[#7A2A28] pl-5"
                      : "text-[#1B2A41] hover:bg-[#1B2A41]/5 hover:text-[#7A2A28]"
                  }`}
                  onClick={() => {
                    router.push(link.path);
                    setMobileOpen(false);
                  }}
                >
                  <span>{link.name}</span>
                  {isActive ? (
                    <span className="w-2 h-2 rounded-full bg-[#7A2A28]" />
                  ) : (
                    <ArrowRight className="w-5 h-5 text-[#1B2A41]/30 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-[#7A2A28]" />
                  )}
                </button>
              );
            })}
          </div>

          {/* Footer Actions & Account */}
          <div className="mt-8 border-t border-[#1B2A41]/10 pt-6 space-y-4 pb-4">
            {loading ? (
              <BaseSkeleton className="w-full h-12 rounded-xl bg-[#1B2A41]/10" />
            ) : isLoggedIn ? (
              <div className="flex flex-col gap-3">
                <div onClick={() => setMobileOpen(false)}>
                  <NavbarCart isMobileStyle={true} />
                </div>

                <button
                  onClick={() => {
                    router.push("/profile");
                    setMobileOpen(false);
                  }}
                  className="w-full h-12 rounded-xl bg-[#1B2A41] hover:bg-[#1B2A41]/90 text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer active:scale-[0.99]"
                >
                  <div className="w-5 h-5 rounded-md bg-white/20 flex items-center justify-center text-[10px] font-black">
                    {user?.fullName?.charAt(0).toUpperCase()}
                  </div>
                  <span>Account Dashboard ({user?.fullName?.split(" ")[0]})</span>
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  router.push("/login");
                  setMobileOpen(false);
                }}
                className="w-full h-12 rounded-xl bg-[#C6941E] hover:bg-[#A87A14] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm transition-colors cursor-pointer active:scale-[0.99]"
              >
                <LogIn size={18} strokeWidth={2.5} />
                <span>Sign In to Continue</span>
              </button>
            )}

            {/* Brand Tagline */}
            <div className="text-center pt-2">
              <p className="text-[11px] font-mono tracking-wider text-[#1B2A41]/50 uppercase">
                100% Handcrafted • Maharashtra, India
              </p>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}