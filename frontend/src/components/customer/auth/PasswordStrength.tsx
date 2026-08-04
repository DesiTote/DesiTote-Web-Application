"use client";

import { CheckCircle2, Circle } from "lucide-react";
import { COLORS } from "@/constants/shared/theme";

interface PasswordStrengthProps {
    password: string;
}

const getRules = (password: string) => [
    {
        label: "At least 6 characters",
        valid: password.length >= 6,
    },
    {
        label: "One uppercase letter",
        valid: /[A-Z]/.test(password),
    },
    {
        label: "One lowercase letter",
        valid: /[a-z]/.test(password),
    },
    {
        label: "One number",
        valid: /\d/.test(password),
    },
    {
        label: "One special character",
        valid: /[!@#$%^&*(),.?\":{}|<>_\-\\[\]/+=~`]/.test(password),
    },
];

export function PasswordStrength({
    password,
}: PasswordStrengthProps) {
    const rules = getRules(password);

    const passed = rules.filter((r) => r.valid).length;

    return (
        <div
            className="rounded-2xl border p-4 space-y-3"
            style={{
                backgroundColor: COLORS.navbarBg,
                borderColor: `${COLORS.inkNavy}15`,
            }}
        >
            <div className="flex items-center justify-between">
                <span
                    className="text-xs font-bold uppercase tracking-wider"
                    style={{
                        color: COLORS.brickMaroon,
                    }}
                >
                    Password Strength
                </span>

                <span
                    className="text-xs font-semibold"
                    style={{
                        color:
                            passed === 5
                                ? "#16A34A"
                                : COLORS.inkNavy,
                    }}
                >
                    {passed}/5
                </span>
            </div>

            <div className="space-y-2">
                {rules.map((rule) => (
                    <div
                        key={rule.label}
                        className="flex items-center gap-2"
                    >
                        {rule.valid ? (
                            <CheckCircle2
                                className="w-4 h-4 shrink-0"
                                style={{
                                    color: "#16A34A",
                                }}
                            />
                        ) : (
                            <Circle
                                className="w-4 h-4 shrink-0"
                                style={{
                                    color: `${COLORS.inkNavy}55`,
                                }}
                            />
                        )}

                        <span
                            className="text-xs font-medium"
                            style={{
                                color: rule.valid
                                    ? COLORS.inkNavy
                                    : `${COLORS.inkNavy}80`,
                            }}
                        >
                            {rule.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
}