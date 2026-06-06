"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { CheckCircle, Upload, CreditCard, Receipt } from "lucide-react";

const schema = z.object({
  full_name:  z.string().min(2, "Full name is required"),
  email:      z.string().email("A valid email is required"),
  student_id: z.string().min(3, "Student index number is required"),
  level:      z.enum(["100_level","200_level","300_level","400_level","500_level","alumnus"], {
    required_error: "Please select your level",
  }),
  phone:      z.string().min(9, "Phone number is required"),
  payment_method: z.enum(["momo","receipt"], { required_error: "Select a payment method" }),
});

type FormData = z.infer<typeof schema>;

interface JoinFormProps {
  fees: Record<string, string>;
}

const LEVEL_LABELS: Record<string, string> = {
  "100_level": "100 Level",
  "200_level": "200 Level",
  "300_level": "300 Level",
  "400_level": "400 Level",
  "500_level": "500 Level",
  alumnus: "Alumni",
};

const LEVEL_FEE_KEYS: Record<string, string> = {
  "100_level": "membership_fee_100_level",
  "200_level": "membership_fee_200_level",
  "300_level": "membership_fee_300_level",
  "400_level": "membership_fee_400_level",
  "500_level": "membership_fee_500_level",
  alumnus: "membership_fee_alumnus",
};

