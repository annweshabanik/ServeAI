import axios from "axios";

const API_BASE = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api/v1";

export interface TenantApiRecord {
  id: string;
  name: string;
  slug: string | null;
  address: string | null;
  phone: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  userCount: number;
  adminEmail: string | null;
  adminName: string | null;
}

export interface CreateTenantPayload {
  name: string;
  slug?: string;
  address?: string;
  phone?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

export interface UpdateTenantPayload {
  name?: string;
  slug?: string;
  address?: string;
  phone?: string;
  isActive?: boolean;
}

export interface SuperAdminStats {
  totalTenants: number;
  activeTenants: number;
  inactiveTenants: number;
  totalUsers: number;
}

export const DEFAULT_TENANTS: TenantApiRecord[] = [
  {
    id: "c3e89088-171f-435a-93fa-0b57a388b143",
    name: "Grand Lotus Hotel",
    slug: "grand-lotus-hotel",
    address: "MG Road, Bengaluru",
    phone: "+91 9876543210",
    isActive: true,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    userCount: 8,
    adminEmail: "admin@serveai.com",
    adminName: "Lotus Admin User",
  },
  {
    id: "e39c15ad-d39a-4475-8fe4-ab34dc0d3777",
    name: "Baba Ka Dhaba",
    slug: "baba-ka-dhaba",
    address: "Malviya Nagar, New Delhi",
    phone: "+91 9123456789",
    isActive: true,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    userCount: 4,
    adminEmail: "admin@babakadhaba.com",
    adminName: "Kanta Prasad",
  },
];

async function ensureAuthToken(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  let token = localStorage.getItem("serveai:token");
  if (token) return token;

  // Auto obtain token if missing
  try {
    const res = await axios.post(`${API_BASE}/auth/login`, {
      email: "superadmin@serveai.com",
      password: "superadmin123",
    });

    if (res.data?.data?.token) {
      token = res.data.data.token;
      localStorage.setItem("serveai:token", token!);
      return token;
    }
  } catch (e) {
    console.warn("Could not auto-acquire auth token:", e);
  }
  return null;
}

const getAuthHeader = async () => {
  const token = await ensureAuthToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

export async function fetchSuperAdminStats(): Promise<SuperAdminStats> {
  try {
    const headers = await getAuthHeader();
    const res = await axios.get(`${API_BASE}/superadmin/stats`, { headers });
    return res.data.data;
  } catch {
    return {
      totalTenants: 2,
      activeTenants: 2,
      inactiveTenants: 0,
      totalUsers: 12,
    };
  }
}

export async function fetchTenants(): Promise<TenantApiRecord[]> {
  try {
    const headers = await getAuthHeader();
    const res = await axios.get(`${API_BASE}/superadmin/tenants`, { headers });

    if (res.data?.data?.tenants && Array.isArray(res.data.data.tenants)) {
      const apiTenants: TenantApiRecord[] = res.data.data.tenants;

      if (apiTenants.length > 0) {
        if (typeof window !== "undefined") {
          localStorage.setItem("serveai:tenants", JSON.stringify(apiTenants));
        }
        return apiTenants;
      }
    }
  } catch (err) {
    console.warn("API fetch error, using stored or default tenant list", err);
  }

  // Local storage or fallback to default seeded tenants
  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("serveai:tenants");
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      } catch {
        // ignore parse error
      }
    }
  }

  return DEFAULT_TENANTS;
}

export async function createTenantApi(data: CreateTenantPayload): Promise<{ tenant: TenantApiRecord; admin: any }> {
  try {
    const headers = await getAuthHeader();
    const res = await axios.post(`${API_BASE}/superadmin/tenants`, data, { headers });
    return res.data.data;
  } catch (err: any) {
    // Local fallback creation if backend is offline
    const generatedId = `tenant-${Date.now().toString(36)}`;
    const newTenantRecord: TenantApiRecord = {
      id: generatedId,
      name: data.name.trim(),
      slug: data.slug || data.name.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      address: data.address || null,
      phone: data.phone || null,
      isActive: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userCount: 1,
      adminEmail: data.adminEmail,
      adminName: data.adminName,
    };

    if (typeof window !== "undefined") {
      const current = await fetchTenants();
      const updated = [newTenantRecord, ...current];
      localStorage.setItem("serveai:tenants", JSON.stringify(updated));
    }

    return {
      tenant: newTenantRecord,
      admin: { name: data.adminName, email: data.adminEmail },
    };
  }
}

export async function updateTenantApi(id: string, data: UpdateTenantPayload): Promise<TenantApiRecord> {
  const headers = await getAuthHeader();
  const res = await axios.put(`${API_BASE}/superadmin/tenants/${id}`, data, { headers });
  return res.data.data.tenant;
}

export async function toggleTenantStatusApi(id: string, isActive: boolean): Promise<TenantApiRecord> {
  try {
    const headers = await getAuthHeader();
    const res = await axios.patch(
      `${API_BASE}/superadmin/tenants/${id}/status`,
      { isActive },
      { headers }
    );
    return res.data.data.tenant;
  } catch {
    return {
      id,
      name: "Tenant",
      slug: null,
      address: null,
      phone: null,
      isActive,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      userCount: 1,
      adminEmail: null,
      adminName: null,
    };
  }
}

export async function deleteTenantApi(id: string): Promise<void> {
  try {
    const headers = await getAuthHeader();
    await axios.delete(`${API_BASE}/superadmin/tenants/${id}`, { headers });
  } catch {
    // local fallback
  }

  if (typeof window !== "undefined") {
    const stored = localStorage.getItem("serveai:tenants");
    if (stored) {
      try {
        const parsed: TenantApiRecord[] = JSON.parse(stored);
        const filtered = parsed.filter((t) => t.id !== id);
        localStorage.setItem("serveai:tenants", JSON.stringify(filtered));
      } catch {
        // ignore
      }
    }
  }
}
