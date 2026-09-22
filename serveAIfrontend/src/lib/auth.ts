import axios from "axios";
import { mockUsers } from "@/lib/demo/users";
import type { SafeAuthUser, UserRole } from "@/types/auth";

const USER_KEY = "serveai:user";
const ROLE_KEY = "serveai:role";
const TOKEN_KEY = "serveai:token";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

const isBrowser = () => typeof window !== "undefined";

function notifyAuthChange() {
  if (isBrowser()) {
    window.dispatchEvent(new Event("auth-change"));
  }
}

export function getCurrentUser(): SafeAuthUser | null {
  if (!isBrowser()) return null;

  const stored = window.localStorage.getItem(USER_KEY);
  if (!stored) return null;

  try {
    return JSON.parse(stored) as SafeAuthUser;
  } catch {
    logoutUser();
    return null;
  }
}

export async function loginUser(identifier: string, password: string): Promise<SafeAuthUser | null> {
  if (!isBrowser()) return null;

  try {
    // 1. Try authenticating with backend API
    const response = await axios.post(`${API_BASE}/auth/login`, {
      identifier: identifier.trim(),
      email: identifier.trim(),
      password: password.trim(),
    });

    if (response.data && response.data.data) {
      const { user, token } = response.data.data;
      const normalizedRole = (user.role || "waiter").toLowerCase() as UserRole;

      const safeUser: SafeAuthUser = {
        id: user.id,
        name: user.name,
        email: user.email,
        role: normalizedRole,
        tenantId: user.tenantId,
        tenantName: user.tenantName || user.tenant?.name,
        tenantLoginId: user.tenantLoginId || user.tenant?.loginId,
      };

      window.localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
      window.localStorage.setItem(ROLE_KEY, normalizedRole);
      window.localStorage.setItem(TOKEN_KEY, token);

      notifyAuthChange();
      return safeUser;
    }
  } catch (err: any) {
    if (axios.isAxiosError(err) && err.response) {
      const backendMessage = err.response.data?.message || err.response.data?.error || "Authentication failed";
      throw new Error(backendMessage);
    }
    // Fallback to local demo users if backend is unreachable / network error
    console.warn("Backend server unreachable, trying local fallback", err);
  }

  // 2. Local fallback check
  const candidate = mockUsers.find(
    (u) =>
      (u.email.toLowerCase() === identifier.trim().toLowerCase() ||
       (u as any).loginId === identifier.trim() ||
       u.tenantLoginId === identifier.trim()) &&
      u.password === password
  );

  if (!candidate) return null;

  const safeUser: SafeAuthUser = {
    id: candidate.id,
    name: candidate.name,
    email: candidate.email,
    role: candidate.role,
    tenantId: candidate.tenantId,
    tenantName: candidate.tenantName,
    tenantLoginId: candidate.tenantLoginId,
  };

  window.localStorage.setItem(USER_KEY, JSON.stringify(safeUser));
  window.localStorage.setItem(ROLE_KEY, safeUser.role);
  notifyAuthChange();
  return safeUser;
}

export function logoutUser() {
  if (!isBrowser()) return;
  window.localStorage.removeItem(USER_KEY);
  window.localStorage.removeItem(ROLE_KEY);
  window.localStorage.removeItem(TOKEN_KEY);
  notifyAuthChange();
}

export function getDefaultRouteByRole(role: UserRole) {
  const routes: Record<UserRole, string> = {
    superadmin: "/superadmin",
    admin: "/admin/dashboard",
    chef: "/kitchen",
    waiter: "/order",
  };

  return routes[role];
}

export function canAccessRoute(role: UserRole, pathname: string) {
  if (pathname === "/" || pathname.startsWith("/auth")) return true;
  if (pathname.startsWith("/superadmin")) return role === "superadmin";
  if (role === "superadmin") return true;
  if (role === "admin") return true;
  if (role === "chef") return pathname === "/kitchen";
  if (role === "waiter") return pathname.startsWith("/order") || pathname === "/delivery";
  return false;
}
