"use client";

import { useState } from "react";
import { toast } from "sonner";
import { Building2, KeyRound, Mail, MapPin, Phone, User, ShieldCheck, CheckCircle2, Copy, Check } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export interface CreateTenantFormValues {
  name: string;
  slug?: string;
  address?: string;
  phone?: string;
  adminName: string;
  adminEmail: string;
  adminPassword: string;
}

interface CreateTenantModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSubmit: (values: CreateTenantFormValues) => Promise<{ tenant?: { loginId?: string; name?: string } } | any>;
}

export function CreateTenantModal({
  open,
  onOpenChange,
  onSubmit,
}: CreateTenantModalProps) {
  const [formData, setFormData] = useState<CreateTenantFormValues>({
    name: "",
    slug: "",
    address: "",
    phone: "",
    adminName: "",
    adminEmail: "",
    adminPassword: "",
  });
  const [loading, setLoading] = useState(false);
  const [createdTenantInfo, setCreatedTenantInfo] = useState<{
    loginId: string;
    name: string;
  } | null>(null);
  const [copied, setCopied] = useState(false);

  const handleChange = (field: keyof CreateTenantFormValues, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleCopyLoginId = async () => {
    if (!createdTenantInfo?.loginId) return;
    try {
      await navigator.clipboard.writeText(createdTenantInfo.loginId);
      setCopied(true);
      toast.success("Login ID copied to clipboard!");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Failed to copy Login ID");
    }
  };

  const handleResetAndClose = () => {
    setFormData({
      name: "",
      slug: "",
      address: "",
      phone: "",
      adminName: "",
      adminEmail: "",
      adminPassword: "",
    });
    setCreatedTenantInfo(null);
    onOpenChange(false);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!formData.name.trim()) {
      toast.error("Please enter property/restaurant name");
      return;
    }
    if (!formData.adminName.trim()) {
      toast.error("Please enter admin full name");
      return;
    }
    if (!formData.adminEmail.trim()) {
      toast.error("Please enter admin login email");
      return;
    }
    if (!formData.adminPassword.trim()) {
      toast.error("Please enter admin password");
      return;
    }

    try {
      setLoading(true);
      const res = await onSubmit(formData);
      const generatedLoginId = res?.tenant?.loginId || res?.loginId || "GENERATED";
      
      setCreatedTenantInfo({
        loginId: generatedLoginId,
        name: formData.name.trim(),
      });
      toast.success(`Restaurant "${formData.name}" created successfully!`);
    } catch (err: any) {
      toast.error(err.message || "Failed to create restaurant property");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(val) => {
      if (!val) handleResetAndClose();
      else onOpenChange(val);
    }}>
      <DialogContent className="rounded-3xl max-w-xl bg-white border-charcoal-100 p-6 md:p-8">
        {createdTenantInfo ? (
          /* SUCCESS VIEW SHOWING GENERATED LOGIN ID */
          <div className="space-y-6 py-2">
            <div className="text-center space-y-3">
              <span className="inline-grid size-16 place-items-center rounded-3xl bg-lime-100 text-lime-800 mx-auto shadow-sm">
                <CheckCircle2 className="size-8" />
              </span>
              <h2 className="text-2xl font-black text-charcoal-950 tracking-tight">
                Tenant Created Successfully!
              </h2>
              <p className="text-sm font-semibold text-charcoal-600 max-w-md mx-auto">
                Restaurant property <strong className="text-charcoal-950">{createdTenantInfo.name}</strong> has been provisioned with its unique server-generated Login ID.
              </p>
            </div>

            <div className="rounded-3xl bg-charcoal-950 p-6 text-white space-y-3 relative overflow-hidden shadow-md">
              <div className="flex items-center justify-between text-xs font-bold text-white/60 uppercase tracking-wider">
                <span>Unique Tenant Login ID</span>
                <span className="rounded-full bg-lime-400/20 px-2.5 py-0.5 text-lime-300 font-mono text-[10px]">Auto-Generated</span>
              </div>
              
              <div className="flex items-center justify-between gap-4">
                <span className="font-mono text-3xl font-black tracking-wider text-lime-400">
                  {createdTenantInfo.loginId}
                </span>
                <Button
                  onClick={handleCopyLoginId}
                  className="rounded-2xl bg-lime-400 font-extrabold text-charcoal-950 hover:bg-lime-500 h-11 px-4 shrink-0"
                >
                  {copied ? (
                    <>
                      <Check className="size-4 mr-1.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="size-4 mr-1.5" /> Copy Login ID
                    </>
                  )}
                </Button>
              </div>

              <p className="text-xs font-medium text-white/70 border-t border-white/10 pt-3">
                Provide this unique Login ID to the tenant admin for logging into the POS system.
              </p>
            </div>

            <div className="flex justify-end pt-2">
              <Button
                onClick={handleResetAndClose}
                className="rounded-2xl bg-lime-400 font-extrabold text-charcoal-950 hover:bg-lime-500 h-12 px-8"
              >
                Done
              </Button>
            </div>
          </div>
        ) : (
          /* FORM VIEW FOR CREATING TENANT */
          <>
            <DialogHeader className="mb-4">
              <div className="flex items-center gap-3">
                <span className="grid size-10 place-items-center rounded-2xl bg-lime-400 text-charcoal-950">
                  <Building2 className="size-5" />
                </span>
                <div>
                  <DialogTitle className="text-xl font-black text-charcoal-950">
                    Create New Restaurant / Property
                  </DialogTitle>
                  <DialogDescription className="text-xs font-semibold text-charcoal-500">
                    Provision a new tenant space. Unique Login ID is generated automatically by server.
                  </DialogDescription>
                </div>
              </div>
            </DialogHeader>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Section 1: Property Details */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-charcoal-100 pb-2">
                  <Building2 className="size-4 text-lime-600" />
                  <h3 className="text-xs font-black text-charcoal-900 uppercase tracking-wider">
                    Property / Restro Information
                  </h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-700">
                      Restaurant Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="e.g. Spice Garden"
                        value={formData.name}
                        onChange={(e) => handleChange("name", e.target.value)}
                        className="rounded-2xl border-charcoal-200 bg-charcoal-50/50 pl-9 font-semibold text-sm focus-visible:ring-lime-400"
                        required
                      />
                      <Building2 className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-700">
                      Slug / Unique Handle
                    </label>
                    <Input
                      placeholder="spice-garden (optional)"
                      value={formData.slug}
                      onChange={(e) => handleChange("slug", e.target.value)}
                      className="rounded-2xl border-charcoal-200 bg-charcoal-50/50 font-semibold text-sm focus-visible:ring-lime-400"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-700">
                      Contact Phone
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="+91 9876543210"
                        value={formData.phone}
                        onChange={(e) => handleChange("phone", e.target.value)}
                        className="rounded-2xl border-charcoal-200 bg-charcoal-50/50 pl-9 font-semibold text-sm focus-visible:ring-lime-400"
                      />
                      <Phone className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-700">
                      Location / Address
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="e.g. MG Road, Bengaluru"
                        value={formData.address}
                        onChange={(e) => handleChange("address", e.target.value)}
                        className="rounded-2xl border-charcoal-200 bg-charcoal-50/50 pl-9 font-semibold text-sm focus-visible:ring-lime-400"
                      />
                      <MapPin className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Section 2: Admin Login Credentials */}
              <div className="space-y-3">
                <div className="flex items-center gap-2 border-b border-charcoal-100 pb-2">
                  <ShieldCheck className="size-4 text-lime-600" />
                  <h3 className="text-xs font-black text-charcoal-900 uppercase tracking-wider">
                    Restro Admin Credentials (Bound to Tenant ID)
                  </h3>
                </div>

                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="space-y-1 sm:col-span-2">
                    <label className="text-xs font-bold text-charcoal-700">
                      Admin Full Name <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        placeholder="e.g. Rajesh Kumar"
                        value={formData.adminName}
                        onChange={(e) => handleChange("adminName", e.target.value)}
                        className="rounded-2xl border-charcoal-200 bg-charcoal-50/50 pl-9 font-semibold text-sm focus-visible:ring-lime-400"
                        required
                      />
                      <User className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-700">
                      Admin Email <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="email"
                        placeholder="admin@spicegarden.com"
                        value={formData.adminEmail}
                        onChange={(e) => handleChange("adminEmail", e.target.value)}
                        className="rounded-2xl border-charcoal-200 bg-charcoal-50/50 pl-9 font-semibold text-sm focus-visible:ring-lime-400"
                        required
                      />
                      <Mail className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal-400" />
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-charcoal-700">
                      Password <span className="text-rose-500">*</span>
                    </label>
                    <div className="relative">
                      <Input
                        type="password"
                        placeholder="••••••••"
                        value={formData.adminPassword}
                        onChange={(e) => handleChange("adminPassword", e.target.value)}
                        className="rounded-2xl border-charcoal-200 bg-charcoal-50/50 pl-9 font-semibold text-sm focus-visible:ring-lime-400"
                        required
                      />
                      <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal-400" />
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleResetAndClose}
                  className="rounded-2xl font-bold"
                >
                  Cancel
                </Button>
                <Button
                  type="submit"
                  disabled={loading}
                  className="rounded-2xl bg-lime-400 font-black text-charcoal-950 hover:bg-lime-500"
                >
                  {loading ? "Provisioning..." : "Create Restaurant"}
                </Button>
              </div>
            </form>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
