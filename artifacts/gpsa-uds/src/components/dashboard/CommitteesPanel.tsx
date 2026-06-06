"use client";

import { useState, useTransition, useRef } from "react";
import {
  createCommitteeAccount,
  resetCommitteePassword,
  deactivateCommitteeAccount,
  reactivateCommitteeAccount,
} from "@/lib/actions/admin";
import { UserPlus, Key, ShieldOff, Shield, X, CheckCircle } from "lucide-react";
import type { UserRole } from "@/types";

const STAFF_ROLES: { value: UserRole; label: string }[] = [
  { value: "super_admin",   label: "Super Admin (Executive)" },
  { value: "treasurer",     label: "Treasurer" },
  { value: "academic",      label: "Academic Committee" },
  { value: "welfare",       label: "Welfare Committee" },
  { value: "events",        label: "Events Committee" },
  { value: "opportunities", label: "Opportunities Committee" },
  { value: "ediboard",      label: "Editorial Board (EDIBOARD)" },
];

interface Account {
  id: string;
  full_name: string;
  email: string;
  role: string;
  created_at: string;
  membership_status: string;
}

export function CommitteesPanel({ accounts }: { accounts: Account[] }) {
  const [showForm, setShowForm]    = useState(false);
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback]    = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [newPw, setNewPw]          = useState("");
  const formRef = useRef<HTMLFormElement>(null);

  const act = (fn: () => Promise<void>, msg?: string) => {
    startTransition(async () => {
      try {
        await fn();
        setFeedback(msg ?? "Done.");
        setTimeout(() => setFeedback(null), 3000);
      } catch (e: unknown) {
        setFeedback((e as Error).message);
        setTimeout(() => setFeedback(null), 5000);
      }
    });
  };

  const handleCreate = (fd: FormData) => {
    act(async () => {
      await createCommitteeAccount(fd);
      setShowForm(false);
      formRef.current?.reset();
    }, "Account created successfully.");
  };

  return (
    <div className="space-y-6">
      {feedback && (
        <div className="flex items-center gap-2 px-4 py-3 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-700">
          <CheckCircle className="w-4 h-4 flex-shrink-0" />
          {feedback}
        </div>
      )}

      {/* Create form */}
      {showForm ? (
        <div className="bg-white rounded-2xl border p-6">
          <div className="flex items-center justify-between mb-6">
            <h3 className="font-display font-bold text-navy-900 text-lg">Create Committee Account</h3>
            <button onClick={() => setShowForm(false)} className="p-1.5 hover:bg-gray-100 rounded-lg">
              <X className="w-4 h-4" />
            </button>
          </div>
          <form ref={formRef} action={handleCreate} className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Full Name</label>
              <input name="full_name" required placeholder="e.g. Kwame Asante" className={ic} />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Email Address</label>
              <input name="email" type="email" required placeholder="committee@gpsa-uds.org" className={ic} />
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Role</label>
              <select name="role" required className={ic} defaultValue="">
                <option value="" disabled>Select role…</option>
                {STAFF_ROLES.map((r) => (
                  <option key={r.value} value={r.value}>{r.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-navy-900 mb-1.5">Temporary Password</label>
              <input name="password" type="password" required minLength={8} placeholder="Min. 8 characters" className={ic} />
            </div>
            <div className="sm:col-span-2 flex gap-3 pt-2">
              <button
                type="submit"
                disabled={isPending}
                className="px-6 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-medium hover:bg-navy-800 transition-colors disabled:opacity-60"
              >
                {isPending ? "Creating…" : "Create Account"}
              </button>
              <button
                type="button"
                onClick={() => setShowForm(false)}
                className="px-6 py-2.5 border rounded-xl text-sm font-medium hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      ) : (
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-5 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-medium hover:bg-navy-800 transition-colors"
        >
          <UserPlus className="w-4 h-4" />
          Add Committee Account
        </button>
      )}

      {/* Password reset modal */}
      {resetTarget && (
        <div className="fixed inset-0 bg-black/40 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-sm w-full shadow-xl">
            <h3 className="font-display font-bold text-navy-900 mb-4">Reset Password</h3>
            <input
              type="password"
              placeholder="New password (min. 8 chars)"
              value={newPw}
              onChange={(e) => setNewPw(e.target.value)}
              className={ic}
            />
            <div className="flex gap-3 mt-4">
              <button
                onClick={() =>
                  act(async () => {
                    await resetCommitteePassword(resetTarget, newPw);
                    setResetTarget(null);
                    setNewPw("");
                  }, "Password reset successfully.")
                }
                disabled={isPending || newPw.length < 8}
                className="flex-1 py-2.5 bg-navy-900 text-white rounded-xl text-sm font-medium disabled:opacity-60"
              >
                {isPending ? "Resetting…" : "Reset Password"}
              </button>
              <button
                onClick={() => { setResetTarget(null); setNewPw(""); }}
                className="flex-1 py-2.5 border rounded-xl text-sm font-medium"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Accounts list */}
      <div className="bg-white rounded-2xl border overflow-hidden">
        <div className="px-6 py-4 border-b">
          <h3 className="font-display font-bold text-navy-900">Existing Committee Accounts</h3>
        </div>
        <div className="divide-y">
          {accounts.length === 0 ? (
            <div className="py-12 text-center text-muted-foreground text-sm">
              No committee accounts yet.
            </div>
          ) : (
            accounts.map((acc) => (
              <div key={acc.id} className="flex items-center gap-4 px-6 py-4">
                <div className="w-9 h-9 rounded-full bg-navy-900 flex items-center justify-center flex-shrink-0">
                  <span className="text-white text-xs font-bold">{acc.full_name.charAt(0)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-navy-900 text-sm">{acc.full_name}</p>
                  <p className="text-xs text-muted-foreground">{acc.email}</p>
                </div>
                <span className="text-xs font-medium text-muted-foreground bg-gray-100 px-2.5 py-0.5 rounded-full capitalize hidden sm:block">
                  {acc.role.replace(/_/g, " ")}
                </span>
                <div className="flex items-center gap-1 flex-shrink-0">
                  <button
                    onClick={() => setResetTarget(acc.id)}
                    title="Reset password"
                    className="p-1.5 text-gold-600 hover:bg-gold-50 rounded-lg transition-colors"
                  >
                    <Key className="w-4 h-4" />
                  </button>
                  {acc.membership_status === "suspended" ? (
                    <button
                      onClick={() => act(() => reactivateCommitteeAccount(acc.id), "Account reactivated.")}
                      disabled={isPending}
                      title="Reactivate"
                      className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors"
                    >
                      <Shield className="w-4 h-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => act(() => deactivateCommitteeAccount(acc.id), "Account deactivated.")}
                      disabled={isPending}
                      title="Deactivate"
                      className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors"
                    >
                      <ShieldOff className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}

const ic = "w-full px-4 py-2.5 border rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 border-gray-200";
