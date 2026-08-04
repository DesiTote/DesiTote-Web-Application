"use client";

import { ShoppingBag, Heart, User } from "lucide-react";
import { useAuth } from "@/context/AuthContext";

interface AnalyticsCardsProps {
    wishlistCount: number;
}

export default function AnalyticsCards({ wishlistCount }: AnalyticsCardsProps) {
    const { user } = useAuth();

    // TODO: Insert independent hook execution here if getting standalone analytic endpoints:
    // const { data: stats } = useGetAnalyticsStats();

    return (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center sm:justify-center gap-4 sm:flex-col sm:text-center">
                <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center text-slate-600 shrink-0">
                    <ShoppingBag size={18} />
                </div>
                <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Total Orders</p>
                    <h3 className="text-xl font-black text-slate-900 leading-none mt-1">0</h3>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center sm:justify-center gap-4 sm:flex-col sm:text-center">
                <div className="w-10 h-10 rounded-xl bg-rose-50 flex items-center justify-center text-rose-500 shrink-0">
                    <Heart size={18} />
                </div>
                <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Saved Items</p>
                    <h3 className="text-xl font-black text-slate-900 leading-none mt-1">{wishlistCount}</h3>
                </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm flex items-center sm:justify-center gap-4 sm:flex-col sm:text-center">
                <div className="w-10 h-10 rounded-xl bg-cyan-50 flex items-center justify-center text-cyan-600 shrink-0">
                    <User size={18} />
                </div>
                <div>
                    <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">Account Tier</p>
                    <h3 className="text-xs font-black text-slate-900 uppercase tracking-wider mt-2 bg-slate-100 px-2 py-0.5 rounded-md inline-block">
                        {user?.role || "CUSTOMER"}
                    </h3>
                </div>
            </div>
        </div>
    );
}