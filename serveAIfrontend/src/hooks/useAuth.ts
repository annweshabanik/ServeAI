"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import {
  getCurrentUser,
  getDefaultRouteByRole,
  loginUser,
  logoutUser,
} from "@/lib/auth";
import type { SafeAuthUser } from "@/types/auth";

export function useAuth() {
  const router = useRouter();
  const [user, setUser] = useState<SafeAuthUser | null>(() => getCurrentUser());

  useEffect(() => {
    const handleAuthChange = () => {
      setUser(getCurrentUser());
    };

    window.addEventListener("auth-change", handleAuthChange);
    window.addEventListener("storage", handleAuthChange);
    return () => {
      window.removeEventListener("auth-change", handleAuthChange);
      window.removeEventListener("storage", handleAuthChange);
    };
  }, []);

  const login = useCallback(async (email: string, password: string) => {
    try {
      const loggedInUser = await loginUser(email, password);
      if (!loggedInUser) {
        toast.error("Invalid email or password");
        return false;
      }

      setUser(loggedInUser);
      toast.success(`Welcome back, ${loggedInUser.name}`);
      router.replace(getDefaultRouteByRole(loggedInUser.role));
      return true;
    } catch (err: any) {
      toast.error(err.message || "Invalid email or password");
      return false;
    }
  }, [router]);

  const logout = useCallback(() => {
    logoutUser();
    setUser(null);
    toast.success("Logged out successfully");
    router.replace("/auth/login");
  }, [router]);

  return { user, role: user?.role, isReady: true, login, logout };
}
