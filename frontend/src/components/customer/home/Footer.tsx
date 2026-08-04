"use client";

import React, { useState } from "react";
import Link from "next/link";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
    Mail,
    Shield,
    RefreshCw,
    Headphones,
    Heart,
    Leaf,
} from "lucide-react";
import { COLORS } from "@/constants/shared/theme";
import { toast } from "sonner";
import { useSubscribe } from "@/hooks/customer/useSubscription";
import { SubscriptionFormData, subscriptionSchema } from "@/schemas/customer/subscription.schema";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, useForm } from "react-hook-form";
import { footerLinks, sideBadges } from "@/constants/customer/footer";

export default function Footer() {


    const subscriptionForm = useForm<SubscriptionFormData>({
        resolver: zodResolver(subscriptionSchema),
        defaultValues: {
            email: "",
        },
    });

    const { mutate, isPending } = useSubscribe();

    const onSubmit = (data: SubscriptionFormData) => {
        mutate(data, {
            onSuccess: () => {
                toast.success("Subscribed successfully");
                subscriptionForm.reset();
            },
            onError: (error: any) => {
                toast.error(
                    error.response?.data?.message ??
                    "Something went wrong"
                );
            },
        });
    };


    return (
        <footer
            className="w-full text-slate-100 font-sans relative overflow-hidden pt-16 pb-6"
            style={{
                backgroundColor: COLORS.inkNavy,
            }}
        >
            {/* SUBTLE BACKGROUND ACCENTS */}
            <div
                className="absolute top-0 left-0 w-40 h-40 rounded-full blur-[100px] opacity-10 pointer-events-none"
                style={{
                    backgroundColor: COLORS.marigoldGold,
                }}
            />

            <div
                className="absolute bottom-0 right-0 w-72 h-72 rounded-full blur-[110px] opacity-10 pointer-events-none"
                style={{
                    backgroundColor: COLORS.brickMaroon,
                }}
            />

            <div
                className="absolute bottom-0 left-1/3 w-48 h-48 rounded-full blur-[100px] opacity-5 pointer-events-none"
                style={{
                    backgroundColor: COLORS.marigoldGold,
                }}
            />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-16">

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-8 items-center">

                    {/* LEFT — TEXT */}
                    <div className="lg:col-span-6 space-y-4">
                        <div className="flex items-center gap-2">
                            <span
                                className="text-[11px] font-black tracking-widest uppercase"
                                style={{
                                    color: COLORS.marigoldGold,
                                }}
                            >
                                STAY IN THE LOOP
                            </span>

                            <span
                                className="text-sm"
                                style={{
                                    color: COLORS.marigoldGold,
                                }}
                            >
                                ⚡
                            </span>
                        </div>

                        <h2
                            className="text-4xl sm:text-5xl font-black tracking-tight leading-[0.95]"
                            style={{
                                color: COLORS.canvasCream,
                            }}
                        >
                            Be the{" "}
                            <span
                                style={{
                                    color: COLORS.marigoldGold,
                                }}
                            >
                                first
                            </span>
                            <br />
                            to know.
                        </h2>

                        <p
                            className="text-sm sm:text-base leading-relaxed max-w-md"
                            style={{
                                color: `${COLORS.canvasCream}B3`,
                            }}
                        >
                            Sign up for updates, new arrivals, and exclusive offers —
                            straight to your inbox.
                        </p>
                    </div>

                    {/* RIGHT — EMAIL SUBSCRIPTION */}
                    <div className="lg:col-span-6">
                        <form
                            onSubmit={subscriptionForm.handleSubmit(onSubmit)}
                            className="flex items-start gap-2"
                        >
                            <div className="flex-1">
                                <Input
                                    type="email"
                                    placeholder="you@email.com"
                                    {...subscriptionForm.register("email")}
                                    className={`h-12 rounded-none border bg-transparent shadow-none focus-visible:ring-0 px-4 text-sm ${subscriptionForm.formState.errors.email
                                        ? "border-red-500"
                                        : ""
                                        }`}
                                />

                                {subscriptionForm.formState.errors.email && (
                                    <p className="mt-1 text-xs text-red-500">
                                        {subscriptionForm.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                className="h-12 rounded-none px-7 shrink-0 font-bold text-sm uppercase tracking-wide cursor-pointer transition-all hover:opacity-90"
                                style={{
                                    backgroundColor: COLORS.marigoldGold,
                                    color: COLORS.inkNavy,
                                }}
                            >
                                {isPending ? "Subscribing" : "Subscribe"}
                            </Button>
                        </form>

                        <p
                            className="text-[10px] mt-2 font-medium"
                            style={{
                                color: `${COLORS.canvasCream}55`,
                            }}
                        >
                            No spam. Unsubscribe anytime.
                        </p>
                    </div>
                </div>

                {/* =========================================================
                    2. MAIN LINKS & NAVIGATION
                ========================================================= */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 lg:gap-6 pt-6">

                    {/* BRAND */}
                    <div className="lg:col-span-4 space-y-5">
                        <div className="space-y-2">
                            <h3
                                className="font-brand text-3xl font-bold tracking-tight flex items-center gap-0.5 select-none"
                                style={{
                                    color: COLORS.canvasCream,
                                }}
                            >
                                Desi
                                <span
                                    className="not-italic"
                                    style={{
                                        color: COLORS.marigoldGold,
                                    }}
                                >
                                    Totes
                                </span>

                                <span
                                    className="w-2 h-2 rounded-full inline-block self-end mb-2 ml-0.5"
                                    style={{
                                        backgroundColor: COLORS.marigoldGold,
                                    }}
                                />
                            </h3>

                            <p
                                className="text-xs sm:text-sm font-medium leading-relaxed max-w-xs"
                                style={{
                                    color: `${COLORS.canvasCream}B3`,
                                }}
                            >
                                Thoughtfully designed totes for work,
                                weekends and everything in between.
                            </p>
                        </div>

                        {/* SOCIAL LINKS */}
                        <div className="flex items-center gap-2">
                            <a
                                href="https://www.instagram.com/desitotes/"
                                target="_blank"
                                rel="noopener noreferrer"
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:-translate-y-0.5 shadow-sm"
                                style={{
                                    backgroundColor:
                                        COLORS.marigoldGold,
                                    color: COLORS.inkNavy,
                                }}
                            >
                                <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <rect
                                        width="20"
                                        height="20"
                                        x="2"
                                        y="2"
                                        rx="5"
                                        ry="5"
                                    />
                                    <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                                    <line
                                        x1="17.5"
                                        x2="17.51"
                                        y1="6.5"
                                        y2="6.5"
                                    />
                                </svg>
                            </a>

                            <a
                                href="#"
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:-translate-y-0.5 shadow-sm"
                                style={{
                                    backgroundColor:
                                        COLORS.marigoldGold,
                                    color: COLORS.inkNavy,
                                }}
                            >
                                <svg
                                    className="w-4 h-4"
                                    viewBox="0 0 24 24"
                                    fill="none"
                                    stroke="currentColor"
                                    strokeWidth="2"
                                    strokeLinecap="round"
                                    strokeLinejoin="round"
                                >
                                    <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
                                </svg>
                            </a>

                            <a
                                href="mailto:desitotes0401@gmail.com"
                                className="w-8 h-8 rounded-full flex items-center justify-center transition-transform hover:-translate-y-0.5 shadow-sm"
                                style={{
                                    backgroundColor:
                                        COLORS.marigoldGold,
                                    color: COLORS.inkNavy,
                                }}
                            >
                                <Mail size={16} />
                            </a>
                        </div>

                        <div className="pt-2">
                            <Heart
                                className="w-5 h-5 stroke-[2.5]"
                                style={{
                                    color: COLORS.marigoldGold,
                                }}
                            />
                        </div>
                    </div>

                    {/* LINK MENUS */}
                    <div className="lg:col-span-5 grid grid-cols-2 sm:grid-cols-4 gap-6">
                        {footerLinks.map((section, idx) => (
                            <div
                                key={idx}
                                className="space-y-3"
                            >
                                <h4
                                    className="text-xs font-black tracking-widest uppercase"
                                    style={{
                                        color: section.titleColor,
                                    }}
                                >
                                    {section.title}
                                </h4>

                                <ul className="space-y-2.5">
                                    {section.links.map(
                                        (link, linkIdx) => (
                                            <li key={linkIdx}>
                                                <Link
                                                    href={link.href}
                                                    className="text-xs font-semibold transition-colors"
                                                    style={{
                                                        color: `${COLORS.canvasCream}A6`,
                                                    }}
                                                    onMouseEnter={(e) => {
                                                        e.currentTarget.style.color =
                                                            COLORS.marigoldGold;
                                                    }}
                                                    onMouseLeave={(e) => {
                                                        e.currentTarget.style.color =
                                                            `${COLORS.canvasCream}A6`;
                                                    }}
                                                >
                                                    {link.name}
                                                </Link>
                                            </li>
                                        )
                                    )}
                                </ul>
                            </div>
                        ))}
                    </div>

                    {/* BADGES */}
                    <div
                        className="lg:col-span-3 border-t md:border-t-0 pt-8 md:pt-0 lg:pl-4 flex flex-col justify-center space-y-4"
                        style={{
                            borderColor: `${COLORS.canvasCream}15`,
                        }}
                    >
                        {sideBadges.map((badge, idx) => (
                            <div
                                key={idx}
                                className="flex items-center gap-3 group border-b pb-3 last:border-none last:pb-0"
                                style={{
                                    borderColor: `${COLORS.canvasCream}15`,
                                }}
                            >
                                <div
                                    className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform"
                                    style={{
                                        backgroundColor: `${COLORS.marigoldGold}18`,
                                    }}
                                >
                                    {badge.icon}
                                </div>

                                <span
                                    className="text-[10px] font-black tracking-wider"
                                    style={{
                                        color: COLORS.canvasCream,
                                    }}
                                >
                                    {badge.text}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* =========================================================
                    3. BOTTOM BAR / LEGAL / PAYMENTS
                ========================================================= */}
                <div
                    className="border-t pt-6 flex flex-col sm:flex-row items-center justify-between gap-4"
                    style={{
                        borderColor: `${COLORS.canvasCream}18`,
                    }}
                >
                    {/* LEGAL */}
                    <div
                        className="flex flex-col sm:flex-row items-center gap-2 sm:gap-6 text-[11px] font-semibold text-center sm:text-left"
                        style={{
                            color: `${COLORS.canvasCream}73`,
                        }}
                    >
                        <span>
                            © {new Date().getFullYear()} DesiTotes. All rights reserved.
                        </span>

                        <div className="flex items-center gap-4">
                            <Link
                                href="/privacy-policy"
                                className="transition-colors hover:opacity-100"
                            >
                                Privacy Policy
                            </Link>

                            <Link
                                href="/terms-and-conditions"
                                className="transition-colors hover:opacity-100"
                            >
                                Terms and Conditions
                            </Link>

                            <Link
                                href="/shipping-policy"
                                className="transition-colors hover:opacity-100"
                            >
                                Shipping Policy
                            </Link>
                        </div>
                    </div>

                    {/* PAYMENT PROVIDERS */}
                    <div
                        className="flex items-center gap-1.5 p-1.5 rounded-lg border shadow-sm"
                        style={{
                            backgroundColor: `${COLORS.navbarBg}12`,
                            borderColor: `${COLORS.canvasCream}18`,
                        }}
                    >
                        {[
                            "VISA",
                            "MASTERCARD",
                            "UPI",
                            "NET BANKING",
                        ].map((provider, idx) => (
                            <span
                                key={idx}
                                className="text-[9px] font-black tracking-tighter px-1.5 py-0.5 rounded uppercase select-none"
                                style={{
                                    color: COLORS.canvasCream,
                                    backgroundColor: `${COLORS.canvasCream}0A`,
                                    border: `1px solid ${COLORS.canvasCream}18`,
                                }}
                            >
                                {provider}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
}