"use client";

import { useState } from "react";
import { ArrowRight, CheckCircle } from "lucide-react";

export function NewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "loading" | "success" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setStatus("loading");
    // Simulate subscription — wire to a real endpoint or Resend list later
    await new Promise((r) => setTimeout(r, 800));
    setStatus("success");
  };

  if (status === "success") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-navy-900">
        <CheckCircle className="w-10 h-10 text-green-500" />
        <p className="font-semibold">You&apos;re subscribed!</p>
        <p className="text-sm text-muted-foreground">
          We&apos;ll send you updates on events, opportunities, and association news.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2 flex-col sm:flex-row">
      <input
        type="email"
        placeholder="Your email address"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        required
        className="flex-1 px-4 py-3 border border-gray-300 rounded-full focus:outline-none focus:ring-2 focus:ring-navy-900 text-sm"
      />
      <button
        type="submit"
        disabled={status === "loading"}
        className="inline-flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-full font-medium hover:bg-navy-800 transition-colors disabled:opacity-60 text-sm whitespace-nowrap"
      >
        {status === "loading" ? "Subscribing..." : <>Subscribe <ArrowRight className="w-4 h-4" /></>}
      </button>
    </form>
  );
}
