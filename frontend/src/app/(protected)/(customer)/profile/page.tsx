"use client";

import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { User, ShoppingBag, Heart, Lock } from "lucide-react";
import ProfileSkeleton from "@/components/skeletons/customer/ProfileSkeleton";
import PageContainer from "@/components/shared/PageContainer";

// Imported Refactored Components Mapped Here
import ProfileSidebar from "@/components/customer/profile/ProfileSidebar";
import ProfileTab from "@/components/customer/profile/ProfileTab";
import OrdersTab from "@/components/customer/profile/OrdersTab";
import WishlistTab from "@/components/customer/profile/WishListTab";
import ResetPasswordTab from "@/components/customer/profile/ResetPasswordTab";
import { TabType } from "@/types/customer/profile.type";

// Brand palette: Ink Navy #1B2A41 · Canvas Cream #F5EEDE · Surface Cream #FBF8F1
// Marigold Gold #C6941E (buttons/highlights) · Brick Maroon #7A2A28 (tags/accents)

export default function ProfilePage() {
  const { loading } = useAuth();
  const [activeTab, setActiveTab] = useState<TabType>("profile");

  const menuItems = [
    { id: "profile", label: "Profile", icon: <User className="w-4 h-4" /> },
    { id: "orders", label: "Orders", icon: <ShoppingBag className="w-4 h-4" /> },
    { id: "wishlist", label: "Wishlist", icon: <Heart className="w-4 h-4" /> },
    { id: "reset-password", label: "Reset Password", icon: <Lock className="w-4 h-4" /> },
  ];
  if (loading) {
    return <ProfileSkeleton />
  }

  return (
    <PageContainer className="py-10 pb-24 antialiased">
      <div className="space-y-6">
        {/* Global Page Heading Layout */}
        <div className="space-y-1">
          <h1 className="text-2xl md:text-3xl font-black text-[#1B2A41] tracking-tight">My Account</h1>
          <p className="text-xs md:text-sm text-[#1B2A41]/60 font-medium">
            Manage your profile details, look up order statuses, and verify your configurations.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 items-start">
          {/* Left Panel Sidebar */}
          <ProfileSidebar
            menuItems={menuItems}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
          />

          {/* Right WorkSpace Column Section */}
          <div className="lg:col-span-3 space-y-6">
            {/* Top Stat blocks - Can supply independent counts down the line */}

            {/* Conditional Tab Rendering prevents unmounted APIs execution */}
            {activeTab === "profile" && <ProfileTab />}
            {activeTab === "orders" && <OrdersTab />}
            {activeTab === "wishlist" && <WishlistTab />}
            {activeTab === "reset-password" && <ResetPasswordTab />}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}