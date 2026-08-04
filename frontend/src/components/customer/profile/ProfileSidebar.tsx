"use client";

import { useAuth } from "@/context/AuthContext";
import { TabType } from "@/types/customer/profile.type";
import { LogOut } from "lucide-react";

// Brand palette: Ink Navy #1B2A41 · Surface Cream #FBF8F1
// Marigold Gold #C6941E (buttons/highlights, avatar accent)
// Verified/Unverified badges and Logout stay semantic green/red —
// status signals, not brand accents.

interface MenuItem {
  id: string;
  label: string;
  icon: React.ReactNode;
}

interface ProfileSidebarProps {
  menuItems: MenuItem[];
  activeTab: TabType;
  setActiveTab: (tab: TabType) => void;
}

export default function ProfileSidebar({ menuItems, activeTab, setActiveTab }: ProfileSidebarProps) {
  const { user, isLoggingOut, logout } = useAuth();

  return (
    <div className="bg-[#FBF8F1] rounded-2xl border border-[#1B2A41]/10 shadow-sm p-5 flex flex-col md:flex-row lg:flex-col items-center md:justify-between lg:justify-start gap-6 lg:sticky lg:top-24 w-full">
      {/* User Meta Summary Badge */}
      <div className="flex flex-col items-center text-center md:text-left lg:text-center md:flex-row lg:flex-col gap-4 md:gap-4 lg:gap-2 w-full md:w-auto lg:w-full">
        <div className="w-16 h-16 rounded-2xl bg-[#C6941E]/15 border border-[#C6941E]/25 flex items-center justify-center text-xl font-black text-[#A87A14] shrink-0 select-none shadow-inner">
          {user?.fullName?.charAt(0).toUpperCase() || "U"}
        </div>
        <div className="space-y-1">
          <h2 className="font-bold text-base text-[#1B2A41] tracking-tight leading-tight">
            {user?.fullName || "DesiTotes User"}
          </h2>
          <p className="text-xs text-[#1B2A41]/40 font-medium break-all max-w-[180px]">
            {user?.email}
          </p>
          <div className="pt-1 flex items-center justify-center md:justify-start lg:justify-center">
            {user?.emailVerified ? (
              <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold py-0.5 px-2 rounded-md flex items-center gap-1 shadow-none">
                Verified
              </span>
            ) : (
              <span className="bg-rose-50 text-rose-600 border border-rose-100 text-[10px] font-bold py-0.5 px-2 rounded-md flex items-center gap-1 shadow-none">
                Unverified
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Navigation Options - Standardized Grid for Mobile Layout */}
      <div className="w-full border-t border-[#1B2A41]/10 md:border-t-0 lg:border-t pt-4 md:pt-0 lg:pt-4 grid grid-cols-2 lg:flex lg:flex-col gap-2 md:w-auto lg:w-full">
        {menuItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id as TabType)}
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide transition-all cursor-pointer w-full
              ${activeTab === item.id
                ? "bg-[#1B2A41] text-[#FBF8F1] shadow-sm"
                : "text-[#1B2A41]/60 hover:text-[#1B2A41] hover:bg-[#1B2A41]/5"
              }`}
          >
            <span className="shrink-0">{item.icon}</span>
            <span className="truncate">{item.label}</span>
          </button>
        ))}

        <button
          onClick={() => logout()}
          disabled={isLoggingOut}
          className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-bold tracking-wide text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer w-full disabled:opacity-50"
        >
          <LogOut className="w-4 h-4 shrink-0" />
          <span className="truncate">Logout</span>
        </button>
      </div>
    </div>
  );
}