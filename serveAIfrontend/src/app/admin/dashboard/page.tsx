"use client";

import { AIInsightCard, DashboardCard, StatCard, icons } from "@/components/app-components";
import {OrderCard} from "@/components/common/OrderCard";

import {PageHeader} from "@/components/common/PageHeader";
import { insights } from "@/lib/demo/insights";
import { orders } from "@/lib/demo/orders";
import { reviews } from "@/lib/demo/reviews";
import { tables } from "@/lib/demo/tables";
import { formatCurrency } from "@/utils/formatCurrency";

import { useAuth } from "@/hooks/useAuth";

export default function DashboardPage() {
  const { user } = useAuth();
  const revenue = orders.reduce((sum, order) => sum + order.total, 0);
  const hotelName = user?.tenantName || "Hotel Property";

  return (
    <div className="grid gap-6">
      <div className="rounded-3xl bg-gradient-to-r from-charcoal-950 via-charcoal-900 to-charcoal-950 p-6 text-white shadow-xl">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="rounded-full bg-lime-400 px-3 py-1 text-xs font-black text-charcoal-950 uppercase tracking-wider">
                Active Property
              </span>
              {user?.tenantLoginId ? (
                <span className="rounded-full bg-white/10 px-3 py-1 text-xs font-bold text-lime-300 backdrop-blur">
                  Login ID: {user.tenantLoginId}
                </span>
              ) : null}
            </div>
            <h1 className="mt-3 text-3xl font-black tracking-tight sm:text-4xl">
              {hotelName}
            </h1>
            <p className="mt-1 text-sm text-white/70">
              Welcome back, <span className="font-bold text-white">{user?.name || "Admin"}</span>! Here is your property operational overview.
            </p>
          </div>
        </div>
      </div>

      <PageHeader title={`${hotelName} Overview`} description="Revenue, order movement, room activity, reviews, and AI recommendations in one calm command view." />
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard label="Revenue" value={formatCurrency(revenue)} detail="+18% vs yesterday" icon={icons.CreditCard} />
        <StatCard label="Total Orders" value={String(orders.length)} detail="3 active right now" icon={icons.ClipboardList} />
        <StatCard label="Active Tables" value={String(tables.filter((table) => table.occupied).length)} detail="72% occupancy" icon={icons.Hotel} />
        <StatCard label="Delivered" value={String(orders.filter((order) => order.status === "Delivered").length)} detail="SLA 94%" icon={icons.PackageCheck} />
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.15fr_0.85fr]">
        <DashboardCard title="Sales Overview">
          <div className="grid h-72 items-end gap-3 rounded-3xl bg-charcoal-950 p-5 sm:grid-cols-7">
            {[42, 58, 48, 76, 64, 88, 70].map((height, index) => (
              <div key={index} className="rounded-t-2xl bg-lime-400" style={{ height: `${height}%` }} />
            ))}
          </div>
        </DashboardCard>
        <DashboardCard title="AI Insights Preview">
          <div className="grid gap-3">{insights.slice(0, 2).map((insight) => <AIInsightCard key={insight.id} insight={insight} />)}</div>
        </DashboardCard>
      </div>
      <div className="grid gap-6 xl:grid-cols-2">
        <DashboardCard title="Recent Orders">
          <div className="grid gap-3">{orders.slice(0, 3).map((order) => <OrderCard key={order.id} order={order} />)}</div>
        </DashboardCard>
        <DashboardCard title="Recent Reviews">
          <div className="grid gap-3">
            {reviews.map((review) => (
              <div key={review.id} className="rounded-2xl border border-charcoal-100 p-4">
                <div className="flex justify-between gap-4"><strong>{review.guest}</strong><span className="text-sm font-black text-lime-700">{review.rating}/5</span></div>
                <p className="mt-2 text-sm leading-6 text-charcoal-500">{review.comment}</p>
              </div>
            ))}
          </div>
        </DashboardCard>
      </div>
    </div>
  );
}
