"use client";

import { useState, useTransition } from "react";
import { updateMemberRole, toggleMemberActive } from "@/lib/actions/admin";
import type { Profile, UserRole, MembershipStatus } from "@/types";
import { Shield, ShieldOff, ChevronDown, Search, Filter } from "lucide-react";

const ROLES: UserRole[] = [
  "super_admin","treasurer","academic","welfare",
  "events","opportunities","ediboard","student",
];

const STATUS_COLORS: Record<string, string> = {
  active:    "bg-green-100 text-green-700",
  pending:   "bg-yellow-100 text-yellow-700",
  expired:   "bg-gray-100 text-gray-600",
  suspended: "bg-red-100 text-red-700",
};

type Member = Profile & {
  memberships?: Array<{ status: MembershipStatus; tier: string; academic_year: string }>;
};

export function MembersTable({ members }: { members: Member[] }) {
  const [search, setSearch]       = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | UserRole>("all");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback]   = useState<string | null>(null);
  const [suspended, setSuspended] = useState<Set<string>>(new Set());

  const filtered = members.filter((m) => {
    const matchSearch =
      m.full_name.toLowerCase().includes(search.toLowerCase()) ||
      m.email.toLowerCase().includes(search.toLowerCase()) ||
      (m.student_id ?? "").toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || m.role === roleFilter;
    return matchSearch && matchRole;
  });

  const isSuspended = (id: string) => suspended.has(id);

  const act = (fn: () => Promise<void>) => {
    startTransition(async () => {
      try {
        await fn();
        setFeedback("Updated successfully.");
        setTimeout(() => setFeedback(null), 2000);
      } catch (e: unknown) {
        setFeedback((e as Error).message);
        setTimeout(() => setFeedback(null), 3000);
      }
    });
  };

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      {/* Filters bar */}
      <div className="px-6 py-4 border-b flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <input
            type="text"
            placeholder="Search name, email, index number…"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-4 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900"
          />
        </div>
        <div className="relative">
          <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <select
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value as "all" | UserRole)}
            className="pl-9 pr-8 py-2 border rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 appearance-none bg-white"
          >
            <option value="all">All Roles</option>
            {ROLES.map((r) => (
              <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
            ))}
          </select>
          <ChevronDown className="absolute right-2 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
        </div>
      </div>

      {feedback && (
        <div className="px-6 py-2 bg-blue-50 text-blue-700 text-sm border-b">{feedback}</div>
      )}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              <th className="text-left px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Member</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Index No.</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Role</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Membership</th>
              <th className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Joined</th>
              <th className="text-right px-6 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">Suspend</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr>
                <td colSpan={6} className="text-center py-12 text-muted-foreground">
                  No members match your search.
                </td>
              </tr>
            ) : (
              filtered.map((m) => {
                const membership = m.memberships?.[0];
                const suspendedNow = isSuspended(m.id);
                return (
                  <tr key={m.id} className="hover:bg-gray-50">
                    <td className="px-6 py-3">
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center flex-shrink-0">
                          {m.avatar_url ? (
                            <img src={m.avatar_url} alt={m.full_name} className="w-8 h-8 rounded-full object-cover" />
                          ) : (
                            <span className="text-white text-xs font-bold">{m.full_name.charAt(0)}</span>
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-navy-900">{m.full_name}</p>
                          <p className="text-xs text-muted-foreground">{m.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">
                      {m.student_id ?? "—"}
                    </td>
                    <td className="px-4 py-3">
                      <select
                        defaultValue={m.role}
                        disabled={isPending}
                        onChange={(e) =>
                          act(() => updateMemberRole(m.id, e.target.value as UserRole))
                        }
                        className="text-xs border rounded-lg px-2 py-1 focus:outline-none focus:ring-1 focus:ring-navy-900 capitalize"
                      >
                        {ROLES.map((r) => (
                          <option key={r} value={r}>{r.replace(/_/g, " ")}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3">
                      {membership ? (
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[membership.status] ?? STATUS_COLORS.expired}`}>
                          {membership.status}
                        </span>
                      ) : (
                        <span className="text-xs text-muted-foreground">No membership</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {new Date(m.created_at).toLocaleDateString("en-GH", { day:"numeric", month:"short", year:"numeric" })}
                    </td>
                    <td className="px-6 py-3 text-right">
                      <button
                        onClick={() => {
                          const nextSuspended = !suspendedNow;
                          setSuspended((prev) => {
                            const s = new Set(prev);
                            nextSuspended ? s.add(m.id) : s.delete(m.id);
                            return s;
                          });
                          act(() => toggleMemberActive(m.id, !nextSuspended));
                        }}
                        disabled={isPending}
                        title={suspendedNow ? "Reactivate account" : "Suspend account"}
                        className={`p-1.5 rounded-lg transition-colors ${
                          suspendedNow
                            ? "text-green-600 hover:bg-green-50"
                            : "text-red-500 hover:bg-red-50"
                        }`}
                      >
                        {suspendedNow
                          ? <Shield className="w-4 h-4" />
                          : <ShieldOff className="w-4 h-4" />}
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>

      <div className="px-6 py-3 border-t text-xs text-muted-foreground">
        Showing {filtered.length} of {members.length} members
      </div>
    </div>
  );
}
