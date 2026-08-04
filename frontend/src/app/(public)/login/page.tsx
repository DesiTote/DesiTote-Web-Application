"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Eye, EyeOff, Loader2, LockKeyhole } from "lucide-react";
import { z } from "zod";

import { loginSchema } from "@/schemas/customer/auth.scheama";
import { useLogin } from "@/hooks/customer/useAuth";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Label } from "@/components/ui/label";

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import { useQueryClient } from "@tanstack/react-query";
import { COLORS } from "@/constants/shared/theme";

type FormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [isNavigating, startNavigation] = useTransition();
  const { mutate, isPending } = useLogin();
  const queryClient = useQueryClient();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(loginSchema),
  });

  const [showPassword, setShowPassword] = useState(false);

  const onSubmit = (data: FormData) => {
    mutate(data, {
      onSuccess: (res: any) => {
        toast.success(res?.data?.message || "Welcome back!");
        queryClient.setQueryData(["me"], res?.data?.user);

        startNavigation(() => router.push("/"));
      },
      onError: (err: any) => {
        toast.error(
          err?.response?.data?.message || "Invalid credentials"
        );
      },
    });
  };

  return (
    <div
      className="w-full min-h-screen flex items-center justify-center px-4 relative overflow-hidden antialiased font-body"
      style={{
        backgroundColor: COLORS.canvasCream,
      }}
    >

      <div
        className="absolute bottom-[-12%] right-[-12%] w-80 h-80 rounded-full blur-[120px] opacity-15 pointer-events-none"
        style={{
          backgroundColor: COLORS.brickMaroon,
        }}
      />

      {/* Login Card */}
      <Card
        className="w-full max-w-md rounded-[28px] relative z-10 p-2 sm:p-4 shadow-xl"
        style={{
          backgroundColor: `${COLORS.navbarBg}E6`,
          borderColor: `${COLORS.inkNavy}14`,
          backdropFilter: "blur(12px)",
        }}
      >
        <CardHeader className="space-y-3 pb-5">
          {/* Icon */}
          <div
            className="w-12 h-12 rounded-2xl mx-auto flex items-center justify-center border"
            style={{
              backgroundColor: `${COLORS.marigoldGold}15`,
              borderColor: `${COLORS.marigoldGold}30`,
            }}
          >
            <LockKeyhole
              className="w-5 h-5"
              style={{ color: COLORS.marigoldGold }}
            />
          </div>

          {/* Eyebrow */}
          <p
            className="text-[10px] sm:text-xs uppercase tracking-[0.18em] font-bold text-center"
            style={{ color: COLORS.brickMaroon }}
          >
            Welcome Back
          </p>

          <CardTitle
            className="font-heading text-2xl sm:text-3xl font-black text-center tracking-tight"
            style={{ color: COLORS.inkNavy }}
          >
            Welcome back 👋
          </CardTitle>

          <p
            className="text-center text-xs sm:text-sm font-medium"
            style={{ color: `${COLORS.inkNavy}80` }}
          >
            Login to continue shopping thoughtful designs.
          </p>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* EMAIL */}
            <div className="space-y-1.5">
              <Label
                className="text-xs font-bold tracking-wide uppercase pl-0.5"
                style={{ color: COLORS.inkNavy }}
              >
                Email Address
              </Label>

              <Input
                type="email"
                {...register("email")}
                placeholder="name@example.com"
                className="h-11 px-4 rounded-xl text-sm font-medium placeholder:text-slate-400 transition-all"
                style={{
                  color: COLORS.inkNavy,
                  backgroundColor: "#FFFFFF",
                  borderColor: errors.email
                    ? `${COLORS.brickMaroon}60`
                    : `${COLORS.inkNavy}20`,
                }}
              />

              {errors.email && (
                <p
                  className="text-[11px] font-bold pl-1"
                  style={{ color: COLORS.brickMaroon }}
                >
                  {errors.email.message}
                </p>
              )}
            </div>

            {/* PASSWORD */}
            <div className="space-y-1.5">
              <div className="flex items-center justify-between pl-0.5">
                <Label
                  className="text-xs font-bold tracking-wide uppercase"
                  style={{ color: COLORS.inkNavy }}
                >
                  Password
                </Label>

                <Link
                  href="/forgot-password"
                  className="text-[11px] font-bold hover:underline underline-offset-2 transition-all"
                  style={{ color: COLORS.brickMaroon }}
                >
                  Forgot Password?
                </Link>
              </div>

              <div className="relative flex items-center">
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  className="h-11 pl-4 pr-11 w-full rounded-xl text-sm font-medium placeholder:text-slate-400 transition-all"
                  style={{
                    color: COLORS.inkNavy,
                    backgroundColor: "#FFFFFF",
                    borderColor: errors.password
                      ? `${COLORS.brickMaroon}60`
                      : `${COLORS.inkNavy}20`,
                  }}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 p-1 rounded-lg cursor-pointer transition-colors"
                  style={{
                    color: `${COLORS.inkNavy}70`,
                  }}
                  aria-label={
                    showPassword ? "Hide password" : "Show password"
                  }
                >
                  {showPassword ? (
                    <EyeOff size={16} className="stroke-[2.5]" />
                  ) : (
                    <Eye size={16} className="stroke-[2.5]" />
                  )}
                </button>
              </div>

              {errors.password && (
                <p
                  className="text-[11px] font-bold pl-1"
                  style={{ color: COLORS.brickMaroon }}
                >
                  {errors.password.message}
                </p>
              )}
            </div>

            {/* SIGN IN */}
            <Button
              type="submit"
              disabled={isPending || isNavigating}
              className="w-full h-11 text-white font-bold text-sm rounded-xl shadow-sm transition-all cursor-pointer mt-2 flex items-center justify-center gap-2 hover:opacity-90"
              style={{
                backgroundColor: COLORS.marigoldGold,
              }}
            >
              {isPending ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Verifying Session...</span>
                </>
              ) : (
                "Sign In"
              )}
            </Button>
          </form>

          {/* Sign Up */}
          <p
            className="text-xs sm:text-sm text-center font-medium mt-6"
            style={{ color: `${COLORS.inkNavy}80` }}
          >
            Don’t have an account?{" "}
            <Link
              href="/signup"
              className="font-bold cursor-pointer hover:underline underline-offset-4"
              style={{ color: COLORS.brickMaroon }}
            >
              Sign Up Free
            </Link>
          </p>
        </CardContent>
      </Card>
    </div>
  );
}