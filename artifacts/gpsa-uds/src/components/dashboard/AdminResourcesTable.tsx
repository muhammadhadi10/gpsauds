"use client";

import { useState, useTransition } from "react";
import { createClient } from "@/lib/supabase/client";
import { Check, X, Download, FileText } from "lucide-react";
import { formatDateShort } from "@/lib/utils";

const TYPE_LABELS: Record<string, string> = {
  past_question: "Past Question",
  lecture_note:  "Lecture Note",
  textbook:      "Textbook",
  research_paper:"Research Paper",
  other:         "Other",
};

interface Resource {
  id: string; title: string; type: string; level: string | null;
  course_code: string | null; file_size: number; file_url: string;
  download_count: number; is_approved: boolean; created_at: string;
  profiles: { full_name: string };
}

export function AdminResourcesTable({ resources }: { resources: Resource[] }) {
  const [filter, setFilter] = useState<"all" | "approved" | "pending">("pending");
  const [isPending, startTransition] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const [localState, setLocalState] = useState<Record<string, boolean>>({});

  const getApproved = (r: Resource) => localState[r.id] ?? r.is_approved;

  const filtered = resources.filter((r) => {
    if (filter === "approved") return getApproved(r);
    if (filter === "pending") return !getApproved(r);
    return true;
  });

  const approve = (id: string, approved: boolean) => {
    startTransition(async () => {
      try {
        const supabase = createClient();
        await supabase.from("academic_resources").update({ is_approved: approved }).eq("id", id);
        setLocalState((p) => ({ ...p, [id]: approved }));
        setMsg(approved ? "Resource approved." : "Resource rejected.");
        setTimeout(() => setMsg(null), 2000);
      } catch (e: unknown) {
        setMsg((e as Error).message);
        setTimeout(() => setMsg(null), 4000);
      }
    });
  };

  function formatBytes(b: number) {
    if (b < 1024 * 1024) return `${(b / 1024).toFixed(0)} KB`;
    return `${(b / (1024 * 1024)).toFixed(1)} MB`;
  }

  return (
    <div className="bg-white rounded-2xl border overflow-hidden">
      <div className="px-6 py-4 border-b flex flex-wrap gap-2">
        {(["all","pending","approved"] as const).map((s) => (
          <button key={s} onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${
              filter === s ? "bg-navy-900 text-white border-navy-900" : "bg-white text-muted-foreground border-gray-200 hover:border-navy-900"
            }`}>
            {s} ({s === "all" ? resources.length : resources.filter((r) => s === "approved" ? getApproved(r) : !getApproved(r)).length})
          </button>
        ))}
      </div>

      {msg && <div className="px-6 py-2 bg-blue-50 text-blue-700 text-sm border-b">{msg}</div>}

      <div className="overflow-x-auto">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b">
              {["Resource","Type","Level","Uploaded By","Size","Downloads","Status","Actions"].map((h) => (
                <th key={h} className="text-left px-4 py-3 font-medium text-muted-foreground text-xs uppercase tracking-wide">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y">
            {filtered.length === 0 ? (
              <tr><td colSpan={8} className="text-center py-12 text-muted-foreground">No resources found.</td></tr>
            ) : filtered.map((r) => (
              <tr key={r.id} className="hover:bg-gray-50">
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <FileText className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                    <span className="font-medium text-navy-900 line-clamp-1 max-w-[180px]">{r.title}</span>
                  </div>
                  {r.course_code && <p className="text-xs text-muted-foreground pl-6 mt-0.5">{r.course_code}</p>}
                </td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{TYPE_LABELS[r.type] ?? r.type}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.level?.replace("_", " ") ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.profiles?.full_name ?? "—"}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{formatBytes(r.file_size)}</td>
                <td className="px-4 py-3 text-xs text-muted-foreground">{r.download_count}</td>
                <td className="px-4 py-3">
                  {getApproved(r)
                    ? <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded-full font-medium">Approved</span>
                    : <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">Pending</span>}
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1">
                    <a href={r.file_url} target="_blank" rel="noopener noreferrer"
                      className="p-1.5 text-muted-foreground hover:text-navy-900 hover:bg-gray-100 rounded-lg" title="Download">
                      <Download className="w-3.5 h-3.5" />
                    </a>
                    {!getApproved(r) && (
                      <button onClick={() => approve(r.id, true)} disabled={isPending}
                        title="Approve" className="p-1.5 text-green-600 hover:bg-green-50 rounded-lg disabled:opacity-50">
                        <Check className="w-3.5 h-3.5" />
                      </button>
                    )}
                    {getApproved(r) && (
                      <button onClick={() => approve(r.id, false)} disabled={isPending}
                        title="Revoke approval" className="p-1.5 text-red-500 hover:bg-red-50 rounded-lg disabled:opacity-50">
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
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
