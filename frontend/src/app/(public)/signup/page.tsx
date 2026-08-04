"use client";

import { useEffect, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import { z } from "zod";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { useForm } from "react-hook-form";
import { registerSchema } from "@/schemas/customer/auth.scheama";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  useRegister,
  useSendOtp,
  useVerifyOtp,
} from "@/hooks/customer/useAuth";

import { toast } from "sonner";
import { InputOTPPattern } from "@/components/shared/InputOtp";
import { COLORS } from "@/constants/shared/theme";
import { PasswordStrength } from "@/components/customer/auth/PasswordStrength";


type FormData = z.infer<typeof registerSchema>;

export default function RegisterPage() {
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();

  const type = "register";

  const {
    register,
    handleSubmit,
    getValues,
    trigger,
    watch,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(registerSchema),
  });

  const password = watch("password");

  const { mutate, isPending } = useRegister();
  const { mutate: sendOtp, isPending: sendingOtp } = useSendOtp();
  const { mutate: verifyOtp, isPending: verifyingOtp } = useVerifyOtp();

  const [showPassword, setShowPassword] = useState(false);
  const [otpSent, setOtpSent] = useState(false);
  const [otpVerified, setOtpVerified] = useState(false);
  const [otp, setOtp] = useState("");
  const [resendTimer, setResendTimer] = useState(0);

  useEffect(() => {
    if (resendTimer <= 0) return;

    const interval = setInterval(() => {
      setResendTimer((prev) => (prev <= 1 ? 0 : prev - 1));
    }, 1000);

    return () => clearInterval(interval);
  }, [resendTimer]);

  const handleSendOtp = async () => {
    const email = getValues("email");

    if (!email) {
      return toast.error("Enter email first");
    }

    const isEmailValid = await trigger("email");

    if (!isEmailValid) {
      toast.error(errors.email?.message || "Enter a valid email");
      return;
    }

    sendOtp(
      { email, type },
      {
        onSuccess: (res: any) => {
          toast.success(res.data.message);

          if (res.data.alreadyVerified) {
            setOtpVerified(true);
            return;
          }

          setOtpSent(true);
          setResendTimer(30);
        },

        onError: (err: any) => {
          setOtpSent(false);
          toast.error(
            err?.response?.data?.message || "Failed to send OTP"
          );
        },
      }
    );
  };

  const handleVerifyOtp = () => {
    const email = getValues("email");

    if (otp.length !== 6) {
      return toast.error("Enter valid 6-digit OTP");
    }

    verifyOtp(
      { email, otp, type },
      {
        onSuccess: () => {
          toast.success("Email verified ✅");
          setOtpSent(false);
          setOtpVerified(true);
        },

        onError: (err: any) => {
          toast.error(
            err?.response?.data?.message || "Invalid OTP"
          );
        },
      }
    );
  };

  const onSubmit = (data: FormData) => {
    if (!otpVerified) {
      return toast.error("Please verify email first");
    }

    mutate(data, {
      onSuccess: (res: any) => {
        toast.success(res.data.message);

        startNavigation(() => router.push("/login"));
      },

      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message ||
            "Failed to create account"
        );
      },
    });
  };

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center px-4 py-10 relative overflow-hidden"
      style={{
        backgroundColor: COLORS.canvasCream,
      }}
    >
      {/* Register Card */}
      <Card
        className="w-full max-w-md rounded-[30px] relative z-10 overflow-hidden shadow-xl border"
        style={{
          backgroundColor: COLORS.navbarBg,
          borderColor: `${COLORS.inkNavy}18`,
        }}
      >
        {/* Top Accent */}
        <div
          className="h-1.5 w-full"
          style={{
            backgroundColor: COLORS.marigoldGold,
          }}
        />

        <CardHeader className="pt-8 pb-5 px-7 sm:px-8">
          <div className="text-center space-y-2">
            <p
              className="text-[10px] sm:text-xs uppercase tracking-[0.2em] font-bold"
              style={{
                color: COLORS.brickMaroon,
              }}
            >
              Create Your Account
            </p>

            <CardTitle
              className="text-3xl sm:text-4xl font-black tracking-tight"
              style={{
                color: COLORS.inkNavy,
              }}
            >
              Join DesiTotes
            </CardTitle>

            <p
              className="text-sm font-medium"
              style={{
                color: `${COLORS.inkNavy}80`,
              }}
            >
              Carry Culture. Carry You.
            </p>
          </div>
        </CardHeader>

        <CardContent className="px-7 sm:px-8 pb-8">
          <form
            onSubmit={handleSubmit(onSubmit)}
            className="space-y-4"
          >
            {/* Full Name */}
            <div className="space-y-1.5">
              <Label
                className="font-bold ml-1"
                style={{
                  color: COLORS.inkNavy,
                }}
              >
                Full Name
              </Label>

              <Input
                {...register("fullName")}
                placeholder="John Doe"
                className="h-12 rounded-xl font-medium bg-white transition-all"
                style={{
                  color: COLORS.inkNavy,
                  borderColor: errors.fullName
                    ? `${COLORS.brickMaroon}70`
                    : `${COLORS.inkNavy}18`,
                }}
              />

              {errors.fullName && (
                <p
                  className="text-xs font-bold ml-1"
                  style={{
                    color: COLORS.brickMaroon,
                  }}
                >
                  {errors.fullName.message}
                </p>
              )}
            </div>

            {/* Email + OTP */}
            <div className="space-y-1.5">
              <Label
                className="font-bold ml-1"
                style={{
                  color: COLORS.inkNavy,
                }}
              >
                Email Address
              </Label>

              <div className="flex items-center gap-2">
                <Input
                  type="email"
                  required
                  placeholder="name@example.com"
                  {...register("email")}
                  className="h-12 rounded-xl font-medium bg-white transition-all"
                  style={{
                    color: COLORS.inkNavy,
                    borderColor: errors.email
                      ? `${COLORS.brickMaroon}70`
                      : `${COLORS.inkNavy}18`,
                  }}
                />

                <Button
                  type="button"
                  onClick={handleSendOtp}
                  disabled={
                    sendingOtp ||
                    otpVerified ||
                    resendTimer > 0
                  }
                  className="h-12 px-4 rounded-xl font-bold text-white shadow-sm cursor-pointer hover:opacity-90 transition-all"
                  style={{
                    backgroundColor: otpVerified
                      ? COLORS.brickMaroon
                      : COLORS.inkNavy,
                  }}
                >
                  {sendingOtp
                    ? "..."
                    : otpVerified
                      ? "Verified"
                      : resendTimer > 0
                        ? `Resend ${resendTimer}s`
                        : otpSent
                          ? "Resend OTP"
                          : "OTP"}
                </Button>
              </div>

              {errors.email && (
                <p
                  className="text-xs font-bold ml-1"
                  style={{
                    color: COLORS.brickMaroon,
                  }}
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* OTP Verification */}
            {otpSent && (
              <div
                className="space-y-4 flex flex-col items-center p-5 rounded-2xl border animate-in fade-in slide-in-from-top-2"
                style={{
                  backgroundColor: COLORS.canvasCream,
                  borderColor: `${COLORS.marigoldGold}45`,
                }}
              >
                <Label
                  className="font-black uppercase text-[10px] tracking-widest"
                  style={{
                    color: COLORS.inkNavy,
                  }}
                >
                  Enter Verification Code
                </Label>

                <InputOTPPattern
                  value={otp}
                  onChange={setOtp}
                />

                <Button
                  type="button"
                  onClick={handleVerifyOtp}
                  disabled={verifyingOtp}
                  className="w-full cursor-pointer font-black rounded-xl h-11 transition-all hover:opacity-90"
                  style={{
                    backgroundColor: COLORS.marigoldGold,
                    color: COLORS.inkNavy,
                  }}
                >
                  {verifyingOtp
                    ? "Verifying..."
                    : "Verify Code"}
                </Button>
              </div>
            )}

            {/* Password */}
            <div className="space-y-1.5 relative">
              <Label
                className="font-bold ml-1"
                style={{
                  color: COLORS.inkNavy,
                }}
              >
                Password
              </Label>

              <Input
                type={showPassword ? "text" : "password"}
                placeholder="Set your password"
                autoComplete="off"
                {...register("password")}
                className="h-12 rounded-xl bg-white font-medium pr-12 transition-all"
                style={{
                  color: COLORS.inkNavy,
                  borderColor: errors.password
                    ? `${COLORS.brickMaroon}70`
                    : `${COLORS.inkNavy}18`,
                }}
              />

              <PasswordStrength password={password ?? ""} />

              <button
                type="button"
                className="absolute right-4 top-9.5 transition-colors"
                style={{
                  color: `${COLORS.inkNavy}70`,
                }}
                onClick={() =>
                  setShowPassword(!showPassword)
                }
              >
                {showPassword ? (
                  <EyeOff size={20} />
                ) : (
                  <Eye size={20} />
                )}
              </button>

              {errors.password && (
                <p
                  className="text-xs font-bold ml-1"
                  style={{
                    color: COLORS.brickMaroon,
                  }}
                >
                  Min 6 characters, with uppercase, lowercase,
                  a number & a special character (@#$!%*?&)
                </p>
              )}
            </div>

            {/* Mobile */}
            <div className="space-y-1.5">
              <Label
                className="font-bold ml-1"
                style={{
                  color: COLORS.inkNavy,
                }}
              >
                Mobile Number
              </Label>

              <Input
                {...register("mobileNumber")}
                placeholder="9876543210"
                inputMode="numeric"
                className="h-12 rounded-xl bg-white font-medium transition-all"
                style={{
                  color: COLORS.inkNavy,
                  borderColor: errors.mobileNumber
                    ? `${COLORS.brickMaroon}70`
                    : `${COLORS.inkNavy}18`,
                }}
              />

              {errors.mobileNumber && (
                <p
                  className="text-xs font-bold ml-1"
                  style={{
                    color: COLORS.brickMaroon,
                  }}
                >
                  {errors.mobileNumber.message}
                </p>
              )}
            </div>

            {/* Submit */}
            <Button
              type="submit"
              disabled={
                isPending ||
                !otpVerified ||
                isNavigating
              }
              className="w-full h-13 cursor-pointer rounded-xl font-black text-base shadow-md transition-all hover:opacity-90 disabled:opacity-50 mt-5"
              style={{
                backgroundColor: COLORS.marigoldGold,
                color: COLORS.inkNavy,
              }}
            >
              {isPending
                ? "CREATING ACCOUNT..."
                : "CREATE ACCOUNT"}
            </Button>
          </form>

          {/* Login */}
          <div
            className="mt-7 pt-5 border-t text-center"
            style={{
              borderColor: `${COLORS.inkNavy}12`,
            }}
          >
            <p
              className="text-sm font-medium"
              style={{
                color: `${COLORS.inkNavy}80`,
              }}
            >
              Already a member?{" "}
              <button
                onClick={() => router.push("/login")}
                className="font-black hover:underline underline-offset-4 ml-1 cursor-pointer"
                style={{
                  color: COLORS.brickMaroon,
                }}
              >
                LOGIN HERE
              </button>
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}