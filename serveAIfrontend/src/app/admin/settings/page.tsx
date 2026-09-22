"use client";

import {  ReusableForm, SectionCard } from "@/components/app-components";
import {PageHeader} from "@/components/common/PageHeader";

import {buttonVariants, Button} from "@/components/ui/button";

import { toast } from "sonner";

import { useAuth } from "@/hooks/useAuth";

export default function SettingsPage() {
  const { user } = useAuth();
  const cards = ["Business Profile", "Branding", "Theme", "Notifications"];
  return (
    <div className="grid gap-6">
      <PageHeader title="Settings" description="Hotel profile, brand controls, theme choices, and notification preferences." />
      <div className="grid gap-4 xl:grid-cols-2">
        {cards.map((title) => (
          <SectionCard key={title}>
            <h2 className="text-xl font-black">{title}</h2>
            <ReusableForm>
              <label className="grid gap-2 text-sm font-bold">Name<input defaultValue={title === "Business Profile" ? (user?.tenantName || "Hotel Property") : title} className="h-11 rounded-xl border border-charcoal-100 px-3" /></label>
              <label className="flex items-center justify-between gap-3 text-sm font-bold">Enabled<input type="checkbox" defaultChecked /></label>
              <Button type="button" onClick={() => toast.success(`${title} updated`)}>Save changes</Button>
            </ReusableForm>
          </SectionCard>
        ))}
      </div>
    </div>
  );
}
