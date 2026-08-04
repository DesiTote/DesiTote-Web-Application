"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useChangePassword } from "@/hooks/customer/useAuth";
import { changePasswordSchema } from "@/schemas/customer/auth.scheama";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { PasswordStrength } from "@/components/customer/auth/PasswordStrength";

type ChangePasswordForm = z.infer<typeof changePasswordSchema>;

export default function ChangePasswordTab() {
    const [showCurrent, setShowCurrent] = useState(false);
    const [showNew, setShowNew] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { mutate: changePassword, isPending } = useChangePassword();

    const form = useForm<ChangePasswordForm>({
        resolver: zodResolver(changePasswordSchema),
    });
    const password = form.watch("password")

    const onSubmit = (data: ChangePasswordForm) => {
        changePassword(
            { currentPassword: data.currentPassword, password: data.password },
            {
                onSuccess: (res: any) => {
                    toast.success(res?.data?.message || "Password updated successfully");
                    form.reset();
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || "Couldn't update password");
                },
            }
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">Change Password</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    You can only change your own password. You'll stay logged in on this device.
                </p>
            </div>

            <div className="h-px bg-slate-100 mb-6" />

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                {/* CURRENT PASSWORD */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 tracking-wide uppercase pl-0.5">
                        Current Password
                    </Label>
                    <div className="relative flex items-center">
                        <Input
                            {...form.register("currentPassword")}
                            type={showCurrent ? "text" : "password"}
                            autoComplete="current-password"
                            placeholder="Enter current password"
                            className={`h-11 pl-4 pr-11 w-full rounded-xl border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 bg-white focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-0 transition-all ${
                                form.formState.errors.currentPassword ? "border-rose-300 focus-visible:ring-rose-400" : ""
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowCurrent(!showCurrent)}
                            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                        >
                            {showCurrent ? <EyeOff size={16} className="stroke-[2.5]" /> : <Eye size={16} className="stroke-[2.5]" />}
                        </button>
                    </div>
                    {form.formState.errors.currentPassword && (
                        <p className="text-rose-500 text-[11px] font-bold pl-1">
                            {form.formState.errors.currentPassword.message}
                        </p>
                    )}
                </div>

                {/* NEW PASSWORD */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 tracking-wide uppercase pl-0.5">
                        New Password
                    </Label>
                    <div className="relative flex items-center">
                        <Input
                            {...form.register("password")}
                            type={showNew ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Enter a new password"
                            className={`h-11 pl-4 pr-11 w-full rounded-xl border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 bg-white focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-0 transition-all ${
                                form.formState.errors.password ? "border-rose-300 focus-visible:ring-rose-400" : ""
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowNew(!showNew)}
                            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                        >
                            {showNew ? <EyeOff size={16} className="stroke-[2.5]" /> : <Eye size={16} className="stroke-[2.5]" />}
                        </button>
                    </div>
                    {form.formState.errors.password && (
                        <p className="text-rose-500 text-xs font-bold ml-1">
                            {form.formState.errors.password.message}
                        </p>
                    )}
                    <PasswordStrength password={password??""} />
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 tracking-wide uppercase pl-0.5">
                        Confirm New Password
                    </Label>
                    <div className="relative flex items-center">
                        <Input
                            {...form.register("confirmPassword")}
                            type={showConfirm ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Re-enter your new password"
                            className={`h-11 pl-4 pr-11 w-full rounded-xl border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 bg-white focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-0 transition-all ${
                                form.formState.errors.confirmPassword ? "border-rose-300 focus-visible:ring-rose-400" : ""
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowConfirm(!showConfirm)}
                            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                        >
                            {showConfirm ? <EyeOff size={16} className="stroke-[2.5]" /> : <Eye size={16} className="stroke-[2.5]" />}
                        </button>
                    </div>
                    {form.formState.errors.confirmPassword && (
                        <p className="text-rose-500 text-[11px] font-bold pl-1">
                            {form.formState.errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                <Button
                    type="submit"
                    disabled={isPending}
                    className="h-11 px-6 bg-rose-500 hover:bg-rose-600 text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer mt-2 flex items-center justify-center gap-2"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin text-white/80" />
                            <span>Updating...</span>
                        </>
                    ) : (
                        "Update Password"
                    )}
                </Button>
            </form>
        </div>
    );
}