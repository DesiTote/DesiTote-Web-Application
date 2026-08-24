"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import { User, Menu, X, LogIn } from "lucide-react";
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
    } else {
      document.body.style.overflow = "";
    }

    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileOpen]);

  return (
    <nav className="w-full bg-[#FBF8F1] sticky top-0 left-0 z-50 font-body border-b border-[#1B2A41]/10">
      {/* Main Navbar Top Header Bar */}
      <div className="w-full px-6 md:px-16 lg:px-24 py-6 md:py-7 flex items-center justify-between bg-[#FBF8F1] relative z-20">

        {/* --- LOGO --- */}
        <div
          onClick={() => {
            setMobileOpen(false);
            router.push("/");
          }}
          className="flex items-center gap-3 cursor-pointer group select-none"
        >
          <div className="relative w-11 h-11 md:w-14 md:h-14 shrink-0 rounded-full overflow-hidden ring-1 ring-[#1B2A41]/15 shadow-sm transition-transform duration-300 group-hover:rotate-[8deg]">
            <Image
              src="/images/DesiTotesLogo.png"
              alt="Desi Totes logo"
              fill
              sizes="56px"
              className="object-cover"
              priority
            />
          </div>
          <span className="flex items-baseline gap-1.5 leading-none">
            <span className="text-2xl md:text-[34px] font-bold tracking-tight text-[#1B2A41]">
              Desi
            </span>
            <span className="text-2xl md:text-[34px] font-semibold tracking-tight text-[#7A2A28]">
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
            className="lg:hidden cursor-pointer p-0 text-[#1B2A41] bg-transparent border-none flex items-center justify-center relative w-[30px] h-[30px]"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle Navigation Menu"
          >
            <Menu
              size={30}
              className={`absolute inset-0 transition-opacity duration-200 ease-in-out ${mobileOpen ? "opacity-0 pointer-events-none" : "opacity-100"
                }`}
            />
            <X
              size={30}
              className={`absolute inset-0 transition-opacity duration-200 ease-in-out ${mobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
                }`}
            />
          </button>
        </div>
      </div>

      {/* --- EXTENDED MOBILE MENU DROPDOWN PANEL --- */}
      <div
        className={`lg:hidden absolute top-full left-0 w-full bg-[#FBF8F1] z-10 border-t border-[#1B2A41]/10 shadow-2xl overflow-hidden transition-all duration-300 ease-in-out ${mobileOpen
            ? "max-h-[calc(100dvh-100%)] opacity-100 translate-y-0"
            : "max-h-0 opacity-0 -translate-y-2 pointer-events-none"
          }`}
      >
        <div className="px-8 py-8 flex flex-col justify-between h-[calc(100dvh-80px)] overflow-y-auto">
          {/* Core Navigation Pathways */}
          <div className="flex flex-col gap-6">
            {navLinks.map((link) => (
              <button
                key={link.name}
                className="text-left text-2xl font-bold text-[#1B2A41] bg-transparent border-none active:text-[#7A2A28] transition-colors"
                onClick={() => {
                  router.push(link.path);
                  setMobileOpen(false);
                }}
              >
                {link.name}
              </button>
            ))}
          </div>

          {/* Mobile Accessibility Footer Switch */}
          <div className="border-t border-[#1B2A41]/10 pt-6 space-y-4 pb-10">
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
                  className="w-full h-12 rounded-xl bg-[#1B2A41] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
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
                className="w-full h-12 rounded-xl bg-[#C6941E] text-white text-sm font-bold flex items-center justify-center gap-2 shadow-sm"
              >
                <LogIn size={16} strokeWidth={2.5} />
                <span>Sign In to Continue</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}