"use client";

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { Eye, EyeOff, CheckCircle, AlertTriangle } from "lucide-react";

const schema = z
  .object({
    password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Must contain at least one uppercase letter")
      .regex(/[0-9]/, "Must contain at least one number"),
    confirm: z.string(),
  })
  .refine((d) => d.password === d.confirm, {
    message: "Passwords do not match",
    path: ["confirm"],
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

export function ResetPasswordForm() {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error" | "invalid_link">(
    "idle"
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const password = watch("password", "");

  // Supabase sends the user here with an access_token in the hash fragment.
  // The @supabase/ssr client picks this up automatically when getSession() is called,
  // but we need to explicitly set the session from the URL tokens.
  useEffect(() => {
    const supabase = createClient();
    supabase.auth.onAuthStateChange(async (event) => {
      if (event === "PASSWORD_RECOVERY") {
        // Session is now set — form is ready
        setStatus("idle");
      }
    });

    // Also check if we already have a session (e.g. user navigated back)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) setStatus("invalid_link");
    });
  }, []);

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    setErrMsg(null);

    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({
      password: data.password,
    });

    if (error) {
      setErrMsg(error.message);
      setStatus("error");
      return;
    }

    setStatus("success");

    // Wait 2s then redirect to their dashboard
    setTimeout(async () => {
      const { data: profileData } = await supabase
        .from("profiles")
        .select("role")
        .single();
      const role = (profileData?.role as string) ?? "student";
      router.push(ROLE_DASHBOARDS[role] ?? "/dashboard/student");
    }, 2000);
  };

  if (status === "invalid_link") {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-14 h-14 bg-red-100 rounded-full flex items-center justify-center mx-auto">
          <AlertTriangle className="w-7 h-7 text-red-600" />
        </div>
        <h3 className="font-display font-bold text-xl text-navy-900">
          Invalid or Expired Link
        </h3>
        <p className="text-muted-foreground text-sm">
          This password reset link is invalid or has expired. Please request a
          new one.
        </p>
        <a
          href="/forgot-password"
          className="inline-block mt-2 px-6 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-medium hover:bg-navy-800 transition-colors"
        >
          Request New Link
        </a>
      </div>
    );
  }

  if (status === "success") {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="font-display font-bold text-xl text-navy-900">
          Password Updated!
        </h3>
        <p className="text-muted-foreground text-sm">
          Your password has been changed successfully. Redirecting you to your
          dashboard…
        </p>
      </div>
    );
  }

  const strengthChecks = [
    { label: "8+ characters", ok: password.length >= 8 },
    { label: "Uppercase letter", ok: /[A-Z]/.test(password) },
    { label: "Number", ok: /[0-9]/.test(password) },
  ];

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5">
          New Password
        </label>
        <div className="relative">
          <input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Create a strong password"
            className={`w-full px-4 py-3 pr-11 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 transition-colors ${
              errors.password ? "border-red-400" : "border-gray-200"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy-900"
            aria-label={showPassword ? "Hide" : "Show"}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.password && (
          <p className="text-red-600 text-xs mt-1">{errors.password.message}</p>
        )}

        {/* Strength indicator */}
        {password.length > 0 && (
          <div className="mt-3 flex gap-2 flex-wrap">
            {strengthChecks.map(({ label, ok }) => (
              <span
                key={label}
                className={`text-xs px-2 py-0.5 rounded-full font-medium ${
                  ok
                    ? "bg-green-100 text-green-700"
                    : "bg-gray-100 text-gray-400"
                }`}
              >
                {ok ? "✓" : "○"} {label}
              </span>
            ))}
          </div>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5">
          Confirm Password
        </label>
        <div className="relative">
          <input
            {...register("confirm")}
            type={showConfirm ? "text" : "password"}
            autoComplete="new-password"
            placeholder="Repeat your new password"
            className={`w-full px-4 py-3 pr-11 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 transition-colors ${
              errors.confirm ? "border-red-400" : "border-gray-200"
            }`}
          />
          <button
            type="button"
            onClick={() => setShowConfirm(!showConfirm)}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-navy-900"
            aria-label={showConfirm ? "Hide" : "Show"}
          >
            {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        </div>
        {errors.confirm && (
          <p className="text-red-600 text-xs mt-1">{errors.confirm.message}</p>
        )}
      </div>

      {errMsg && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          {errMsg}
        </div>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-3.5 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Updating…" : "Update Password"}
      </button>
    </form>
  );
}
