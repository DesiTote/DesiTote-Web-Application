"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { useSendOtp, useVerifyOtp } from "@/hooks/customer/useAuth";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useQueryClient } from "@tanstack/react-query";

export default function VerifyEmailPage() {
    const router = useRouter();
    const [isPendingNavigation, startTransition] = useTransition();
    const { user, loading: isAuthLoading } = useAuth();
    const email = user?.email ?? "";

    const [otp, setOtp] = useState("");
    const [cooldown, setCooldown] = useState(0);
    const [isLocalSending, setIsLocalSending] = useState(false);
    const [isVerifiedSuccess, setIsVerifiedSuccess] = useState(false);

    const hasSentInitialOtp = useRef(false);
    const queryClient = useQueryClient();

    const { mutateAsync: sendOtpAsync } = useSendOtp();
    const { mutate: verifyOtp, isPending: isVerifying } = useVerifyOtp();

    // Auto-send OTP on mount
    useEffect(() => {
        if (!email || hasSentInitialOtp.current) return;
        hasSentInitialOtp.current = true;

        handleSendOtp(email);
    }, [email]);

    // Cooldown timer
    useEffect(() => {
        if (cooldown <= 0) return;
        const id = setInterval(() => setCooldown((c) => Math.max(0, c - 1)), 1000);
        return () => clearInterval(id);
    }, [cooldown]);

    async function handleSendOtp(targetEmail: string) {
        if (!targetEmail || isLocalSending || isVerifiedSuccess) return;

        setIsLocalSending(true);
        try {
            const res: any = await sendOtpAsync({ email: targetEmail, type: "verifyEmail" });
            const payload = res?.data ?? res;

            if (payload?.alreadyVerified) {
                toast.success("Your email is already verified.");
                startTransition(() => {
                    router.replace("/");
                });
                return;
            }

            toast.success(payload?.message || "Verification code sent to your email");
            setCooldown(payload?.resendAvailableIn ?? 30);
        } catch (err: any) {
            toast.error(
                err?.response?.data?.message || err?.message || "Couldn't send verification code"
            );
        } finally {
            setIsLocalSending(false);
        }
    }

    function handleVerify() {
        if (otp.length < 6) {
            toast.error("Enter the 6 digit code sent to your email");
            return;
        }

        verifyOtp(
            { email, otp, type: "verifyEmail" },
            {
                onSuccess: async () => {
                    setIsVerifiedSuccess(true);
                    toast.success("Email verified! Taking you to your dashboard...");

                    await queryClient.invalidateQueries({ queryKey: ["me"] });

                    // Transition to dashboard and keep UI disabled during navigation
                    startTransition(() => {
                        window.location.href = "/dashboard";
                    });
                },
                onError: (err: any) => {
                    setIsVerifiedSuccess(false);
                    toast.error(err?.response?.data?.message || "Invalid or expired code");
                },
            }
        );
    }

    // Consolidated disabled flags
    const isBusy = isVerifying || isPendingNavigation || isVerifiedSuccess;

    if (isAuthLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center p-4">
                <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
            </div>
        );
    }

    return (
        <div className="flex min-h-screen items-center justify-center p-4">
            <div className="w-full max-w-md rounded-2xl border border-slate-100 bg-white p-8 shadow-sm">
                <h1 className="text-lg font-bold text-slate-900">Verify your email</h1>
                <p className="mt-1 text-sm font-medium text-slate-500">
                    We've sent a verification code to <span className="font-semibold">{email}</span>. Enter it below to continue.
                </p>

                <div className="mt-6 space-y-4">
                    <Input
                        value={otp}
                        disabled={isBusy}
                        onChange={(e) => setOtp(e.target.value.replace(/\D/g, ""))}
                        placeholder="Enter verification code"
                        maxLength={6}
                        className="h-12 rounded-xl border-slate-200 text-center text-lg font-bold tracking-widest disabled:opacity-50"
                    />

                    <Button
                        onClick={handleVerify}
                        disabled={isBusy || isLocalSending}
                        className="flex h-11 w-full items-center justify-center gap-2 rounded-xl bg-rose-500 text-sm font-bold text-white hover:bg-rose-600 disabled:opacity-50"
                    >
                        {isBusy ? (
                            <>
                                <Loader2 className="h-4 w-4 animate-spin text-white/80" />
                                <span>{isVerifiedSuccess ? "Redirecting..." : "Verifying..."}</span>
                            </>
                        ) : (
                            "Verify Email"
                        )}
                    </Button>

                    <button
                        type="button"
                        onClick={() => handleSendOtp(email)}
                        disabled={isBusy || isLocalSending || cooldown > 0}
                        className="w-full cursor-pointer text-center text-xs font-bold text-slate-500 disabled:opacity-50"
                    >
                        {isLocalSending
                            ? "Sending code..."
                            : cooldown > 0
                                ? `Resend code in ${cooldown}s`
                                : "Resend code"}
                    </button>
                </div>
            </div>
        </div>
    );
}