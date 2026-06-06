import type { Metadata } from "next";
import Link from "next/link";
import { ResetPasswordForm } from "@/components/site/ResetPasswordForm";

export const metadata: Metadata = {
  title: "Set New Password",
  description: "Choose a new password for your GPSA-UDS member portal account.",
};

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <div className="bg-navy-900 py-4">
        <div className="container-max section-padding">
          <Link
            href="/"
            className="font-display font-bold text-2xl text-white tracking-tight"
          >
            GPSA-UDS
          </Link>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center px-4 py-16">
        <div className="w-full max-w-md">
          <div className="text-center mb-8">
            <div className="w-14 h-14 bg-navy-900 rounded-2xl flex items-center justify-center mx-auto mb-4">
              <span className="font-display font-bold text-white text-xl">G</span>
            </div>
            <h1 className="font-display text-3xl font-bold text-navy-900 mb-2">
              Set New Password
            </h1>
            <p className="text-muted-foreground text-sm">
              Choose a strong password for your GPSA-UDS account.
            </p>
          </div>

          <div className="bg-white rounded-2xl border shadow-sm p-8">
            <ResetPasswordForm />
          </div>
        </div>
      </div>
    </div>
  );
}
