"use client";

import { useEffect, useState, useMemo, useCallback } from "react";
import {
  Building2,
  Check,
  CheckCircle2,
  Copy,
  Crown,
  KeyRound,
  Loader2,
  Pencil,
  PlusCircle,
  Power,
  RefreshCw,
  Search,
  ShieldCheck,
  Store,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { SuperAdminShell } from "@/components/common/SuperAdminShell";
import { CreateTenantModal, CreateTenantFormValues } from "@/components/superadmin/CreateTenantModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/utils/cn";
import {
  fetchTenants,
  fetchSuperAdminStats,
  createTenantApi,
  updateTenantApi,
  toggleTenantStatusApi,
  deleteTenantApi,
  TenantApiRecord,
  SuperAdminStats,
} from "@/lib/api/superadmin";

export default function SuperAdminPage() {
  const [tenants, setTenants] = useState<TenantApiRecord[]>([]);
  const [stats, setStats] = useState<SuperAdminStats | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Inline editing state
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFormData, setEditFormData] = useState({
    name: "",
    adminName: "",
    phone: "",
    address: "",
  });
  const [savingEdit, setSavingEdit] = useState(false);

  const loadData = useCallback(async (isRefresh = false) => {
    try {
      if (isRefresh) setRefreshing(true);
      else setLoading(true);

      const [tenantList, statsData] = await Promise.all([
        fetchTenants(),
        fetchSuperAdminStats(),
      ]);

      setTenants(tenantList);
      if (statsData) setStats(statsData);
      else {
        setStats({
          totalTenants: tenantList.length,
          activeTenants: tenantList.filter((t) => t.isActive).length,
          inactiveTenants: tenantList.filter((t) => !t.isActive).length,
          totalUsers: tenantList.reduce((acc, t) => acc + t.userCount, 0),
        });
      }
    } catch (err: any) {
      toast.error(err.message || "Failed to load tenants from backend API");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleCreateTenant = async (values: CreateTenantFormValues) => {
    try {
      const res = await createTenantApi(values);
      await loadData(true);
      return res;
    } catch (err: any) {
      const errorMsg = err.response?.data?.message || err.message || "Failed to create restaurant";
      toast.error(errorMsg);
      throw new Error(errorMsg);
    }
  };

  const startEditing = (t: TenantApiRecord) => {
    setEditingId(t.id);
    setEditFormData({
      name: t.name,
      adminName: t.adminName || "",
      phone: t.phone || "",
      address: t.address || "",
    });
  };

  const cancelEditing = () => {
    setEditingId(null);
    setEditFormData({ name: "", adminName: "", phone: "", address: "" });
  };

  const saveEditing = async (tenantId: string) => {
    if (!editFormData.name.trim()) {
      toast.error("Restaurant property name cannot be empty");
      return;
    }

    try {
      setSavingEdit(true);
      const updatedTenant = await updateTenantApi(tenantId, {
        name: editFormData.name.trim(),
        adminName: editFormData.adminName.trim(),
        phone: editFormData.phone.trim(),
        address: editFormData.address.trim(),
      });

      setTenants((prev) =>
        prev.map((t) => (t.id === tenantId ? { ...t, ...updatedTenant } : t))
      );

      toast.success(`Property "${editFormData.name}" updated successfully!`);
      setEditingId(null);
    } catch (err: any) {
      toast.error(err.response?.data?.message || err.message || "Failed to update property");
    } finally {
      setSavingEdit(false);
    }
  };

  const handleToggleStatus = async (tenantId: string, currentStatus: boolean) => {
    try {
      const nextStatus = !currentStatus;
      await toggleTenantStatusApi(tenantId, nextStatus);
      toast.success(`Property status set to ${nextStatus ? "Active" : "Deactivated"}`);
      setTenants((prev) =>
        prev.map((t) => (t.id === tenantId ? { ...t, isActive: nextStatus } : t))
      );
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Could not update status");
    }
  };

  const handleDeleteTenant = async (tenantId: string, tenantName: string) => {
    if (!window.confirm(`Are you sure you want to permanently delete property "${tenantName}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteTenantApi(tenantId);
      toast.success(`Property "${tenantName}" deleted successfully`);
      setTenants((prev) => prev.filter((t) => t.id !== tenantId));
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Failed to delete tenant property");
    }
  };

  const filteredTenants = useMemo(() => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return tenants;
    return tenants.filter(
      (t) =>
        t.name.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        (t.loginId && t.loginId.toLowerCase().includes(q)) ||
        (t.adminEmail && t.adminEmail.toLowerCase().includes(q)) ||
        (t.adminName && t.adminName.toLowerCase().includes(q)) ||
        (t.address && t.address.toLowerCase().includes(q))
    );
  }, [tenants, searchQuery]);

  const activeCount = stats ? stats.activeTenants : tenants.filter((t) => t.isActive).length;
  const totalTenantsCount = stats ? stats.totalTenants : tenants.length;
  const totalUsersCount = stats ? stats.totalUsers : tenants.reduce((acc, t) => acc + t.userCount, 0);

  return (
    <SuperAdminShell onOpenCreateModal={() => setCreateModalOpen(true)}>
      <div className="space-y-8">
        {/* Header Hero Section */}
        <div className="rounded-3xl border border-charcoal-100 bg-white p-6 md:p-8 shadow-sm">
          <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 rounded-full bg-lime-100 px-3 py-1 text-xs font-black text-lime-800">
                <Crown className="size-4" /> Multi-Tenant SuperAdmin Engine
              </div>
              <h1 className="text-2xl md:text-3xl font-black text-charcoal-950 tracking-tight">
                Property & Restaurant Control Center
              </h1>
              <p className="text-sm font-semibold text-charcoal-600 max-w-xl">
                Real-time API & Database powered tenant creation and inline property editing. Provision properties along with auto-generated unique Login IDs into PostgreSQL.
              </p>
            </div>
            <div className="flex items-center gap-3 shrink-0">
              <Button
                variant="outline"
                onClick={() => loadData(true)}
                disabled={refreshing || loading}
                className="rounded-2xl h-12 px-4 font-bold border-charcoal-200"
              >
                <RefreshCw className={`size-4 mr-2 ${refreshing ? "animate-spin" : ""}`} /> Refresh
              </Button>
              <Button
                onClick={() => setCreateModalOpen(true)}
                className="bg-lime-400 text-charcoal-950 hover:bg-lime-500 font-extrabold rounded-2xl h-12 px-6 shadow-sm"
              >
                <PlusCircle className="size-5 mr-2" /> Add New Restaurant
              </Button>
            </div>
          </div>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-3xl border border-charcoal-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-charcoal-500 tracking-wider">
                Total Restaurants
              </span>
              <span className="grid size-10 place-items-center rounded-2xl bg-charcoal-50 text-charcoal-900">
                <Store className="size-5" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-black text-charcoal-950">{totalTenantsCount}</p>
            <p className="mt-1 text-xs font-semibold text-charcoal-500">PostgreSQL DB Records</p>
          </div>

          <div className="rounded-3xl border border-charcoal-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-charcoal-500 tracking-wider">
                Active Tenants
              </span>
              <span className="grid size-10 place-items-center rounded-2xl bg-lime-100 text-lime-800">
                <CheckCircle2 className="size-5" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-black text-charcoal-950">{activeCount}</p>
            <p className="mt-1 text-xs font-semibold text-lime-700">
              {totalTenantsCount > 0
                ? `${Math.round((activeCount / totalTenantsCount) * 100)}% active operational rate`
                : "No tenants registered"}
            </p>
          </div>

          <div className="rounded-3xl border border-charcoal-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-charcoal-500 tracking-wider">
                Total Registered Users
              </span>
              <span className="grid size-10 place-items-center rounded-2xl bg-charcoal-50 text-charcoal-900">
                <Users className="size-5" />
              </span>
            </div>
            <p className="mt-4 text-3xl font-black text-charcoal-950">{totalUsersCount}</p>
            <p className="mt-1 text-xs font-semibold text-charcoal-500">Admins, Chefs & Waiters</p>
          </div>

          <div className="rounded-3xl border border-charcoal-100 bg-white p-6 shadow-sm">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase text-charcoal-500 tracking-wider">
                API Database
              </span>
              <span className="grid size-10 place-items-center rounded-2xl bg-charcoal-950 text-lime-400">
                <ShieldCheck className="size-5" />
              </span>
            </div>
            <p className="mt-4 text-xl font-black text-charcoal-950">Live PostgreSQL</p>
            <p className="mt-1 text-xs font-semibold text-lime-700">Connected & Synced</p>
          </div>
        </div>

        {/* Data Table Section */}
        <div className="rounded-3xl border border-charcoal-100 bg-white p-6 shadow-sm space-y-6">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-black text-charcoal-950">
                All Property / Restaurant Tenants
              </h2>
              <p className="text-xs font-semibold text-charcoal-500">
                Managed via `/api/v1/superadmin/tenants` with unique server-generated Login IDs
              </p>
            </div>

            <div className="relative w-full sm:w-72">
              <Input
                placeholder="Search by name, Login ID, or email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="rounded-2xl border-charcoal-200 bg-charcoal-50/50 pl-9 font-semibold text-sm focus-visible:ring-lime-400"
              />
              <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal-400" />
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-charcoal-100">
            <table className="w-full text-left text-sm text-charcoal-700">
              <thead className="bg-charcoal-50 text-xs font-black uppercase text-charcoal-500 border-b border-charcoal-100">
                <tr>
                  <th className="px-4 py-3.5">Tenant Name & ID</th>
                  <th className="px-4 py-3.5">Login ID</th>
                  <th className="px-4 py-3.5">Admin Credentials</th>
                  <th className="px-4 py-3.5">Location / Contact</th>
                  <th className="px-4 py-3.5 text-center">Users</th>
                  <th className="px-4 py-3.5">Status</th>
                  <th className="px-4 py-3.5">Created</th>
                  <th className="px-4 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-charcoal-100 font-semibold">
                {loading ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-16 text-center text-charcoal-500">
                      <div className="flex items-center justify-center gap-2">
                        <Loader2 className="size-5 animate-spin text-lime-600" />
                        <span className="font-bold text-sm">Fetching properties from database...</span>
                      </div>
                    </td>
                  </tr>
                ) : filteredTenants.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="px-4 py-12 text-center text-charcoal-400">
                      No restaurant properties found in database.
                    </td>
                  </tr>
                ) : (
                  filteredTenants.map((t) => {
                    const isEditing = editingId === t.id;

                    return (
                      <tr
                        key={t.id}
                        className={cn(
                          "transition-colors",
                          isEditing
                            ? "bg-lime-50/60 ring-2 ring-lime-400/80"
                            : "hover:bg-charcoal-50/60"
                        )}
                      >
                        {/* Property Name & ID */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-3">
                            <div className="grid size-10 shrink-0 place-items-center rounded-2xl bg-lime-100 text-lime-900 font-black text-xs">
                              <Building2 className="size-5" />
                            </div>
                            <div className="w-full">
                              {isEditing ? (
                                <Input
                                  value={editFormData.name}
                                  onChange={(e) =>
                                    setEditFormData((prev) => ({ ...prev, name: e.target.value }))
                                  }
                                  placeholder="Restaurant Name"
                                  className="h-9 w-full rounded-xl border-lime-300 bg-white font-black text-sm text-charcoal-950 focus-visible:ring-lime-400"
                                />
                              ) : (
                                <p className="font-extrabold text-charcoal-950 text-sm">{t.name}</p>
                              )}
                              <p className="font-mono text-xs text-charcoal-500 flex items-center gap-1 mt-0.5">
                                <span className="rounded bg-charcoal-100 px-1 py-0.2 text-[10px] font-bold">
                                  ID: {t.id}
                                </span>
                              </p>
                            </div>
                          </div>
                        </td>

                        {/* Login ID Column with Copy Action */}
                        <td className="px-4 py-4">
                          <div className="flex items-center gap-1.5">
                            <code className="rounded-xl bg-charcoal-950 px-2.5 py-1 font-mono text-xs font-black text-lime-400 border border-charcoal-800 shadow-xs">
                              {t.loginId || "N/A"}
                            </code>
                            {t.loginId && (
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={async () => {
                                  try {
                                    await navigator.clipboard.writeText(t.loginId);
                                    toast.success("Login ID copied to clipboard!");
                                  } catch {
                                    toast.error("Failed to copy Login ID");
                                  }
                                }}
                                title="Copy Login ID"
                                className="h-7 w-7 p-0 text-charcoal-500 hover:bg-lime-100 hover:text-lime-900 rounded-lg shrink-0"
                              >
                                <Copy className="size-3.5" />
                              </Button>
                            )}
                          </div>
                        </td>

                        {/* Admin Info */}
                        <td className="px-4 py-4">
                          <div>
                            {isEditing ? (
                              <Input
                                value={editFormData.adminName}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    adminName: e.target.value,
                                  }))
                                }
                                placeholder="Admin Name"
                                className="h-9 w-full rounded-xl border-lime-300 bg-white font-bold text-xs text-charcoal-950 focus-visible:ring-lime-400 mb-1"
                              />
                            ) : (
                              <p className="text-xs font-bold text-charcoal-900">
                                {t.adminName || "N/A"}
                              </p>
                            )}
                            <p className="text-xs font-medium text-charcoal-500 flex items-center gap-1">
                              <KeyRound className="size-3 text-lime-600" />
                              {t.adminEmail || "No admin assigned"}
                            </p>
                          </div>
                        </td>

                        {/* Location / Contact */}
                        <td className="px-4 py-4 text-xs">
                          {isEditing ? (
                            <div className="space-y-1 w-full min-w-[140px]">
                              <Input
                                value={editFormData.address}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    address: e.target.value,
                                  }))
                                }
                                placeholder="Address"
                                className="h-8 rounded-xl border-lime-300 bg-white font-medium text-xs text-charcoal-950 focus-visible:ring-lime-400"
                              />
                              <Input
                                value={editFormData.phone}
                                onChange={(e) =>
                                  setEditFormData((prev) => ({
                                    ...prev,
                                    phone: e.target.value,
                                  }))
                                }
                                placeholder="Phone Number"
                                className="h-8 rounded-xl border-lime-300 bg-white font-medium text-xs text-charcoal-950 focus-visible:ring-lime-400"
                              />
                            </div>
                          ) : (
                            <>
                              <p className="font-semibold text-charcoal-800">
                                {t.address || "No address"}
                              </p>
                              <p className="text-charcoal-500">{t.phone || "-"}</p>
                            </>
                          )}
                        </td>

                        {/* User Count */}
                        <td className="px-4 py-4 text-center">
                          <span className="inline-flex items-center rounded-full bg-charcoal-100 px-2.5 py-1 text-xs font-bold text-charcoal-900">
                            {t.userCount} users
                          </span>
                        </td>

                        {/* Status */}
                        <td className="px-4 py-4">
                          {t.isActive ? (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-lime-100 px-3 py-1 text-xs font-bold text-lime-800">
                              <span className="size-1.5 rounded-full bg-lime-500 animate-pulse" />{" "}
                              Active
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-3 py-1 text-xs font-bold text-rose-800">
                              <span className="size-1.5 rounded-full bg-rose-500" /> Suspended
                            </span>
                          )}
                        </td>

                        {/* Created Date */}
                        <td className="px-4 py-4 text-xs text-charcoal-500 whitespace-nowrap">
                          {new Date(t.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </td>

                        {/* Action Buttons */}
                        <td className="px-4 py-4 text-right whitespace-nowrap space-x-1">
                          {isEditing ? (
                            <>
                              <Button
                                size="sm"
                                onClick={() => saveEditing(t.id)}
                                disabled={savingEdit}
                                className="rounded-xl bg-lime-400 text-charcoal-950 font-extrabold hover:bg-lime-500 h-8 px-3"
                              >
                                {savingEdit ? (
                                  <Loader2 className="size-4 animate-spin" />
                                ) : (
                                  <>
                                    <Check className="size-4 mr-1" /> Save
                                  </>
                                )}
                              </Button>
                              <Button
                                size="sm"
                                variant="ghost"
                                onClick={cancelEditing}
                                disabled={savingEdit}
                                className="rounded-xl text-charcoal-600 hover:bg-charcoal-100 h-8 px-2"
                              >
                                <X className="size-4 mr-1" /> Cancel
                              </Button>
                            </>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => startEditing(t)}
                                title="Edit Property In-Line"
                                className="text-charcoal-700 hover:bg-lime-100 hover:text-lime-900 rounded-xl"
                              >
                                <Pencil className="size-4" />
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleToggleStatus(t.id, t.isActive)}
                                className={
                                  t.isActive
                                    ? "text-rose-600 hover:bg-rose-50 rounded-xl"
                                    : "text-lime-700 hover:bg-lime-50 rounded-xl"
                                }
                              >
                                <Power className="size-4 mr-1" />
                                {t.isActive ? "Deactivate" : "Activate"}
                              </Button>

                              <Button
                                variant="ghost"
                                size="sm"
                                onClick={() => handleDeleteTenant(t.id, t.name)}
                                className="text-rose-600 hover:bg-rose-50 hover:text-rose-700 rounded-xl"
                              >
                                <Trash2 className="size-4" />
                              </Button>
                            </>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <CreateTenantModal
        open={createModalOpen}
        onOpenChange={setCreateModalOpen}
        onSubmit={handleCreateTenant}
      />
    </SuperAdminShell>
  );
}
