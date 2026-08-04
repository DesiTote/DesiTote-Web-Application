"use client";
import { usePathname } from "next/navigation";

import {
    ChevronLeft,
    ChevronRight,
} from "lucide-react";

import SidebarItem from "./SidebarItem";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { sidebarItems } from "@/constants/admin/SidebarItems";

type AdminSidebarProps = {
    collapsed: boolean;
    setCollapsed: React.Dispatch<React.SetStateAction<boolean>>;
};


export default function AdminSidebar({
    collapsed,
    setCollapsed,
}: AdminSidebarProps) {
    const pathname = usePathname();

    return (
        <aside
            className={`
    fixed
    left-0
    top-0
    z-40
    h-screen
    flex
    flex-col
    border-r
    bg-white
    transition-all
    duration-300
    ${collapsed
                    ? "w-[92px]"
                    : "w-[280px]"
                }
  `}
        >
            {/* LOGO */}

            <div className="flex h-20 items-center justify-between px-5">

                {!collapsed && (
                    <div>
                        <h1 className="text-xl font-bold text-zinc-900 block">
                            DesiTotes🛍️
                        </h1>

                        <p className="text-xs text-zinc-600 mt-1">
                            Admin Dashboard
                        </p>
                    </div>
                )}

                <Button
                    size="icon"
                    variant="ghost"
                    onClick={() =>
                        setCollapsed(
                            !collapsed
                        )
                    }
                    className="text-zinc-500 hover:bg-zinc-100 hover:text-zinc-900"
                >
                    {collapsed ? (
                        <ChevronRight className="h-5 w-5" />
                    ) : (
                        <ChevronLeft className="h-5 w-5" />
                    )}
                </Button>
            </div>

            <Separator className="bg-zinc-800" />

            {/* NAVIGATION */}

            <div className="flex-1 overflow-y-auto px-3 py-5 bg-white">

                <nav className="space-y-2">

                    {sidebarItems.map(
                        (item) => (
                            <SidebarItem
                                key={
                                    item.href
                                }
                                href={
                                    item.href
                                }
                                label={
                                    item.label
                                }
                                icon={
                                    item.icon
                                }
                                collapsed={
                                    collapsed
                                }
                                active={pathname.startsWith(
                                    item.href
                                )}
                            />
                        )
                    )}

                </nav>
            </div>

            {/* FOOTER */}

            <div className="border-t border-zinc-200 p-4 bg-white">
                {!collapsed ? (
                    <div className="rounded-2xl bg-black p-4">

                        <p className="text-sm font-medium text-white">
                            DesiTotes Admin
                        </p>

                        <p className="mt-1 text-xs text-zinc-400">
                            Manage your ecommerce
                            platform easily.
                        </p>

                    </div>
                ) : (
                    <div className="flex justify-center">

                        <div className="h-10 w-10 rounded-xl bg-[#F3F4F6]" />

                    </div>
                )}

            </div>
        </aside>
    );
}