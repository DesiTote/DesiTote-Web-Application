"use client";

import { useAuth } from "@/context/AuthContext";
import { Input } from "@/components/ui/input";
import { ShieldAlert } from "lucide-react";

// Brand palette: Ink Navy #1B2A41 · Surface Cream #FBF8F1

export default function ProfileTab() {
    const { user } = useAuth();

    return (
        <div className="bg-[#FBF8F1] rounded-2xl border border-[#1B2A41]/10 shadow-sm p-6 space-y-6 animate-in fade-in-50 duration-200">
            <div className="border-b border-[#1B2A41]/10 pb-3">
                <h3 className="text-base font-bold text-[#1B2A41] tracking-tight">Profile Information</h3>
                <p className="text-xs text-[#1B2A41]/40 font-medium">Your account profile identity mappings and core attributes.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1B2A41]/50 tracking-wide uppercase">Full Name</label>
                    <Input
                        value={user?.fullName || ""}
                        disabled
                        className="bg-[#1B2A41]/5 border-[#1B2A41]/15 text-[#1B2A41]/80 font-medium text-sm rounded-xl h-11 focus-visible:ring-0 cursor-not-allowed"
                    />
                </div>

                <div className="space-y-1.5">
                    <label className="text-xs font-bold text-[#1B2A41]/50 tracking-wide uppercase">Email Address</label>
                    <Input
                        value={user?.email || ""}
                        disabled
                        className="bg-[#1B2A41]/5 border-[#1B2A41]/15 text-[#1B2A41]/80 font-medium text-sm rounded-xl h-11 focus-visible:ring-0 cursor-not-allowed"
                    />
                </div>

                <div className="space-y-1.5 md:col-span-2">
                    <label className="text-xs font-bold text-[#1B2A41]/50 tracking-wide uppercase">System Authorization Role</label>
                    <div className="relative flex items-center">
                        <Input
                            value={user?.role || "CUSTOMER"}
                            disabled
                            className="bg-[#1B2A41]/5 border-[#1B2A41]/15 text-[#1B2A41]/80 font-bold text-xs tracking-wider rounded-xl h-11 pl-10 focus-visible:ring-0 uppercase cursor-not-allowed"
                        />
                        <ShieldAlert className="w-4 h-4 text-[#1B2A41]/40 absolute left-3.5" />
                    </div>
                </div>
            </div>
        </div>
    );
}