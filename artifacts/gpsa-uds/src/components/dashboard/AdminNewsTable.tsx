"use client";

import { useState, useTransition } from "react";
import { toggleNewsStatus } from "@/lib/actions/admin";
import { formatDateShort } from "@/lib/utils";
import { Eye, Globe, EyeOff, Archive } from "lucide-react";
import Link from "next/link";

const STATUS_COLORS: Record<string, string> = {
  published: "bg-green-100 text-green-700",
  draft:     "bg-gray-100 text-gray-600",
  archived:  "bg-red-100 text-red-700",
};

interface Article {
  id: string; title: string; slug: string; status: string;
  published_at: string | null; created_at: string; is_featured: boolean;
  profiles: { full_name: string };
}

export function AdminNewsTable({ articles }: { articles: Article[] }) {
  const [filter, setFilter] = useState("all");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);

  const filtered = filter === "all" ? articles : articles.filter((a) => a.status === filter);

  const act = (fn: () => Promise<void>) => {
    startTransition(async () => {
      try { await fn(); setMsg("Updated."); setTimeout(() => setMsg(null), 2000); }
      catch (e: unknown) { setMsg((e as Error).message); setTimeout(() => setMsg(null), 4000); }
    });
  };

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="px-6 py-4 border-b flex flex-wrap gap-2">
        {["all","published","draft","archived"].map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${
              filter === s ? "bg-navy-900 text-white border-navy-900" : "bg-white text-muted-foreground border-gray-200 hover:border-navy-900"
            }`}>
            {s} ({s === "all" ? articles.length : articles.filter((a) => a.status === s).length})
          </button>
        ))}
      </div>

      {msg && <div className="px-6 py-2 bg-blue-50 text-blue-700 text-sm border-b">{msg}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              {["Title","Author","Status","Published","Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr><td colSpan={5} className="text-center py-12 text-muted-foreground">No articles found.</td></tr>
            ) : filtered.map((a) => (
              <tr key={a.id} className="hover:bg-gray-50">
                <td className="px-4 py-3 max-w-xs">
                  <span className="font-medium text-navy-900 line-clamp-1">{a.title}</span>
                  {a.is_featured && (
                    <span className="ml-2 text-[10px] bg-gold-100 text-gold-700 px-1.5 py-0.5 rounded-full font-medium">FEATURED</span>
                  )}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{a.profiles?.full_name ?? "—"}</td>
                <td className="px-4 py-3">
                  <span className={`text-xs px-2 py-0.5 rounded-full font-medium capitalize ${STATUS_COLORS[a.status]}`}>{a.status}</span>
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">
                  {a.published_at ? formatDateShort(a.published_at) : "—"}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    {a.status === "published" && (
                      <Link href={`/news/${a.slug}`} target="_blank"
                        className="p-1.5 text-muted-foreground hover:text-navy-900 hover:bg-gray-100 rounded-lg" title="View">
                        <Eye className="w-3.5 h-3.5" />
                      </Link>
                    )}
                    {a.status !== "published" && (
                      <button onClick={() => act(() => toggleNewsStatus(a.id, "published"))} disabled={isPending}
                        title="Publish" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50">
                        <Globe className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {a.status === "published" && (
                      <button onClick={() => act(() => toggleNewsStatus(a.id, "draft"))} disabled={isPending}
                        title="Unpublish" className="p-1.5 text-gray-500 hover:bg-gray-100 rounded-lg disabled:opacity-50">
                        <EyeOff className="w-3.5 h-3.5" />
                      </button>
                    )}
                    <button onClick={() => act(() => toggleNewsStatus(a.id, "archived"))} disabled={isPending}
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
