"use client";

import { useEffect, useState, useCallback } from "react";
import { usePathname, useRouter } from "next/navigation";
import { toast } from "sonner";
import { LoadingState } from "@/components/app-components";
import { canAccessRoute, getCurrentUser, getDefaultRouteByRole } from "@/lib/auth";

export function AuthGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();

  const [mounted, setMounted] = useState(false);
  const [user, setUser] = useState<ReturnType<typeof getCurrentUser> | null>(null);

  const syncUser = useCallback(() => {
    const current = getCurrentUser();
    setUser(current);
    return current;
  }, []);

  useEffect(() => {
    syncUser();
    setMounted(true);

    const handleAuthChange = () => {
      syncUser();
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, [syncUser]);

  const isLoginRoute = pathname === "/" || pathname.startsWith("/auth");

  useEffect(() => {
    if (!mounted) return;

    const currentUser = syncUser();

    if (!currentUser) {
      if (!isLoginRoute) {
        toast.error("Please log in to continue");
        router.replace("/auth/login");
      }
      return;
    }

    if (isLoginRoute) {
      router.replace(getDefaultRouteByRole(currentUser.role));
      return;
    }

    if (!canAccessRoute(currentUser.role, pathname)) {
      toast.error("You do not have access to that area");
      router.replace(getDefaultRouteByRole(currentUser.role));
    }
  }, [mounted, isLoginRoute, pathname, router, syncUser]);

  if (!mounted) {
    return (
      <div className="min-h-screen bg-background p-4">
        <LoadingState label="Checking access" />
      </div>
    );
  }

  const currentUser = getCurrentUser();
  const allowed = currentUser
    ? !isLoginRoute && canAccessRoute(currentUser.role, pathname)
    : isLoginRoute;

  if (!allowed) {
    return (
      <div className="min-h-screen bg-background p-4">
        <LoadingState label="Checking access" />
      </div>
    );
  }

  return children;
}