"use client";

import { useState, useTransition } from "react";
import { approveMembership, rejectMembership } from "@/lib/actions/admin";
import { CheckCircle, XCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  pending:  "bg-yellow-100 text-yellow-800",
  active:   "bg-green-100 text-green-800",
  expired:  "bg-gray-100 text-gray-600",
  suspended:"bg-red-100 text-red-700",
};

const TIER_LABEL: Record<string, string> = {
  "100_level": "100 Level",
  "200_level": "200 Level",
  "300_level": "300 Level",
  "400_level": "400 Level",
  "500_level": "500 Level",
  alumnus: "Alumni",
};

interface Membership {
  id: string;
  user_id: string;
  status: string;
  tier: string;
  academic_year: string;
  start_date: string | null;
  end_date: string | null;
  notes: string | null;
  created_at: string;
  profiles: { full_name: string; email: string; student_id: string | null; level: string | null } | null;
}

export function MembershipsTable({ memberships }: { memberships: Membership[] }) {
  const [filter, setFilter] = useState<"all" | "pending" | "active" | "expired">("all");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<{ id: string; msg: string } | null>(null);

  const filtered = filter === "all" ? memberships : memberships.filter((m) => m.status === filter);

  const act = (id: string, fn: () => Promise<void>) => {
    startTransition(async () => {
      try {
        await fn();
        setFeedback({ id, msg: "Done." });
        setTimeout(() => setFeedback(null), 2000);
      } catch (e: unknown) {
        setFeedback({ id, msg: (e as Error).message });
        setTimeout(() => setFeedback(null), 4000);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      {/* Filters */}
      <div className="px-6 py-4 border-b flex flex-wrap gap-2">
        {(["all","pending","active","expired"] as const).map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-colors capitalize ${
              filter === s
                ? "bg-navy-900 text-white border-navy-900"
                : "bg-white text-muted-foreground border-gray-200 hover:border-navy-900"
            }`}
          >
            {s} {s === "all" ? `(${memberships.length})` : `(${memberships.filter((m) => m.status === s).length})`}
          </button>
        ))}
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              {["Student", "Index No.", "Level / Tier", "Year", "Status", "Notes", "Applied", "Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={8} className="text-center py-12 text-muted-foreground">
                  No memberships found.
                </td>
              </tr>
            ) : (
              filtered.map((m) => (
                <tr key={m.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <p className="font-medium text-navy-900">{m.profiles?.full_name ?? "—"}</p>
                    <p className="text-xs text-muted-foreground">{m.profiles?.email ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3 text-xs font-mono text-muted-foreground">
                    {m.profiles?.student_id ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {TIER_LABEL[m.tier] ?? m.tier}
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">{m.academic_year}</td>
                  <td className="px-4 py-3">
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[m.status] ?? ""}`}>
                      {m.status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground max-w-[140px]">
                    <span className="line-clamp-2">{m.notes ?? "—"}</span>
                  </td>
                  <td className="px-4 py-3 text-xs text-muted-foreground">
                    {new Date(m.created_at).toLocaleDateString("en-GH", { day: "numeric", month: "short", year: "numeric" })}
                  </td>
                  <td className="px-4 py-3">
                    {m.status === "pending" && (
                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => act(m.id, () => approveMembership(m.id, m.user_id))}
                          disabled={isPending}
                          title="Approve"
                          className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => act(m.id, () => rejectMembership(m.id, m.user_id))}
                          disabled={isPending}
                          title="Reject"
                          className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                        >
                          <XCircle className="w-4 h-4" />
                        </button>
                      </div>
                    )}
                    {feedback?.id === m.id && (
                      <span className="text-xs text-blue-600">{feedback.msg}</span>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t text-xs text-muted-foreground">
        Showing {filtered.length} of {memberships.length} records
      </div>
    </div>
  );
}
