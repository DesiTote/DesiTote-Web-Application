"use client";

import { useState } from "react";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";


import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { createTeamMemberSchema } from "@/schemas/admin/team.schema";
import { useCreateTeamMember } from "@/hooks/admin/useTeam";


type CreateTeamMemberForm = z.infer<typeof createTeamMemberSchema>;

export default function AddTeamMemberForm({ onSuccess }: { onSuccess?: () => void }) {
    const [showPassword, setShowPassword] = useState(false);
    const [showConfirm, setShowConfirm] = useState(false);

    const { mutate: createTeamMember, isPending } = useCreateTeamMember();

    const form = useForm<CreateTeamMemberForm>({
        resolver: zodResolver(createTeamMemberSchema),
    });

    const onSubmit = (data: CreateTeamMemberForm) => {
        createTeamMember(
            { fullName: data.fullName, email: data.email, mobileNumber: data.mobileNumber, password: data.password },
            {
                onSuccess: () => {
                    form.reset();
                    onSuccess?.();
                },
            }
        );
    };

    return (
        <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6">
            <div className="mb-6">
                <h2 className="text-lg font-bold text-slate-900">Add Team Member</h2>
                <p className="text-xs sm:text-sm text-slate-500 font-medium">
                    Create an admin account and share the password with them directly. They should change it
                    after first login.
                </p>
            </div>

            <div className="h-px bg-slate-100 mb-6" />

            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 max-w-md">
                {/* FULL NAME */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 tracking-wide uppercase pl-0.5">
                        Full Name
                    </Label>
                    <Input
                        {...form.register("fullName")}
                        placeholder="e.g. Priya Sharma"
                        className={`h-11 pl-4 w-full rounded-xl border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 bg-white focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-0 transition-all ${
                            form.formState.errors.fullName ? "border-rose-300 focus-visible:ring-rose-400" : ""
                        }`}
                    />
                    {form.formState.errors.fullName && (
                        <p className="text-rose-500 text-[11px] font-bold pl-1">
                            {form.formState.errors.fullName.message}
                        </p>
                    )}
                </div>

                {/* EMAIL */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 tracking-wide uppercase pl-0.5">
                        Email
                    </Label>
                    <Input
                        {...form.register("email")}
                        type="email"
                        autoComplete="email"
                        placeholder="teammate@example.com"
                        className={`h-11 pl-4 w-full rounded-xl border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 bg-white focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-0 transition-all ${
                            form.formState.errors.email ? "border-rose-300 focus-visible:ring-rose-400" : ""
                        }`}
                    />
                    {form.formState.errors.email && (
                        <p className="text-rose-500 text-[11px] font-bold pl-1">
                            {form.formState.errors.email.message}
                        </p>
                    )}
                </div>

                {/* MOBILE NUMBER */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 tracking-wide uppercase pl-0.5">
                        Mobile Number
                    </Label>
                    <Input
                        {...form.register("mobileNumber")}
                        type="tel"
                        autoComplete="tel"
                        placeholder="10-digit mobile number"
                        maxLength={10}
                        className={`h-11 pl-4 w-full rounded-xl border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 bg-white focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-0 transition-all ${
                            form.formState.errors.mobileNumber ? "border-rose-300 focus-visible:ring-rose-400" : ""
                        }`}
                    />
                    {form.formState.errors.mobileNumber && (
                        <p className="text-rose-500 text-[11px] font-bold pl-1">
                            {form.formState.errors.mobileNumber.message}
                        </p>
                    )}
                </div>

                {/* PASSWORD */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 tracking-wide uppercase pl-0.5">
                        Initial Password
                    </Label>
                    <div className="relative flex items-center">
                        <Input
                            {...form.register("password")}
                            type={showPassword ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Set an initial password"
                            className={`h-11 pl-4 pr-11 w-full rounded-xl border-slate-200 text-sm font-medium text-slate-800 placeholder:text-slate-400 bg-white focus-visible:ring-2 focus-visible:ring-rose-400 focus-visible:ring-offset-0 transition-all ${
                                form.formState.errors.password ? "border-rose-300 focus-visible:ring-rose-400" : ""
                            }`}
                        />
                        <button
                            type="button"
                            onClick={() => setShowPassword(!showPassword)}
                            className="absolute right-3.5 p-1 text-slate-400 hover:text-slate-600 rounded-lg cursor-pointer"
                        >
                            {showPassword ? <EyeOff size={16} className="stroke-[2.5]" /> : <Eye size={16} className="stroke-[2.5]" />}
                        </button>
                    </div>
                    {form.formState.errors.password && (
                        <p className="text-rose-500 text-[11px] font-bold pl-1">
                            {form.formState.errors.password.message}
                        </p>
                    )}
                </div>

                {/* CONFIRM PASSWORD */}
                <div className="space-y-1.5">
                    <Label className="text-xs font-bold text-slate-700 tracking-wide uppercase pl-0.5">
                        Confirm Password
                    </Label>
                    <div className="relative flex items-center">
                        <Input
                            {...form.register("confirmPassword")}
                            type={showConfirm ? "text" : "password"}
                            autoComplete="new-password"
                            placeholder="Re-enter the password"
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
                            <span>Adding...</span>
                        </>
                    ) : (
                        "Add Team Member"
                    )}
                </Button>
            </form>
        </div>
    );
}