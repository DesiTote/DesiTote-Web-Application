"use client";

import { useAuth } from "@/context/AuthContext";
import { usePathname, useRouter } from "next/navigation";
import { useEffect, useRef } from "react";

export default function CustomerRoute({
    children,
}: {
    children: React.ReactNode;
}) {
      const { user, loading } = useAuth();
    const router = useRouter();
    const pathname = usePathname();
   const hasRedirected = useRef(false);

    useEffect(() => {
      if (loading) return;
      if (loading || hasRedirected.current) return;

        if (!user && pathname !== "/") {
         hasRedirected.current = true;
            router.replace(`/login?redirect=${pathname}`);
            return;
        }

        if (user && user.role === "ADMIN") {
         hasRedirected.current = true;
            router.replace("/dashboard");
        }
    }, [loading, user, pathname, router]);

    /*
     * Allow page skeletons
     */
    if (loading) {
        return <>{children}</>;
    }

    /*
     * Block invalid access
     */
    if (pathname !== "/" && (!user || user.role !== "CUSTOMER")) {
        return null;
    }

    return <>{children}</>;
}