"use client";

import Link from "next/link";
import { Home, SearchX, ShoppingBag } from "lucide-react";

import { Button } from "@/components/ui/button";
import { COLORS } from "@/constants/shared/theme";

export default function NotFound() {
    return (
        <div
            className="min-h-[calc(100vh-80px)] flex items-center justify-center px-6 py-16"
            style={{ backgroundColor: COLORS.canvasCream }}
        >
            <div
                className="w-full max-w-2xl rounded-3xl border shadow-sm text-center p-8 sm:p-12 animate-in fade-in zoom-in-95 duration-500"
                style={{
                    backgroundColor: COLORS.navbarBg,
                    borderColor: `${COLORS.inkNavy}20`,
                }}
            >
                <div
                    className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
                    style={{
                        backgroundColor: `${COLORS.marigoldGold}20`,
                    }}
                >
                    <SearchX
                        className="h-10 w-10"
                        style={{ color: COLORS.marigoldGold }}
                    />
                </div>

                <p
                    className="text-xs font-bold uppercase tracking-[0.25em] mb-3"
                    style={{ color: COLORS.brickMaroon }}
                >
                    Error 404
                </p>

                <h1
                    className="text-4xl sm:text-5xl font-black tracking-tight"
                    style={{ color: COLORS.inkNavy }}
                >
                    Page Not Found
                </h1>

                <p
                    className="mt-5 text-sm sm:text-base leading-7 max-w-lg mx-auto"
                    style={{ color: `${COLORS.inkNavy}B3` }}
                >
                    Oops! The page you're looking for doesn't exist or may have
                    been moved. Let's get you back to exploring our latest
                    collection.
                </p>

                <div className="mt-10 flex flex-col sm:flex-row justify-center gap-4">
                    <Button
                        asChild
                        className="h-11 rounded-xl font-semibold transition-all hover:opacity-90"
                        style={{
                            backgroundColor: COLORS.marigoldGold,
                            color: COLORS.inkNavy,
                        }}
                    >
                        <Link href="/shop">
                            <ShoppingBag className="mr-2 h-4 w-4" />
                            Continue Shopping
                        </Link>
                    </Button>

                    <Button
                        asChild
                        variant="outline"
                        className="h-11 rounded-xl font-semibold"
                        style={{
                            borderColor: COLORS.inkNavy,
                            color: COLORS.inkNavy,
                        }}
                    >
                        <Link href="/">
                            <Home className="mr-2 h-4 w-4" />
                            Back to Home
                        </Link>
                    </Button>
                </div>

                <div
                    className="mt-10 border-t pt-6 text-xs"
                    style={{
                        borderColor: `${COLORS.inkNavy}20`,
                        color: `${COLORS.inkNavy}80`,
                    }}
                >
                    Carry Culture. Carry Sustainability.
                </div>
            </div>
        </div>
    );
}