export function JoinForm({ fees }: JoinFormProps) {
  const [status, setStatus] = useState<"idle"|"loading"|"success"|"error">("idle");
  const [receipt, setReceipt] = useState<File | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
    reset,
  } = useForm<FormData>({ resolver: zodResolver(schema) });

  const selectedLevel = watch("level");
  const paymentMethod = watch("payment_method");
  const fee = selectedLevel ? (fees[LEVEL_FEE_KEYS[selectedLevel]] ?? "30") : null;

  const onSubmit = async (data: FormData) => {
    setStatus("loading");
    setServerError(null);

    const formData = new FormData();
    Object.entries(data).forEach(([k, v]) => formData.append(k, v));
    if (receipt) formData.append("receipt", receipt);

    try {
      const res = await fetch("/api/membership/apply", { method: "POST", body: formData });
      const json = await res.json();

      if (!res.ok) {
        setServerError(json.error ?? "Submission failed. Please try again.");
        setStatus("error");
        return;
      }

      setSuccessMsg(json.message);
      setStatus("success");
      reset();
      setReceipt(null);
    } catch {
      setServerError("An unexpected error occurred. Please try again.");
      setStatus("error");
    }
  };

  if (status === "success") {
    return (
      <div className="bg-white rounded-2xl border p-8 text-center">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <CheckCircle className="w-8 h-8 text-green-600" />
        </div>
        <h3 className="font-display text-2xl font-bold text-navy-900 mb-3">
          Application Submitted!
        </h3>
        <p className="text-muted-foreground mb-6">{successMsg}</p>
        <button
          onClick={() => { setStatus("idle"); setSuccessMsg(null); }}
          className="text-sm text-navy-900 underline"
        >
          Submit another application
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
        <Field label="Full Name" error={errors.full_name?.message}>
          <input {...register("full_name")} placeholder="Your full name" className={ic(!!errors.full_name)} />
        </Field>
        <Field label="Email Address" error={errors.email?.message}>
          <input {...register("email")} type="email" placeholder="you@example.com" className={ic(!!errors.email)} />
        </Field>
        <Field label="Student Index Number" error={errors.student_id?.message}>
          <input {...register("student_id")} placeholder="e.g. UDS/FA/PHAR/21/0001" className={ic(!!errors.student_id)} />
        </Field>
        <Field label="Level / Year" error={errors.level?.message}>
          <select {...register("level")} defaultValue="" className={ic(!!errors.level)}>
            <option value="" disabled>Select your level</option>
            {Object.entries(LEVEL_LABELS).map(([val, label]) => (
              <option key={val} value={val}>{label}</option>
            ))}
          </select>
        </Field>
        <Field label="Phone Number" error={errors.phone?.message} className="sm:col-span-2">
          <input {...register("phone")} placeholder="+233 XX XXX XXXX" className={ic(!!errors.phone)} />
        </Field>
      </div>

      {fee && (
        <div className="bg-navy-50 border border-navy-200 rounded-xl px-5 py-4 text-sm text-navy-900">
          Membership due for your level:{" "}
          <span className="font-bold text-base">GHS {fee}</span>
        </div>
      )}

      {/* Payment method */}
      <div>
        <label className="block text-sm font-medium text-navy-900 mb-3">
          Payment Method
        </label>
        {errors.payment_method && (
          <p className="text-red-600 text-xs mb-2">{errors.payment_method.message}</p>
        )}
        <div className="grid sm:grid-cols-2 gap-3">
          <label
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              paymentMethod === "momo"
                ? "border-navy-900 bg-navy-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input {...register("payment_method")} type="radio" value="momo" className="sr-only" />
            <CreditCard className="w-5 h-5 text-navy-900 flex-shrink-0" />
            <div>
              <div className="font-medium text-navy-900 text-sm">Pay Online via MoMo</div>
              <div className="text-xs text-muted-foreground">MTN, Vodafone, AirtelTigo</div>
            </div>
          </label>
          <label
            className={`flex items-center gap-3 p-4 rounded-xl border-2 cursor-pointer transition-colors ${
              paymentMethod === "receipt"
                ? "border-navy-900 bg-navy-50"
                : "border-gray-200 hover:border-gray-300"
            }`}
          >
            <input {...register("payment_method")} type="radio" value="receipt" className="sr-only" />
            <Receipt className="w-5 h-5 text-navy-900 flex-shrink-0" />
            <div>
              <div className="font-medium text-navy-900 text-sm">Upload Payment Receipt</div>
              <div className="text-xs text-muted-foreground">Pay manually, upload proof</div>
            </div>
          </label>
        </div>
      </div>

      {paymentMethod === "momo" && (
        <div className="bg-blue-50 border border-blue-100 rounded-xl p-4 text-sm text-blue-800">
          After submitting this form, you will receive an email with a Paystack
          payment link to complete your Mobile Money payment. Your membership
          will be activated automatically once payment is confirmed.
        </div>
      )}

      {paymentMethod === "receipt" && (
        <div>
          <label className="block text-sm font-medium text-navy-900 mb-1.5">
            Upload Payment Receipt{" "}
            <span className="text-muted-foreground font-normal">(required)</span>
          </label>
          <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-gray-200 rounded-xl cursor-pointer hover:border-navy-900 transition-colors">
            <Upload className="w-5 h-5 text-muted-foreground flex-shrink-0" />
            <span className="text-sm text-muted-foreground">
              {receipt ? receipt.name : "Upload PDF, JPG, or PNG of your receipt"}
            </span>
            <input
              type="file"
              accept=".pdf,.jpg,.jpeg,.png"
              className="hidden"
              onChange={(e) => setReceipt(e.target.files?.[0] ?? null)}
            />
          </label>
        </div>
      )}

      {serverError && (
        <p className="text-red-600 text-sm bg-red-50 px-4 py-3 rounded-xl">{serverError}</p>
      )}

      <button
        type="submit"
        disabled={status === "loading"}
        className="w-full py-4 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition-colors disabled:opacity-60 text-lg"
      >
        {status === "loading" ? "Submitting..." : "Submit Application"}
      </button>
    </form>
  );
}

function Field({
  label, error, children, className = "",
}: {
  label: string; error?: string; children: React.ReactNode; className?: string;
}) {
  return (
    <div className={className || "col-span-full sm:col-span-1"}>
      <label className="block text-sm font-medium text-navy-900 mb-1.5">{label}</label>
      {children}
      {error && <p className="text-red-600 text-xs mt-1">{error}</p>}
    </div>
  );
}

function ic(hasError: boolean) {
  return `w-full px-4 py-3 border rounded-xl text-sm bg-white focus:outline-none focus:ring-2 focus:ring-navy-900 transition-colors ${
    hasError ? "border-red-400" : "border-gray-200 hover:border-gray-300"
  }`;
}
