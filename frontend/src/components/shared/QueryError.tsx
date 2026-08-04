"use client";

import { Button } from "@/components/ui/button";
import { XCircle } from "lucide-react";
import { useRouter } from "next/navigation";

// Brand palette: Ink Navy #1B2A41 · Surface Cream #FBF8F1
// Marigold Gold #C6941E (buttons/highlights)
// XCircle stays semantic rose — errors should read as errors, not brand color.

export interface QueryErrorProps {
    title: string;
    message: string;
    retry?: () => void;
    loading?: boolean;
    redirectUrl?: string;
    redirectPageName?: string;
}

export default function QueryError({
    title,
    message,
    retry,
    loading,
    redirectUrl = "/",
    redirectPageName = "Home",
}: QueryErrorProps) {
    const router = useRouter()
    return (
        <div className="bg-[#FBF8F1] rounded-2xl border border-[#1B2A41]/10 p-8 text-center space-y-4">

            <XCircle className="w-10 h-10 text-rose-500 mx-auto" />

            <div>
                <h3 className="font-bold text-[#1B2A41]">
                    {title}
                </h3>

                <p className="text-sm text-[#1B2A41]/60">
                    {message}
                </p>
            </div>

            <div className="flex gap-2 justify-center">
                {retry && (
                    <Button
                        onClick={retry}
                        disabled={loading}
                        className="cursor-pointer bg-[#C6941E] hover:bg-[#A87A14] text-[#1B2A41] hover:text-[#FBF8F1] font-semibold"
                    >
                        {loading ? "Retrying..." : "Retry"}
                    </Button>
                )}

                {redirectUrl && (
                    <Button
                        variant="outline"
                        className="cursor-pointer border-[#1B2A41]/20 text-[#1B2A41] hover:bg-[#1B2A41]/5 hover:text-[#1B2A41]"
                        onClick={() => router.push(redirectUrl)}
                    >
                        {redirectPageName
                            ? `Go to ${redirectPageName}`
                            : "Go Back"}
                    </Button>
                )}
            </div>

        </div>
    );
}