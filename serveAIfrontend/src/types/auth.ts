export type UserRole = "superadmin" | "admin" | "chef" | "waiter";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password: string;
  role: UserRole;
  tenantId?: string;
  tenantName?: string;
  tenantLoginId?: string;
}

export type SafeAuthUser = Omit<AuthUser, "password">;
