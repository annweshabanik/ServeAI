import type { AuthUser } from "@/types/auth";

export const mockUsers: AuthUser[] = [
  {
    id: "user-superadmin-001",
    name: "ServeAI SuperAdmin",
    email: "superadmin@serveai.com",
    password: "superadmin123",
    role: "superadmin",
  },
  {
    id: "user-admin-001",
    name: "Admin User",
    email: "admin@serveai.com",
    password: "admin123",
    role: "admin",
    tenantId: "tenant-001",
    tenantName: "Grand Lotus Hotel",
  },
  {
    id: "user-chef-001",
    name: "Chef User",
    email: "chef@serveai.com",
    password: "chef123",
    role: "chef",
    tenantId: "tenant-001",
    tenantName: "Grand Lotus Hotel",
  },
  {
    id: "user-waiter-001",
    name: "Waiter User",
    email: "waiter@serveai.com",
    password: "waiter123",
    role: "waiter",
    tenantId: "tenant-001",
    tenantName: "Grand Lotus Hotel",
  },
];
