"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import { toast } from "sonner";

export default function AdminRoute({
    children,
}: {
    children: React.ReactNode;
}) {
    const { user, loading } = useAuth();

    const router = useRouter();
    const pathname = usePathname();
    const hasRedirected = useRef(false);
    const hasShownVerifyToast = useRef(false);

    useEffect(() => {
        if (loading) return;
        if (loading || hasRedirected.current) return;

        /*
         * NOT LOGGED IN
         */
        if (!user) {
            hasRedirected.current = true;
            router.replace(`/login?redirect=${pathname}`);
            return;
        }

        /*
         * CUSTOMER TRYING ADMIN PAGE
         */
        if (user.role === "CUSTOMER") {
            hasRedirected.current = true;
            router.replace("/");
            return;
        }

        /*
         * ADMIN BUT EMAIL NOT VERIFIED — hard gate.
         * Login succeeds (backend no longer blocks this), but no admin
         * page renders until they verify.
         */
        if (user.role === "ADMIN" && !user.emailVerified && pathname !== "/verify-email") {
            hasRedirected.current = true;
            if (!hasShownVerifyToast.current) {
                hasShownVerifyToast.current = true;
                toast.info("Please verify your email to continue.");
            }
            router.replace("/verify-email");
            return;
        }
    }, [loading, user, pathname, router]);

    if (loading) {
        return <>{children}</>;
    }

    /*
     * Block invalid access
     */
    if (!user || user.role !== "ADMIN") {
        return null;
    }

    if (!user.emailVerified && pathname !== "/verify-email") {
        return null;
    }

    return <>{children}</>;
}