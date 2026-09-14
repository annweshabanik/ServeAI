"use client";

import type { Order, OrderStatus } from "@/types";
import { formatCurrency } from "@/utils/formatCurrency";
import { formatTime } from "@/utils/formatTime";
import { Checkbox } from "@/components/ui/checkbox";
import { Field, FieldGroup, FieldLabel } from "@/components/ui/field";
import { StatusBadge } from "@/components/app-components";
import { useOrderTimer } from "@/hooks/useOrderTimer";
import { cn } from "@/lib/utils";

interface OrderCardProps {
  order: Order;
  editable?: boolean;
  isSelected?: boolean;
  showCheckbox?: boolean;
  onSelectToggle?: () => void;
}

export function OrderCard({
  order,
  editable = false,
  isSelected = false,
  showCheckbox = true,
  onSelectToggle = () => {},
}: OrderCardProps) {
  // Hook usage integration (SLA live timer setup for orders with 'Ready' status)
  const { isDelayed, formattedTime } = useOrderTimer({
    readyAt: (order as any).readyAt,
    targetDurationSeconds: 120, // 2 Mins standard cutoff
    isActive: order.status === "Ready",
  });

  return (
    <article
      className={cn(
        "relative rounded-3xl border p-4 shadow-soft transition-all duration-300",
        // Default State Configuration
        isSelected ? "border-primary bg-primary-50/20 ring-1 ring-primary/20" : "border-charcoal-100 bg-white",
        // DELAYED STATE GLOWING STYLES: Pure SaaS standard system design
        isDelayed && "border-rose-500 bg-rose-50/10 shadow-[0_0_15px_rgba(244,63,94,0.25)] animate-pulse"
      )}
    >
      <div className="flex items-start justify-between gap-3">
        {showCheckbox && (
          <FieldGroup>
            <Field orientation="horizontal" className="flex items-center">
              <Checkbox
                id={`checkbox-${order.id}`}
                name={`checkbox-${order.id}`}
                checked={isSelected}
                onCheckedChange={onSelectToggle}
                className="border-gray-600 data-[state=checked]:bg-primary"
              />
            </Field>
          </FieldGroup>
        )}
        
        {/* Live dynamic layout shifting badge depending on order timer SLA thresholds */}
        <div className="flex items-center gap-2">
          {order.status === "Ready" && (
            <div className="flex items-center gap-1.5">
              {isDelayed ? (
                <span className="bg-rose-500 text-white font-extrabold text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-md shadow-sm">
                  🚨 Delayed
                </span>
              ) : (
                <span className="bg-charcoal-100 text-charcoal-700 font-bold text-xs px-2 py-0.5 rounded-md">
                  ⏳ {formattedTime}
                </span>
              )}
            </div>
          )}
          {/* Default read-only status badge logic */}
          <StatusBadge status={order.status} />
        </div>
      </div>

      <div className="mt-2">
        <h3 className="font-black text-charcoal-950">Order #{order.id}</h3>
        <p className="mt-1 text-sm text-charcoal-500">{order.room} · {order.guest}</p>
      </div>

      <div className="mt-4 space-y-2">
        {order.items.map((item) => (
          <div key={`${order.id}-${item.id}`} className="flex justify-between gap-3 text-sm">
            <span className="text-charcoal-600">{item.quantity}x {item.name}</span>
            <span className="font-bold">{formatCurrency(item.price * item.quantity)}</span>
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-charcoal-100 pt-4">
        <span className="text-xs font-bold text-charcoal-400">{formatTime(order.createdAt)} · {order.eta}</span>
        <span className="text-lg font-black text-charcoal-950">{formatCurrency(order.total)}</span>
      </div>
    </article>
  );
}