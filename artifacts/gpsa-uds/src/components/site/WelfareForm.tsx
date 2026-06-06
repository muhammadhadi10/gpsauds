"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Upload } from "lucide-react";

const schema = z.object({
  name: z.string().min(2, "Full name is required"),
  email: z.string().email("A valid email is required"),
  phone: z.string().min(9, "Phone number is required"),
  category: z.enum(["financial", "medical", "bereavement", "emergency", "other"], {
    required_error: "Please select a category",
  }),
  title: z.string().min(5, "Please provide a subject (at least 5 characters)"),
  description: z.string().min(20, "Please describe your situation in more detail"),
});

type FormData = z.infer<typeof schema>;

export function WelfareForm() {
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");
  const [ticketRef, setTicketRef] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    setServerError(null);

    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));
    if (file) formData.append("file", file);

    try {
      const res = await fetch("/api/welfare/submit", {
        method: "POST",
        body: formData,
      });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Submission failed. Please try again.");
        setStatus("error");
        return;
      }

      setTicketRef(json.reference);
      setStatus("success");
      reset();
      setFile(null);
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success" && ticketRef) {
    return (
      <div className="bg-white rounded-2xl border p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-display text-2xl font-bold text-navy-900 mb-2">
          Request Submitted
        </h3>
        <p className="text-muted-foreground mb-4">
          Your welfare request has been received. Please keep your ticket
          reference for follow-up.
        </p>
        <div className="inline-block px-6 py-3 bg-navy-900 text-white font-mono font-bold rounded-xl text-lg">
          {ticketRef}
        </div>
        <p className="text-sm text-muted-foreground mt-4">
          The Welfare Committee will review your request and contact you within
          2–3 business days.
        </p>
        <button
          onClick={() => { setStatus("idle"); setTicketRef(null); }}
          className="mt-6 text-sm text-navy-900 underline"
        >
          Submit another request
        </button>
      </div>
    );
  }

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="bg-white rounded-2xl border p-8 space-y-6"
    >
      <div className="grid sm:grid-cols-2 gap-6">
        <Field label="Full Name" error={errors.name?.message}>
          <input
            {...register("name")}
            placeholder="Your full name"
            className={inputClass(!!errors.name)}
          />
        </Field>
        <Field label="Email Address" error={errors.email?.message}>
          <input
            {...register("email")}
            type="email"
            placeholder="you@example.com"
            className={inputClass(!!errors.email)}
          />
        </Field>
        <Field label="Phone Number" error={errors.phone?.message}>
          <input
            {...register("phone")}
            placeholder="+233 XX XXX XXXX"
            className={inputClass(!!errors.phone)}
          />
        </Field>
        <Field label="Category" error={errors.category?.message}>
          <select
            {...register("category")}
            className={inputClass(!!errors.category)}
            defaultValue=""
          >
            <option value="" disabled>Select a category</option>
            <option value="financial">Financial Aid</option>
            <option value="medical">Medical Support</option>
            <option value="bereavement">Bereavement Support</option>
            <option value="emergency">Emergency Assistance</option>
            <option value="other">Other</option>
          </select>
        </Field>
      </div>

      <Field label="Subject" error={errors.title?.message}>
        <input
          {...register("title")}
          placeholder="Brief subject of your request"
          className={inputClass(!!errors.title)}
        />
      </Field>

      <Field label="Description" error={errors.description?.message}>
        <textarea
          {...register("description")}
          rows={5}
          placeholder="Please describe your situation in detail..."
          className={inputClass(!!errors.description) + " resize-none"}
        />
      </Field>

      <div>
        <label className="block text-sm font-medium text-navy-900 mb-2">
          Supporting Document{" "}
          <span className="text-muted-foreground font-normal">(optional)</span>
        </label>
        <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-navy-900 transition-colors">
          <Upload className="w-5 h-5 text-muted-foreground flex-shrink-0" />
          <span className="text-sm text-muted-foreground">
            {file ? file.name : "Upload PDF, JPG, PNG, or DOCX"}
          </span>
          <input
            type="file"
            accept=".pdf,.jpg,.jpeg,.png,.docx"
            className="hidden"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          />
        </label>
      </div>

      {serverError && (
        <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">
          {serverError}
        </p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-xl transition-colors disabled:opacity-60"
      >
        {status === "loading" ? "Submitting..." : "Submit Welfare Request"}
      </button>
    </form>
  );
}

function Field({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="col-span-full sm:col-span-1">
      <label className="block text-sm font-medium text-navy-900 mb-1.5">
        {label}
      </label>
      {children}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

function inputClass(hasError: boolean) {
  return `w-full px-4 py-3 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 transition-colors ${
    hasError
      ? "border-red-400 focus:ring-red-400"
      : "border-gray-200 hover:border-gray-300"
  }`;
}
