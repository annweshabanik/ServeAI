"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Building2,
  ChevronLeft,
  ChevronRight,
  Crown,
  Globe,
  LogOut,
  Menu as MenuIcon,
  PlusCircle,
  ShieldCheck,
  Store,
  Users,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";
import { generateInitials } from "@/utils/generateInitials";
import { Button } from "@/components/ui/button";

interface SuperAdminShellProps {
  children: ReactNode;
  onOpenCreateModal?: () => void;
}

const superAdminLinks = [
  { href: "/superadmin", label: "Overview & Properties", icon: Building2 },
];

export function SuperAdminShell({ children, onOpenCreateModal }: SuperAdminShellProps) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <aside className={cn("flex h-full flex-col border-r border-charcoal-100 bg-white p-4 transition-all", collapsed ? "w-20" : "w-72")}>
      <div className="flex items-center justify-between">
        <Link href="/superadmin" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-charcoal-950 text-lime-400">
            <Crown className="size-6" />
          </span>
          {!collapsed ? (
            <div className="flex flex-col">
              <span className="text-lg font-black text-charcoal-950 leading-tight">ServeAI</span>
              <span className="text-xs font-bold text-lime-600 uppercase tracking-wider">Super Admin</span>
            </div>
          ) : null}
        </Link>
        <button
          aria-label="Collapse sidebar"
          onClick={() => setCollapsed(!collapsed)}
          className="hidden rounded-xl p-2 hover:bg-charcoal-50 lg:block"
        >
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>

      {onOpenCreateModal && (
        <div className="mt-6">
          <Button
            onClick={onOpenCreateModal}
            className={cn("w-full bg-lime-400 text-charcoal-950 hover:bg-lime-500 font-bold justify-start", collapsed ? "px-3" : "px-4")}
          >
            <PlusCircle className="size-5 shrink-0" />
            {!collapsed ? <span>New Restaurant</span> : null}
          </Button>
        </div>
      )}

      <nav className="mt-6 grid gap-2">
        {superAdminLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition",
                active
                  ? "bg-charcoal-950 text-white"
                  : "text-charcoal-600 hover:bg-lime-50 hover:text-charcoal-950"
              )}
            >
              <Icon className="size-5 shrink-0" />
              {!collapsed ? label : null}
            </Link>
          );
        })}
      </nav>

      <div className="mt-auto rounded-3xl bg-charcoal-950 p-4 text-white">
        {!collapsed ? (
          <>
            <div className="flex items-center gap-2 text-lime-400 text-xs font-black uppercase tracking-wider">
              <ShieldCheck className="size-4" /> Multi-Tenant System
            </div>
            <p className="mt-1 text-xs font-medium text-charcoal-300">
              ServeAI Platform Control Center & Tenant Provisioning
            </p>
          </>
        ) : (
          <ShieldCheck className="size-5 text-lime-400" />
        )}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-charcoal-50">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {mobileOpen ? (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div className="absolute inset-0 bg-charcoal-950/40" onClick={() => setMobileOpen(false)} />
          <div className="relative h-full">{sidebar}</div>
        </div>
      ) : null}
      <div className={cn("transition-all", collapsed ? "lg:pl-20" : "lg:pl-72")}>
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-charcoal-100 bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button
              aria-label="Open navigation"
              onClick={() => setMobileOpen(true)}
              className="rounded-xl p-2 hover:bg-charcoal-50 lg:hidden"
            >
              <MenuIcon className="size-5" />
            </button>
            <div>
              <p className="text-sm font-black text-charcoal-950 flex items-center gap-2">
                ServeAI Platform Portal <span className="rounded-full bg-lime-100 px-2 py-0.5 text-xs font-bold text-lime-800">Super Admin</span>
              </p>
              <p className="text-xs font-semibold text-charcoal-500">Tenant & Property Management Dashboard</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            {onOpenCreateModal && (
              <Button
                onClick={onOpenCreateModal}
                size="sm"
                className="bg-lime-400 text-charcoal-950 hover:bg-lime-500 font-bold hidden sm:flex"
              >
                <PlusCircle className="size-4" /> Create Restaurant
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={logout}>
              <LogOut className="size-4" /> Logout
            </Button>
            <div className="grid size-10 place-items-center rounded-2xl bg-charcoal-950 text-sm font-black text-lime-400 border-2 border-lime-400">
              {generateInitials(user?.name ?? "Super Admin")}
            </div>
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}
