"use client";

import { useAuth } from "@/context/AuthContext";
import {
  usePathname,
  useRouter,
  useSearchParams,
} from "next/navigation";
import { useEffect, useRef, Suspense } from "react";

function PublicRouteGuard({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const params = useSearchParams();
  const hasRedirected = useRef(false);

  useEffect(() => {
    if (loading || hasRedirected.current) return;
    if (!user) return;

    const redirect = params.get("redirect");

    if (user.role === "CUSTOMER") {
      hasRedirected.current = true;
      router.replace(redirect || "/");
      return;
    }
    if (user.role === "ADMIN") {
      hasRedirected.current = true;
      router.replace(redirect || "/dashboard");
    }
  }, [user, loading, router, params]);

  if (loading) {
    return null;
  }

  return <>{children}</>;
}

export default function PublicRoute({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Suspense fallback={null}>
      <PublicRouteGuard>{children}</PublicRouteGuard>
    </Suspense>
  );
}