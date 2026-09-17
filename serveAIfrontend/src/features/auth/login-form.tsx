"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChefHat, Lock, KeyRound } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SectionCard } from "@/components/app-components";
import { Button } from "@/components/ui/button";
import { mockUsers } from "@/lib/demo/users";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  identifier: z.string().min(1, "Login ID or Email is required"),
  password: z.string().min(1, "Password is required"),
});

type LoginValues = z.infer<typeof loginSchema>;

export function LoginForm() {
  const { login } = useAuth();
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<LoginValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: { identifier: "", password: "" },
  });

  return (
    <main className="min-h-screen bg-charcoal-950 p-4 text-white md:p-8">
      <div className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[1fr_460px]">
        <section>
          <div className="inline-flex items-center gap-3 rounded-3xl bg-white/10 px-4 py-3">
            <span className="grid size-11 place-items-center rounded-2xl bg-lime-400 text-charcoal-950">
              <ChefHat className="size-5" />
            </span>
            <div>
              <p className="text-sm font-black">ServeAI POS</p>
              <p className="text-xs font-semibold text-white/60">Role-based hotel operations</p>
            </div>
          </div>
          <h1 className="mt-8 max-w-3xl text-5xl font-black tracking-tight md:text-7xl">
            Sign in to your hotel command center.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-white/70">
            Admins manage the full system, chefs run the kitchen board, and waiters handle ordering and delivery workflows.
          </p>
        </section>

        <SectionCard className="bg-white text-charcoal-950">
          <h2 className="text-2xl font-black">Login</h2>
          <p className="mt-2 text-sm text-charcoal-500">Sign in with your Tenant Login ID or Super Admin Email.</p>
          <form
            className="mt-6 grid gap-4"
            onSubmit={handleSubmit(async (values) => {
              await login(values.identifier, values.password);
            })}
          >
            <label className="grid gap-2 text-sm font-bold">
              Login ID / Email
              <span className="relative">
                <KeyRound className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal-400" />
                <input
                  {...register("identifier")}
                  className="h-12 w-full rounded-2xl border border-charcoal-100 pl-10 pr-3 outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
                  placeholder="e.g. Lotus@7K2 or superadmin@serveai.com"
                  type="text"
                  autoCapitalize="none"
                  autoCorrect="off"
                />
              </span>
              {errors.identifier ? (
                <span className="text-xs font-bold text-rose-600">{errors.identifier.message}</span>
              ) : null}
            </label>
            <label className="grid gap-2 text-sm font-bold">
              Password
              <span className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal-400" />
                <input
                  {...register("password")}
                  className="h-12 w-full rounded-2xl border border-charcoal-100 pl-10 pr-3 outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
                  placeholder="Password"
                  type="password"
                />
              </span>
              {errors.password ? (
                <span className="text-xs font-bold text-rose-600">{errors.password.message}</span>
              ) : null}
            </label>
            <Button className="h-12 w-full" disabled={isSubmitting} type="submit">
              Login
            </Button>
          </form>
          <div className="mt-6 rounded-3xl bg-lime-50 p-4">
            <p className="text-sm font-black text-lime-800">Demo credentials</p>
            <div className="mt-3 grid gap-2">
              <div className="rounded-2xl bg-white p-3 text-xs font-bold text-charcoal-600">
                <span className="capitalize text-charcoal-950">Superadmin</span> · superadmin@serveai.com · superadmin123
              </div>
              <div className="rounded-2xl bg-white p-3 text-xs font-bold text-charcoal-600">
                <span className="capitalize text-charcoal-950">Tenant Admin</span> · Login ID: <code className="rounded bg-lime-100 px-1 py-0.5 font-mono text-lime-900">Lotus@7K2</code> · admin123
              </div>
              <div className="rounded-2xl bg-white p-3 text-xs font-bold text-charcoal-600">
                <span className="capitalize text-charcoal-950">Tenant 2 Admin</span> · Login ID: <code className="rounded bg-lime-100 px-1 py-0.5 font-mono text-lime-900">Baba#91A</code> · admin123
              </div>
            </div>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
