"use client";

import { useTeamMembers } from "@/hooks/admin/useTeam";

export default function TeamMembersList() {
    const { data, isLoading, isError, refetch } = useTeamMembers();

    return (
        <div className="rounded-2xl border border-slate-100 bg-white p-6 shadow-sm">
            <h2 className="mb-1 text-lg font-bold text-slate-900">Team Members</h2>
            <p className="mb-6 text-xs font-medium text-slate-500 sm:text-sm">
                Everyone with admin access to this dashboard. Each member manages their own password from
                their profile — you can't reset it for them here.
            </p>

            {isError ? (
                <div className="flex flex-col items-center gap-2 py-10">
                    <p className="text-sm text-slate-500">Couldn't load team members.</p>
                    <button onClick={() => refetch()} className="text-sm font-bold text-rose-500 underline">
                        Retry
                    </button>
                </div>
            ) : isLoading || !data ? (
                <div className="space-y-3">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <div key={i} className="h-14 w-full animate-pulse rounded-xl bg-slate-100" />
                    ))}
                </div>
            ) : (
                <div className="divide-y divide-slate-100">
                    {data.map((member) => (
                        <div key={member._id} className="flex items-center justify-between py-4">
                            <div>
                                <p className="text-sm font-bold text-slate-800">{member.fullName}</p>
                                <p className="text-xs text-slate-500">{member.email}</p>
                                <p className="text-xs text-slate-400">{member.mobileNumber}</p>
                                <p className="mt-1 text-[11px] text-slate-400">
                                    Added by{" "}
                                    <span className="font-semibold text-slate-500">
                                        {member.addedBy ? member.addedBy.fullName : "—"}
                                    </span>
                                </p>
                            </div>

                            <div className="flex items-center gap-2">
                                {!member.emailVerified && (
                                    <span className="rounded-full bg-amber-50 px-2.5 py-1 text-xs font-bold text-amber-700">
                                        Email unverified
                                    </span>
                                )}
                                {member.isAccountBlocked && (
                                    <span className="rounded-full bg-red-50 px-2.5 py-1 text-xs font-bold text-red-700">
                                        Blocked
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}