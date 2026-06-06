"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { createClient } from "@/lib/supabase/client";
import { CheckCircle, Mail } from "lucide-react";

const schema = z.object({
  email: z.string().email("Enter a valid email address"),
});
type FormData = z.infer<typeof schema>;

export function ForgotPasswordForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "sent" | "error">(
    "idle"
  );
  const [errMsg, setErrMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    getValues,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    setErrMsg(null);
    const supabase = createClient();
    const { error } = await supabase.auth.resetPasswordForEmail(data.email, {
      redirectTo: `${window.location.origin}/reset-password`,
    });
    if (error) {
      setErrMsg(error.message);
      setStatus("error");
    } else {
      setStatus("sent");
    }
  };

  if (status === "sent") {
    return (
      <div className="text-center py-4 space-y-4">
        <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto">
          <CheckCircle className="w-7 h-7 text-green-600" />
        </div>
        <h3 className="font-display font-bold text-xl text-navy-900">
          Check your inbox
        </h3>
        <p className="text-muted-foreground text-sm leading-relaxed">
          We sent a password reset link to{" "}
          <span className="font-medium text-navy-900">{getValues("email")}</span>.
          The link expires in 1 hour.
        </p>
        <p className="text-xs text-muted-foreground pt-2">
          Didn&apos;t receive it? Check your spam folder or{" "}
          <button
            onClick={() => setStatus("idle")}
            className="text-navy-900 underline"
          >
            try again
          </button>
          .
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-navy-900 mb-1.5">
          Email Address
        </label>
        <div className="relative">
          <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            {...register("email")}
            type="email"
            autoComplete="email"
            placeholder="your@email.com"
            className={`w-full pl-10 pr-4 py-3 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 transition-colors ${
              errors.email ? "border-red-400" : "border-gray-200"
            }`}
          />
        </div>
        {errors.email && (
          <p className="text-red-600 text-xs mt-1">{errors.email.message}</p>
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
        {status === "loading" ? "Sending…" : "Send Reset Link"}
      </button>
    </form>
  );
}
