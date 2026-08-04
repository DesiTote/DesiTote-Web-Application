"use client";

import Link from "next/link";
import { LucideIcon } from "lucide-react";

// Brand palette: Ink Navy #1B2A41 · Surface Cream #FBF8F1
// Marigold Gold #C6941E (buttons/highlights)

interface EmptyStateProps {
    title: string;
    description: string;
    icon: LucideIcon;
    actionLabel?: string;
    actionHref?: string;
}

export default function EmptyState({
    title,
    description,
    icon: Icon,
    actionLabel,
    actionHref,
}: EmptyStateProps) {
    return (
        <div className="min-h-[60vh] flex items-center justify-center px-4">
            <div className="max-w-md w-full bg-[#FBF8F1] rounded-3xl border border-[#1B2A41]/10 shadow-sm p-10 text-center">
                <div className="w-24 h-24 rounded-full bg-[#C6941E]/15 flex items-center justify-center mx-auto mb-6">
                    <Icon className="w-12 h-12 text-[#C6941E]" />
                </div>
                <h1 className="text-2xl sm:text-3xl font-black text-[#1B2A41] tracking-tight">
                    {title}
                </h1>
                <p className="text-[#1B2A41]/60 mt-3 mb-8 text-sm sm:text-base font-medium">
                    {description}
                </p>
                {actionLabel && actionHref && (
                    <Link
                        href={actionHref}
                        className="h-12 px-6 rounded-2xl bg-[#C6941E] hover:bg-[#A87A14] text-[#1B2A41] hover:text-[#FBF8F1] font-bold inline-flex items-center justify-center transition cursor-pointer"
                    >
                        {actionLabel}
                    </Link>
                )}
            </div>
        </div>
    );
}