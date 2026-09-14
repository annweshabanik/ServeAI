import type { OrderStatus } from "@/types";

export const orderStatuses: OrderStatus[] = [
  "Placed",
  "Accepted",
  "Preparing",
  "Ready",
  "Out For Delivery",
  "Delivered",
  "Feedback Pending",
];

export function statusTone(status: OrderStatus) {
  const tones: Record<OrderStatus, string> = {
    Placed: "bg-amber-100 text-amber-800 border-amber-200",
    Accepted: "bg-sky-100 text-sky-800 border-sky-200",
    Preparing: "bg-orange-100 text-orange-800 border-orange-200",
    Ready: "bg-lime-100 text-lime-800 border-lime-200",
    "Out For Delivery": "bg-indigo-100 text-indigo-800 border-indigo-200",
    Delivered: "bg-emerald-100 text-emerald-800 border-emerald-200",
    "Feedback Pending": "bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200",
    Delayed: "bg-rose-500 text-white border-rose-600",
  };

  return tones[status] || "bg-charcoal-100 text-charcoal-800 border-charcoal-200";
}
