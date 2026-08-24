"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";

type SidebarItemProps = {
    href: string;
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    active: boolean;
    collapsed: boolean;
};

export default function SidebarItem({
    href,
    icon: Icon,
    label,
    active,
    collapsed,
}: SidebarItemProps) {
    return (
        <Link
            href={href}
            className={cn(
                "group flex items-center gap-3 rounded-2xl px-4 py-3 transition-all duration-200",
                active
                    ? "bg-[#166534] text-white shadow-sm"
                    : "text-zinc-600 hover:bg-zinc-100 hover:text-zinc-900"
            )}
        >
            <Icon
                className={cn(
                    "h-5 w-5 shrink-0",
                    active
                        ? "text-white"
                        : "text-zinc-500 group-hover:text-zinc-900"
                )}
            />

            {!collapsed && (
                <span className="text-sm font-medium">
                    {label}
                </span>
            )}
        </Link>
    );
}