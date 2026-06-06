"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter, useSearchParams } from "next/navigation";
import { Eye, EyeOff } from "lucide-react";
import Link from "next/link";
import { createClient } from "@/lib/supabase/client";

const schema = z.object({
  email:    z.string().email("Enter a valid email address"),
  password: z.string().min(1, "Password is required"),
});

type FormData = z.infer<typeof schema>;

const ROLE_DASHBOARDS: Record<string, string> = {
  super_admin:   "/dashboard/admin",
  treasurer:     "/dashboard/treasurer",
  academic:      "/dashboard/academic",
  welfare:       "/dashboard/welfare",
  events:        "/dashboard/events",
  opportunities: "/dashboard/opportunities",
  ediboard:      "/dashboard/ediboard",
  student:       "/dashboard/student",
};

export function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectTo = searchParams.get("redirectTo");

  const [showPassword, setShowPassword] = useState(false);
  const [authError, setAuthError]       = useState<string | null>(null);
  const [loading, setLoading]           = useState(false);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setLoading(true);
    setAuthError(null);

    const supabase = createClient();

    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email:    data.email,
      password: data.password,
    });

    if (error || !authData.user) {
      setAuthError(
        error?.message === "Invalid login credentials"
          ? "Incorrect email or password. Please try again."
          : (error?.message ?? "Sign-in failed. Please try again.")
      );
      setLoading(false);
      return;
    }

    // If middleware set a redirectTo param, honour it (only allow internal paths)
    if (redirectTo && redirectTo.startsWith("/") && !redirectTo.startsWith("//")) {
      router.push(redirectTo);
      return;
    }

    // Otherwise route to their role-specific dashboard
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", authData.user.id)
      .single();

    const role = (profile?.role as string) ?? "student";
    router.push(ROLE_DASHBOARDS[role] ?? "/dashboard/student");
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5">
          Email Address
        </label>
        <input
          {...register("email")}
          type="email"
          autoComplete="email"
          placeholder="your@email.com"
          className={`w-full px-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 transition-colors ${
            errors.email ? "border-red-400" : "border-gray-200"
          }`}
        />
        {errors.email && (
          <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div>
        <div className="flex items-center justify-between mb-1.5">
          <label className="block text-sm font-medium text-navy-900">
            Password
          </label>
          <Link
            href="/forgot-password"
            className="text-xs text-muted-foreground hover:text-navy-900 transition-colors"
          >
            Forgot password?
          </Link>
        </div>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            autoComplete="current-password"
            placeholder="Enter your password"
            className={`w-full px-4 py-3 pr-11 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 transition-colors ${
              errors.password ? "border-red-400" : "border-gray-200"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy-900 transition-colors"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
        )}
      </div>

      {/* Auth error */}
      {authError && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          {authError}
        </div>
      )}

      <button
        type="submit"
        disabled={loading}
        className="w-full py-3.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
      >
        {loading ? "Signing in…" : "Sign In"}
      </button>
    </form>
  );
}
