import type { Metadata } from "next";
import { LoginForm } from "@/components/site/LoginForm";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Member Login",
  description: "Sign in to your GPSA-UDS member portal.",
};

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      {/* Top bar */}
      <div className="bg-navy-900 py-4">
        <div className="container-max section-padding">
          <Link href="/" className="font-display font-bold text-2xl text-white tracking-tight">
            GPSA-UDS
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          {/* Header */}
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-navy-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="font-display font-bold text-white text-xl">G</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">
              Member Portal
            </h1>
            <p className="text-muted-foreground text-sm">
              Sign in to access your GPSA-UDS dashboard
            </p>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <LoginForm />
          </div>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">
              Not a member yet?{" "}
              <Link
                href="/join"
                className="text-navy-900 font-semibold hover:text-gold-600 transition-colors"
              >
                Join GPSA-UDS
              </Link>
            </p>
            <Link href="/" className="block text-xs text-muted-foreground hover:text-navy-900 transition-colors">
              Back to main site
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
