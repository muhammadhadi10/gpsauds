"use client";

import { useState, useTransition } from "react";
import { toggleOpportunityStatus } from "@/lib/actions/admin";
import { formatDateShort } from "@/lib/utils";
import { Eye, Globe, EyeOff, Archive } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft:     "bg-gray-100 text-gray-600",
  closed:    "bg-orange-100 text-orange-700",
  archived:  "bg-red-100 text-red-700",
};

const TYPE_COLORS: Record<string, string> = {
  scholarship: "bg-gold-50 text-gold-700",
  internship:  "bg-blue-50 text-blue-700",
  job:         "bg-green-50 text-green-700",
  conference:  "bg-purple-50 text-purple-700",
  workshop:    "bg-orange-50 text-orange-700",
  other:       "bg-gray-50 text-gray-600",
};

interface Opportunity {
  id: string; title: string; slug: string; type: string; status: string;
  organisation: string; deadline: string | null; created_at: string;
  profiles: { full_name: string };
}

export function AdminOpportunitiesTable({ opportunities }: { opportunities: Opportunity[] }) {
  const [filter, setFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const filtered = filter === "all" ? opportunities : opportunities.filter((o) => o.status === filter);

  const act = (fn: () => Promise<void>) => {
    startTransition(async () => {
      try { await fn(); setMsg("Updated."); setTimeout(() => setMsg(null), 2000); }
      catch (e: unknown) { setMsg((e as Error).message); setTimeout(() => setMsg(null), 4000); }
    });
  };

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="px-6 py-4 border-b flex flex-wrap gap-2">
        {["all","published","draft","closed","archived"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${
              filter === s ? "bg-navy-900 text-white border-navy-900" : "bg-white text-muted-foreground border-gray-200 hover:border-navy-900"
            }`}>
            {s} ({s === "all" ? opportunities.length : opportunities.filter((o) => o.status === s).length})
          </button>
        ))}
      </div>

      {msg && <div className="px-6 py-2 bg-blue-50 text-blue-700 text-sm border-b">{msg}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              {["Title","Type","Organisation","Deadline","Status","Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr><td colSpan={6} className="text-center py-12 text-muted-foreground">No opportunities found.</td></tr>
            ) : filtered.map((o) => (
              <tr key={o.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 max-w-xs font-medium text-navy-900">
                  <span className="line-clamp-1">{o.title}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${TYPE_COLORS[o.type] ?? TYPE_COLORS.other}`}>{o.type}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{o.organisation}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {o.deadline ? formatDateShort(o.deadline) : "Rolling"}
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[o.status]}`}>{o.status}</span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {o.status === "published" && (
                      <Link href={`/opportunities/${o.slug}`} target="_blank"
                        className="p-1.5 text-muted-foreground hover:text-navy-900 hover:bg-gray-100 rounded-lg" title="View">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {o.status !== "published" && (
                      <button onClick={() => act(() => toggleOpportunityStatus(o.id, "published"))} disabled={isPending}
                        title="Publish" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50">
                        <Globe className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {o.status === "published" && (
                      <button onClick={() => act(() => toggleOpportunityStatus(o.id, "closed"))} disabled={isPending}
                        title="Close" className="p-1.5 text-orange-500 hover:bg-orange-50 rounded-lg disabled:opacity-50">
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => act(() => toggleOpportunityStatus(o.id, "archived"))} disabled={isPending}
                      title="Archive" className="p-1.5 text-red-400 hover:bg-red-50 rounded-lg disabled:opacity-50">
                      <Archive className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
