"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { ChefHat, Lock, Mail } from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { SectionCard } from "@/components/app-components";
import {buttonVariants, Button} from "@/components/ui/button";
import { mockUsers } from "@/lib/demo/users";
import { useAuth } from "@/hooks/useAuth";

const loginSchema = z.object({
  email: z.string().email("Enter a valid email address"),
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
    defaultValues: { email: "", password: "" },
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
          <p className="mt-2 text-sm text-charcoal-500">Use one of the demo accounts below.</p>
          <form className="mt-6 grid gap-4" onSubmit={handleSubmit(async (values) => { await login(values.email, values.password); })}>
            <label className="grid gap-2 text-sm font-bold">
              Email
              <span className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-charcoal-400" />
                <input
                  {...register("email")}
                  className="h-12 w-full rounded-2xl border border-charcoal-100 pl-10 pr-3 outline-none focus:border-lime-400 focus:ring-4 focus:ring-lime-100"
                  placeholder="admin@serveai.com"
                  type="email"
                />
              </span>
              {errors.email ? <span className="text-xs font-bold text-rose-600">{errors.email.message}</span> : null}
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
              {errors.password ? <span className="text-xs font-bold text-rose-600">{errors.password.message}</span> : null}
            </label>
            <Button className="h-12 w-full" disabled={isSubmitting} type="submit">
              Login
            </Button>
          </form>
          <div className="mt-6 rounded-3xl bg-lime-50 p-4">
            <p className="text-sm font-black text-lime-800">Demo credentials</p>
            <div className="mt-3 grid gap-2">
              {mockUsers.map((user) => (
                <div key={user.id} className="rounded-2xl bg-white p-3 text-xs font-bold text-charcoal-600">
                  <span className="capitalize text-charcoal-950">{user.role}</span> · {user.email} · {user.password}
                </div>
              ))}
            </div>
          </div>
        </SectionCard>
      </div>
    </main>
  );
}
