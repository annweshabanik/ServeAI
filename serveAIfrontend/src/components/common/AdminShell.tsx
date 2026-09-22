"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  BarChart3,
  Bell,
  Bot,
  ChefHat,
  ChevronLeft,
  ChevronRight,
  ClipboardList,
  Home,
  Hotel,
  Layers3,
  LogOut,
  Menu as MenuIcon,
  Settings,
  ShoppingBag,
  Star,
  Truck,
  Users,
} from "lucide-react";
import { ReactNode, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import { cn } from "@/utils/cn";
import { generateInitials } from "@/utils/generateInitials";
import {buttonVariants, Button} from "@/components/ui/button";

const adminLinks = [
  { href: "/admin/dashboard", label: "Dashboard", icon: BarChart3 },
  { href: "/admin/orders", label: "Orders", icon: ClipboardList },
  { href: "/admin/menu", label: "Menu", icon: ShoppingBag },
  { href: "/admin/categories", label: "Categories", icon: Layers3 },
  { href: "/admin/tables", label: "Tables", icon: Hotel },
  { href: "/admin/staff", label: "Staff", icon: Users },
  { href: "/admin/reviews", label: "Reviews", icon: Star },
  { href: "/admin/ai-insights", label: "AI Insights", icon: Bot },
  { href: "/admin/settings", label: "Settings", icon: Settings },
  { href: "/kitchen", label: "Kitchen", icon: ChefHat },
  { href: "/delivery", label: "Delivery", icon: Truck },
  { href: "/order", label: "Guest Order", icon: Home },
];

export function AdminShell({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const { user, logout } = useAuth();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const sidebar = (
    <aside className={cn("flex h-full flex-col border-r border-charcoal-100 bg-white p-4 transition-all", collapsed ? "w-20" : "w-72")}>
      <div className="flex items-center justify-between">
        <Link href="/admin/dashboard" className="flex items-center gap-3">
          <span className="grid size-11 place-items-center rounded-2xl bg-lime-400 text-charcoal-950"><ChefHat className="size-5" /></span>
          {!collapsed ? <span className="text-lg font-black text-charcoal-950">ServeAI POS</span> : null}
        </Link>
        <button aria-label="Collapse sidebar" onClick={() => setCollapsed(!collapsed)} className="hidden rounded-xl p-2 hover:bg-charcoal-50 lg:block">
          {collapsed ? <ChevronRight className="size-4" /> : <ChevronLeft className="size-4" />}
        </button>
      </div>
      <nav className="mt-8 grid gap-2">
        {adminLinks.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link key={href} href={href} className={cn("flex items-center gap-3 rounded-2xl px-3 py-3 text-sm font-bold transition", active ? "bg-charcoal-950 text-white" : "text-charcoal-600 hover:bg-lime-50 hover:text-charcoal-950")}>
              <Icon className="size-5 shrink-0" />
              {!collapsed ? label : null}
            </Link>
          );
        })}
      </nav>
      <div className="mt-auto rounded-3xl bg-lime-100 p-4 text-charcoal-950">
        {!collapsed ? <><p className="text-sm font-black">AI shift brief</p><p className="mt-1 text-xs font-semibold text-charcoal-600">Lunch demand is above average. Keep biryani stock warm.</p></> : <Bot className="size-5" />}
      </div>
    </aside>
  );

  return (
    <div className="min-h-screen bg-charcoal-50">
      <div className="fixed inset-y-0 left-0 z-30 hidden lg:block">{sidebar}</div>
      {mobileOpen ? <div className="fixed inset-0 z-50 lg:hidden"><div className="absolute inset-0 bg-charcoal-950/40" onClick={() => setMobileOpen(false)} /><div className="relative h-full">{sidebar}</div></div> : null}
      <div className={cn("transition-all", collapsed ? "lg:pl-20" : "lg:pl-72")}>
        <header className="sticky top-0 z-20 flex h-20 items-center justify-between border-b border-charcoal-100 bg-white/90 px-4 backdrop-blur md:px-8">
          <div className="flex items-center gap-3">
            <button aria-label="Open navigation" onClick={() => setMobileOpen(true)} className="rounded-xl p-2 hover:bg-charcoal-50 lg:hidden"><MenuIcon className="size-5" /></button>
            <div>
              <div className="flex items-center gap-2">
                <p className="text-sm font-black text-charcoal-950">
                  {user?.tenantName || (user?.role === "superadmin" ? "ServeAI System Admin" : "Hotel POS Center")}
                </p>
                {user?.tenantLoginId ? (
                  <span className="rounded-full bg-lime-100 px-2.5 py-0.5 text-xs font-black text-lime-900 border border-lime-300">
                    ID: {user.tenantLoginId}
                  </span>
                ) : null}
              </div>
              <p className="text-xs font-semibold text-charcoal-500">Live ordering command center</p>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button aria-label="Notifications" className="rounded-2xl border border-charcoal-100 bg-white p-3"><Bell className="size-4" /></button>
            <Button variant="ghost" onClick={logout}><LogOut className="size-4" /> Logout</Button>
            <div className="grid size-10 place-items-center rounded-2xl bg-charcoal-950 text-sm font-black text-white">{generateInitials(user?.name ?? "Admin User")}</div>
          </div>
        </header>
        <main className="p-4 md:p-8">{children}</main>
      </div>
    </div>
  );
}