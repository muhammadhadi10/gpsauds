"use client";

import { useState, useTransition } from "react";
import { toggleEventStatus } from "@/lib/actions/admin";
import { formatDateShort } from "@/lib/utils";
import { Eye, CheckCircle2, XCircle, ArchiveRestore } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  published:  "bg-green-100 text-green-700",
  draft:      "bg-gray-100 text-gray-600",
  cancelled:  "bg-red-100 text-red-700",
  completed:  "bg-blue-100 text-blue-700",
};

interface Event {
  id: string; title: string; slug: string; type: string; status: string;
  starts_at: string; location: string | null; is_virtual: boolean;
  profiles: { full_name: string };
}

export function AdminEventsTable({ events }: { events: Event[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const filtered = filter === "all" ? events : events.filter((e) => e.status === filter);

  const act = (fn: () => Promise<void>) => {
    startTransition(async () => {
      try { await fn(); setMsg("Updated."); setTimeout(() => setMsg(null), 2000); }
      catch (e: unknown) { setMsg((e as Error).message); setTimeout(() => setMsg(null), 4000); }
    });
  };

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="px-6 py-4 border-b flex flex-wrap gap-2">
        {["all","published","draft","cancelled","completed"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${
              filter === s ? "bg-navy-900 text-white border-navy-900" : "bg-white text-muted-foreground border-gray-200 hover:border-navy-900"
            }`}>
            {s} ({s === "all" ? events.length : events.filter((e) => e.status === s).length})
          </button>
        ))}
      </div>

      {msg && <div className="px-6 py-2 bg-blue-50 text-blue-700 text-sm border-b">{msg}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              {["Title","Type","Status","Date","Location","Created By","Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr><td colSpan={7} className="text-center py-12 text-muted-foreground">No events found.</td></tr>
            ) : filtered.map((e) => (
              <tr key={e.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 font-medium text-navy-900 max-w-xs">
                  <span className="line-clamp-1">{e.title}</span>
                </td>
                <td className="px-4 py-3">
                  <span className="text-xs bg-gold-50 text-gold-700 px-2 py-0.5 rounded-full capitalize">{e.type}</span>
                </td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[e.status]}`}>{e.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground whitespace-nowrap">{formatDateShort(e.starts_at)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{e.is_virtual ? "Virtual" : (e.location ?? "—")}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{e.profiles?.full_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <Link href={`/events/${e.slug}`} target="_blank"
                      className="p-1.5 text-muted-foreground hover:text-navy-900 hover:bg-gray-100 rounded-lg transition-colors" title="View">
                      <Eye className="w-3.5 h-3.5" />
                    </Link>
                    {e.status !== "published" && (
                      <button onClick={() => act(() => toggleEventStatus(e.id, "published"))} disabled={isPending}
                        title="Publish" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg transition-colors disabled:opacity-50">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {e.status === "published" && (
                      <button onClick={() => act(() => toggleEventStatus(e.id, "cancelled"))} disabled={isPending}
                        title="Cancel" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50">
                        <XCircle className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {e.status !== "draft" && (
                      <button onClick={() => act(() => toggleEventStatus(e.id, "draft"))} disabled={isPending}
                        title="Move to draft" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg transition-colors disabled:opacity-50">
                        <ArchiveRestore className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="px-6 py-3 border-t text-xs text-muted-foreground">
        Showing {filtered.length} of {events.length} events
      </div>
    </div>
  );
}
