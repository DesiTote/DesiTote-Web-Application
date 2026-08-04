"use client"
import AdminRoute from "@/components/guards/AdminRoute";

import AdminSidebar from "@/components/admin/layout/AdminSidebar";
import AdminTopbar from "@/components/admin/layout/AdminTopbar";
import { useState } from "react";
import { cn } from "@/lib/utils";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [collapsed, setCollapsed] = useState(false);
  return (
    <AdminRoute>
      <div className="bg-[#F8FAFC]">
        {/* Sidebar */}
        <div className="hidden lg:block">
          <AdminSidebar
            collapsed={collapsed}
            setCollapsed={setCollapsed}
          />
        </div>

        {/* Main */}
        <div
          className={cn(
            "flex min-h-screen flex-col transition-all duration-300",
            collapsed ? "lg:ml-[92px]" : "lg:ml-[280px]"
          )}
        >
          <AdminTopbar />

          <main className="flex-1 p-4 lg:p-8">
            {children}
          </main>
        </div>
      </div>
    </AdminRoute>
  );
}