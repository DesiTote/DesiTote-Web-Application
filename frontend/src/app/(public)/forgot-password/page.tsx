"use client";

import { useState, useTransition, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, ArrowLeft } from "lucide-react";
import { z } from "zod";

import {
    useForgotPassword,
    useVerifyOtp,
    useSendOtp,
} from "@/hooks/customer/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { emailSchema, otpSchema, resetSchema } from "@/schemas/customer/auth.scheama";
import { PasswordStrength } from "@/components/customer/auth/PasswordStrength";


type EmailForm = z.infer<typeof emailSchema>;
type OtpForm = z.infer<typeof otpSchema>;
type ResetForm = z.infer<typeof resetSchema>;

type Step = "email" | "otp" | "reset";

const STEP_META: Record<Step, { title: string; subtitle: string }> = {
    email: {
        title: "Forgot Password? 🔑",
        subtitle: "Enter your email and we’ll send you a reset code",
    },
    otp: {
        title: "Check Your Inbox 📩",
        subtitle: "Enter the 6-digit code we sent you",
    },
    reset: {
        title: "Set New Password 🔒",
        subtitle: "Choose a new password for your account",
    },
};

const DEFAULT_RESEND_COOLDOWN = 30;  

export default function ForgotPasswordPage() {
    const router = useRouter();
    const [, startNavigation] = useTransition();

    const [step, setStep] = useState<Step>("email");
    const [email, setEmail] = useState("");
    const [otpValue, setOtpValue] = useState("");

    const [showPassword, setShowPassword] = useState(false);
    const [showConfirmPassword, setShowConfirmPassword] = useState(false);

    // ---- RESEND COOLDOWN TIMER ------------------------------------------
    const [resendCooldown, setResendCooldown] = useState(0);
    const cooldownIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

    const startResendCooldown = (seconds: number) => {
        if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
        setResendCooldown(seconds);
        cooldownIntervalRef.current = setInterval(() => {
            setResendCooldown((prev) => {
                if (prev <= 1) {
                    if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
                    return 0;
                }
                return prev - 1;
            });
        }, 1000);
    };

    useEffect(() => {
        return () => {
            if (cooldownIntervalRef.current) clearInterval(cooldownIntervalRef.current);
        };
    }, []);

    const { mutate: sendOtp, isPending: isSendingOtp } = useSendOtp();
    const { mutate: verifyOtp, isPending: isVerifyingOtp } = useVerifyOtp();
    const { mutate: forgotPassword, isPending: isResetting } = useForgotPassword();

    // ---- STEP 1: EMAIL ------------------------------------------------
    const emailForm = useForm<EmailForm>({
        resolver: zodResolver(emailSchema),
    });

    const onSubmitEmail = (data: EmailForm) => {
        const email = data.email;
        sendOtp({ email, type: "forgot" }, {
            onSuccess: (res: any) => {
                toast.success(res?.data?.message || "If this email registered, we've sent a verification OTP");
                startResendCooldown(res?.data?.resendAvailableIn ?? DEFAULT_RESEND_COOLDOWN);
                if (res?.data?.alreadyVerified) {
                    return;
                }
                setEmail(data.email);
            },
            onError: (err: any) => {
                toast.success(err?.response?.data?.message || "If this email registered, we've sent a verification OTP");
                // Same UX regardless of whether the email actually exists —
                // still start the cooldown so the button behaves identically.
                startResendCooldown(err?.response?.data?.resendAvailableIn ?? DEFAULT_RESEND_COOLDOWN);
            },
            onSettled: () => {
                setEmail(data.email);
                setStep("otp");
            }
        });
    };

    // ---- STEP 2: OTP ----------------------------------------------------
    const otpForm = useForm<OtpForm>({
        resolver: zodResolver(otpSchema),
    });

    const onSubmitOtp = (data: OtpForm) => {
        verifyOtp(
            { email, otp: data.otp, type: "forgot" },
            {
                onSuccess: (res: any) => {
                    toast.success(res?.data?.message || "Code verified");
                    setOtpValue(data.otp);
                    setStep("reset");
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || "Invalid or expired code");
                },
            }
        );
    };

    const handleResendOtp = () => {
        if (!email || resendCooldown > 0) return;
        sendOtp(
            { email, type: "forgot" },
            {
                onSuccess: (res: any) => {
                    toast.success(res?.data?.message || "New code sent");
                    startResendCooldown(res?.data?.resendAvailableIn ?? DEFAULT_RESEND_COOLDOWN);
                    if (res.data.alreadyVerified) {
                        setStep("reset")
                        return;
                    }
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || "Couldn't resend code");
                    startResendCooldown(err?.response?.data?.resendAvailableIn ?? DEFAULT_RESEND_COOLDOWN);
                },
            }
        );
    };

    // ---- STEP 3: RESET PASSWORD ----------------------------------------
    const resetForm = useForm<ResetForm>({
        resolver: zodResolver(resetSchema),
    });

    const password = resetForm.watch("password");

    const onSubmitReset = (data: ResetForm) => {
        forgotPassword(
            { email, otp: otpValue, password: data.password },
            {
                onSuccess: (res: any) => {
                    toast.success(res?.data?.message || "Password reset successfully");
                    startNavigation(() => router.push("/login"));
                },
                onError: (err: any) => {
                    toast.error(err?.response?.data?.message || "Couldn't reset password");
                },
            }
        );
    };

    const isPending = isSendingOtp || isVerifyingOtp || isResetting;
    const meta = STEP_META[step];

    return (
        <div className="w-full min-h-screen flex items-center justify-center px-4 relative overflow-hidden antialiased font-body bg-[#F5EEDE]">

            <Card className="w-full max-w-md rounded-[28px] border border-[#1B2A41]/10 bg-[#FBF8F1] shadow-xl relative z-10 p-2 sm:p-4">

                <CardHeader className="space-y-1.5 pb-4">
                    {/* BACK NAVIGATION */}
                    <button
                        type="button"
                        onClick={() => {
                            if (step === "email") router.push("/login");
                            else if (step === "otp") setStep("email");
                            else setStep("otp");
                        }}
                        className="inline-flex items-center gap-1 text-[11px] font-bold text-[#1B2A41]/40 hover:text-[#1B2A41] transition-all cursor-pointer mb-1 w-fit"
                    >
                        <ArrowLeft size={13} className="stroke-[2.5]" />
                        Back
                    </button>

                    <CardTitle className="font-heading text-2xl sm:text-3xl font-black text-center text-[#1B2A41] tracking-tight">
                        {meta.title}
                    </CardTitle>
                    <p className="text-center text-xs sm:text-sm font-medium text-[#1B2A41]/60">
                        {meta.subtitle}
                    </p>

                    {/* STEP INDICATOR */}
                    <div className="flex items-center justify-center gap-1.5 pt-1">
                        {(["email", "otp", "reset"] as Step[]).map((s) => (
                            <span
                                key={s}
                                className={`h-1.5 rounded-full transition-all ${s === step
                                    ? "w-6 bg-[#C6941E]"
                                    : "w-1.5 bg-[#1B2A41]/15"
                                    }`}
                            />
                        ))}
                    </div>
                </CardHeader>

                <CardContent>
                    {/* ---------------- STEP 1: EMAIL ---------------- */}
                    {step === "email" && (
                        <form onSubmit={emailForm.handleSubmit(onSubmitEmail)} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-[#1B2A41]/70 tracking-wide uppercase pl-0.5">
                                    Email Address
                                </Label>
                                <Input
                                    type="email"
                                    {...emailForm.register("email")}
                                    placeholder="name@example.com"
                                    autoFocus
                                    className={`h-11 px-4 rounded-xl border-[#1B2A41]/15 text-sm font-medium text-[#1B2A41] placeholder:text-[#1B2A41]/35 bg-white focus-visible:ring-2 focus-visible:ring-[#C6941E] focus-visible:ring-offset-0 transition-all ${emailForm.formState.errors.email ? "border-rose-300 focus-visible:ring-rose-400" : ""
                                        }`}
                                />
                                {emailForm.formState.errors.email && (
                                    <p className="text-rose-500 text-[11px] font-bold pl-1">
                                        {emailForm.formState.errors.email.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-11 bg-[#C6941E] hover:bg-[#A87A14] text-[#1B2A41] hover:text-[#FBF8F1] font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer mt-2 flex items-center justify-center gap-2"
                            >
                                {isSendingOtp ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Sending Code...</span>
                                    </>
                                ) : (
                                    "Send Reset Code"
                                )}
                            </Button>
                        </form>
                    )}

                    {/* ---------------- STEP 2: OTP ---------------- */}
                    {step === "otp" && (
                        <form onSubmit={otpForm.handleSubmit(onSubmitOtp)} className="space-y-4">
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-[#1B2A41]/70 tracking-wide uppercase pl-0.5">
                                    Verification Code
                                </Label>
                                <Input
                                    {...otpForm.register("otp")}
                                    type="text"
                                    inputMode="numeric"
                                    maxLength={6}
                                    autoFocus
                                    placeholder="000000"
                                    className={`h-12 px-4 rounded-xl border-[#1B2A41]/15 text-lg font-black tracking-[0.5em] text-center text-[#1B2A41] placeholder:text-[#1B2A41]/25 placeholder:tracking-[0.5em] bg-white focus-visible:ring-2 focus-visible:ring-[#C6941E] focus-visible:ring-offset-0 transition-all ${otpForm.formState.errors.otp ? "border-rose-300 focus-visible:ring-rose-400" : ""
                                        }`}
                                />
                                {otpForm.formState.errors.otp && (
                                    <p className="text-rose-500 text-[11px] font-bold pl-1">
                                        {otpForm.formState.errors.otp.message}
                                    </p>
                                )}
                                <p className="text-[11px] font-medium text-[#1B2A41]/40 pl-1">
                                    Code sent to <span className="text-[#1B2A41] font-bold">{email}</span>
                                </p>
                            </div>

                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-11 bg-[#C6941E] hover:bg-[#A87A14] text-[#1B2A41] hover:text-[#FBF8F1] font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer mt-2 flex items-center justify-center gap-2"
                            >
                                {isVerifyingOtp ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Verifying Code...</span>
                                    </>
                                ) : (
                                    "Verify Code"
                                )}
                            </Button>

                            <button
                                type="button"
                                onClick={handleResendOtp}
                                disabled={isPending || resendCooldown > 0}
                                className="w-full text-center text-xs font-bold text-[#7A2A28] hover:underline underline-offset-2 transition-all cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:no-underline"
                            >
                                {resendCooldown > 0
                                    ? `Resend code in ${resendCooldown}s`
                                    : "Didn’t get it? Resend Code"}
                            </button>
                        </form>
                    )}

                    {/* ---------------- STEP 3: RESET PASSWORD ---------------- */}
                    {step === "reset" && (
                        <form onSubmit={resetForm.handleSubmit(onSubmitReset)} className="space-y-4">
                            {/* NEW PASSWORD */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-[#1B2A41]/70 tracking-wide uppercase pl-0.5">
                                    New Password
                                </Label>
                                <div className="relative flex items-center">
                                    <Input
                                        {...resetForm.register("password")}
                                        type={showPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        autoFocus
                                        placeholder="Enter a new password"
                                        className={`h-11 pl-4 pr-11 w-full rounded-xl border-[#1B2A41]/15 text-sm font-medium text-[#1B2A41] placeholder:text-[#1B2A41]/35 bg-white focus-visible:ring-2 focus-visible:ring-[#C6941E] focus-visible:ring-offset-0 transition-all ${resetForm.formState.errors.password ? "border-rose-300 focus-visible:ring-rose-400" : ""
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-3.5 p-1 text-[#1B2A41]/40 hover:text-[#1B2A41] rounded-lg cursor-pointer"
                                    >
                                        {showPassword ? <EyeOff size={16} className="stroke-[2.5]" /> : <Eye size={16} className="stroke-[2.5]" />}
                                    </button>
                                </div>
                                {resetForm.formState.errors.password && (
                                    // Bug fix: this was text-[#FF407D] — a leftover pre-rebrand
                                    // pink, inconsistent with every other error message on this
                                    // page (all rose-500).
                                    <p className="text-rose-500 text-xs font-bold ml-1">
                                        Min 6 characters, with uppercase, lowercase, a number & a special character (@#$!%*?&)
                                    </p>

                                )}
                                <PasswordStrength password={password ?? ""} />
                            </div>

                            {/* CONFIRM PASSWORD */}
                            <div className="space-y-1.5">
                                <Label className="text-xs font-bold text-[#1B2A41]/70 tracking-wide uppercase pl-0.5">
                                    Confirm Password
                                </Label>
                                <div className="relative flex items-center">
                                    <Input
                                        {...resetForm.register("confirmPassword")}
                                        type={showConfirmPassword ? "text" : "password"}
                                        autoComplete="new-password"
                                        placeholder="Re-enter your new password"
                                        className={`h-11 pl-4 pr-11 w-full rounded-xl border-[#1B2A41]/15 text-sm font-medium text-[#1B2A41] placeholder:text-[#1B2A41]/35 bg-white focus-visible:ring-2 focus-visible:ring-[#C6941E] focus-visible:ring-offset-0 transition-all ${resetForm.formState.errors.confirmPassword ? "border-rose-300 focus-visible:ring-rose-400" : ""
                                            }`}
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                                        className="absolute right-3.5 p-1 text-[#1B2A41]/40 hover:text-[#1B2A41] rounded-lg cursor-pointer"
                                    >
                                        {showConfirmPassword ? <EyeOff size={16} className="stroke-[2.5]" /> : <Eye size={16} className="stroke-[2.5]" />}
                                    </button>
                                </div>
                                {resetForm.formState.errors.confirmPassword && (
                                    <p className="text-rose-500 text-[11px] font-bold pl-1">
                                        {resetForm.formState.errors.confirmPassword.message}
                                    </p>
                                )}
                            </div>

                            <Button
                                type="submit"
                                disabled={isPending}
                                className="w-full h-11 bg-[#C6941E] hover:bg-[#A87A14] text-[#1B2A41] hover:text-[#FBF8F1] font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer mt-2 flex items-center justify-center gap-2"
                            >
                                {isResetting ? (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span>Resetting Password...</span>
                                    </>
                                ) : (
                                    "Reset Password"
                                )}
                            </Button>
                        </form>
                    )}

                    <p className="text-xs sm:text-sm text-center text-[#1B2A41]/60 font-medium mt-6">
                        Remembered your password?{" "}
                        <Link
                            href="/login"
                            className="text-[#7A2A28] font-bold cursor-pointer hover:underline underline-offset-4"
                        >
                            Back to Login
                        </Link>
                    </p>
                </CardContent>
            </Card>
        </div>
    );
}