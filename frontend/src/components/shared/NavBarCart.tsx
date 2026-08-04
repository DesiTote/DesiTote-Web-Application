"use client";

import React from "react";
import { ShoppingCart } from "lucide-react";
import { useRouter } from "next/navigation";
import { useGetCart } from "@/hooks/customer/useCart";

// Define strict types for the hook's returned cart schema
interface CartItemData {
    id: string | number;
    quantity: number;
    [key: string]: any;
}

interface CartResponse {
    items?: CartItemData[];
    [key: string]: any;
}

interface NavbarCartProps {
    onNavAction?: () => void;
    isMobileStyle?: boolean; // Changed to optional to prevent component rendering failures
}

export default function NavbarCart({
    onNavAction,
    isMobileStyle = false, // Defaults to desktop fallback layout automatically
}: NavbarCartProps) {
    // Pull dynamic query state instantly from your data sync hook
    const { data, isLoading } = useGetCart() as { data: CartResponse | undefined; isLoading: boolean };

    const router = useRouter();

    const handleNavigation = ()=>{
        router.push("/cart");
    }

    // Safeguard array tracking logic cleanly inside a memoized compute block
    const cartCount = React.useMemo(() => {
        return data?.items?.reduce((acc: number, item: CartItemData) => acc + item.quantity, 0) || 0;
    }, [data?.items]);

    if (isMobileStyle) {
        return (
            <button
            onClick={handleNavigation}
                className="w-full h-12 rounded-xl bg-slate-50 border border-slate-200/60 text-[#1D264F] text-sm font-bold flex items-center justify-between px-4 cursor-pointer active:scale-[0.99] transition-transform"
            >
                <div className="flex items-center gap-3">
                    <ShoppingCart size={18} strokeWidth={2.5} />
                    <span>My Shopping Cart</span>
                </div>

                {isLoading ? (
                    <div className="w-8 h-5 rounded-full bg-pink-200 animate-pulse" />
                ) : cartCount > 0 ? (
                    <span className="bg-[#7A2A28] text-white text-xs font-black px-2.5 py-0.5 rounded-full animate-in zoom-in duration-200">
                        {cartCount}
                    </span>
                ) : (
                    <span className="text-xs text-slate-400 font-semibold">Empty</span>
                )}
            </button>
        );
    }

    // ==========================================
    // 💻 DESKTOP NAVBAR ICON OVERLAY
    // ==========================================
    return (
        <button
            onClick={handleNavigation}
            className="relative hover:scale-110 transition-all duration-200 cursor-pointer bg-transparent border-none outline-none flex items-center justify-center p-1"
            title="View Cart"
        >
            <ShoppingCart strokeWidth={2} size={26} className="text-[#1D264F]" />

            {isLoading ? (
                <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-pink-200 animate-pulse border-2 border-[#FFF9F2]" />
            ) : cartCount > 0 ? (
                <span className="absolute size-10 -top-2 -right-2 bg-[#7A2A28] text-white text-[11px] font-black w-5 h-5 flex items-center justify-center rounded-full border-2 border-white shadow-sm animate-in zoom-in duration-200">
                    {cartCount}
                </span>
            ) : null}
        </button>
    );
}