"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2, X } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useResetTeamMemberPassword } from "@/hooks/admin/useTeam";
import { adminResetPasswordSchema } from "@/schemas/admin/team.schema";


type ResetPasswordForm = z.infer<typeof adminResetPasswordSchema>;

export default function ResetTeamMemberPasswordModal({
    userId,
    userEmail,
    onClose,
}: {
    userId: string;
    userEmail: string;
    onClose: () => void;
}) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { mutate: resetPassword, isPending } = useResetTeamMemberPassword();

    const form = useForm<ResetPasswordForm>({
        resolver: zodResolver(adminResetPasswordSchema),
    });

    const onSubmit = (data: ResetPasswordForm) => {
        resetPassword(
            { userId, password: data.password },
            { onSuccess: () => onClose() }
        );
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-6 shadow-lg">
                <div className="mb-6 flex items-start justify-between">
                    <div>
                        <h2 className="text-lg font-bold text-slate-900">Reset Password</h2>
                        <p className="text-xs font-medium text-slate-500 sm:text-sm">
                            Setting a new password for <span className="font-semibold">{userEmail}</span>
                        </p>
                    </div>
                    <button onClick={onClose} className="rounded-lg p-1 text-slate-400 hover:text-slate-600">
                        <X size={18} />
                    </button>
                </div>

                <div className="mb-6 h-px bg-slate-100" />

                <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                    <div className="space-y-1.5">
                        <Label className="pl-0.5 text-xs font-bold uppercase tracking-wide text-slate-700">
                            New Password
                        </Label>
                        <div className="relative flex items-center">
                            <Input
                                {...form.register("password")}
                                type={showPassword ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Set a new password"
                                className={`h-11 w-full rounded-xl border-slate-200 pl-4 pr-11 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-0 ${
                                    form.formState.errors.password ? "border-rose-300 focus-visible:ring-rose-400" : ""
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowPassword(!showPassword)}
                                className="absolute right-3.5 rounded-lg p-1 text-slate-400 hover:text-slate-600"
                            >
                                {showPassword ? <EyeOff size={16} className="stroke-[2.5]" /> : <Eye size={16} className="stroke-[2.5]" />}
                            </button>
                        </div>
                        {form.formState.errors.password && (
                            <p className="pl-1 text-[11px] font-bold text-rose-500">
                                {form.formState.errors.password.message}
                            </p>
                        )}
                    </div>

                    <div className="space-y-1.5">
                        <Label className="pl-0.5 text-xs font-bold uppercase tracking-wide text-slate-700">
                            Confirm Password
                        </Label>
                        <div className="relative flex items-center">
                            <Input
                                {...form.register("confirmPassword")}
                                type={showConfirm ? "text" : "password"}
                                autoComplete="new-password"
                                placeholder="Re-enter the password"
                                className={`h-11 w-full rounded-xl border-slate-200 pl-4 pr-11 text-sm font-medium text-slate-800 placeholder:text-slate-400 focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-0 ${
                                    form.formState.errors.confirmPassword
                                        ? "border-rose-300 focus-visible:ring-rose-400"
                                        : ""
                                }`}
                            />
                            <button
                                type="button"
                                onClick={() => setShowConfirm(!showConfirm)}
                                className="absolute right-3.5 rounded-lg p-1 text-slate-400 hover:text-slate-600"
                            >
                                {showConfirm ? <EyeOff size={16} className="stroke-[2.5]" /> : <Eye size={16} className="stroke-[2.5]" />}
                            </button>
                        </div>
                        {form.formState.errors.confirmPassword && (
                            <p className="pl-1 text-[11px] font-bold text-rose-500">
                                {form.formState.errors.confirmPassword.message}
                            </p>
                        )}
                    </div>

                    <div className="flex items-center gap-2 pt-2">
                        <Button
                            type="submit"
                            disabled={isPending}
                            className="flex h-11 flex-1 items-center justify-center gap-2 rounded-xl bg-rose-500 text-sm font-bold text-white shadow-sm hover:bg-rose-600"
                        >
                            {isPending ? (
                                <>
                                    <Loader2 className="h-4 w-4 animate-spin text-white/80" />
                                    <span>Resetting...</span>
                                </>
                            ) : (
                                "Reset Password"
                            )}
                        </Button>
                        <Button
                            type="button"
                            onClick={onClose}
                            className="h-11 rounded-xl border border-slate-200 bg-white text-sm font-bold text-slate-700 hover:bg-slate-50"
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </div>
        </div>
    );
}