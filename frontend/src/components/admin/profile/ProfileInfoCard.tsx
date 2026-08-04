// components/admin/profile/ProfileInfoCard.tsx
"use client";

import { useMe } from "@/hooks/customer/useAuth"; // reusing the existing hook — no new endpoint needed

export default function ProfileInfoCard() {
    const { data: user, isLoading, isError } = useMe();

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">Account Info</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Your account details. Contact another admin if any of this needs to change.
                </p>
            </div>

            <div className="h-px bg-slate-100 mb-6" />

            {isError ? (
                <p className="text-sm text-slate-500">Couldn't load your profile.</p>
            ) : isLoading || !user ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-10 w-full animate-pulse rounded-xl bg-slate-100" />
                    ))}
                </div>
            ) : (
                <div className="space-y-4 max-w-md">
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Full Name</p>
                        <p className="text-sm font-medium text-slate-800">{user.fullName}</p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Email</p>
                        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                            {user.email}
                            {!user.emailVerified && (
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                                    Unverified
                                </span>
                            )}
                        </p>
                    </div>
                    <div>
                        <p className="text-xs font-bold uppercase tracking-wide text-slate-500">Mobile Number</p>
                        <p className="flex items-center gap-2 text-sm font-medium text-slate-800">
                            {user.mobileNumber ?? "—"}
                            {user.mobileNumber && !user.mobileVerified && (
                                <span className="rounded-full bg-amber-50 px-2 py-0.5 text-[11px] font-bold text-amber-700">
                                    Unverified
                                </span>
                            )}
                        </p>
                    </div>
                </div>
            )}
        </div>
    );
}