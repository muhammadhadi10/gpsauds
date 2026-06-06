"use client";

import { useState, useTransition } from "react";
import { updateWelfareStatus } from "@/lib/actions/admin";
import { ChevronDown, ChevronUp, CheckCircle } from "lucide-react";
import { formatDate } from "@/lib/utils";

const STATUS_COLORS: Record<string, string> = {
  submitted:    "bg-blue-100 text-blue-700",
  under_review: "bg-yellow-100 text-yellow-800",
  approved:     "bg-green-100 text-green-700",
  rejected:     "bg-red-100 text-red-700",
  disbursed:    "bg-purple-100 text-purple-700",
};

const TYPE_LABELS: Record<string, string> = {
  financial:   "Financial Aid",
  medical:     "Medical Support",
  bereavement: "Bereavement",
  emergency:   "Emergency",
  other:       "Other",
};

interface WelfareProfile {
  full_name: string;
  email: string;
  student_id: string | null;
  phone: string | null;
}

interface Request {
  id: string;
  user_id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  amount_requested: number | null;
  review_notes: string | null;
  created_at: string;
  profiles: WelfareProfile | null;
}

export function WelfareRequestsPanel({ requests }: { requests: Request[] }) {
  const [filter, setFilter] = useState<string>("all");
  const [expanded, setExpanded] = useState<string | null>(null);
  const [comment, setComment] = useState("");
  const [isPending, startTransition] = useTransition();
  const [feedback, setFeedback] = useState<string | null>(null);

  const filtered = filter === "all" ? requests : requests.filter((r) => r.status === filter);

  const act = (fn: () => Promise<void>) => {
    startTransition(async () => {
      try {
        await fn();
        setComment("");
        setFeedback("Updated.");
        setTimeout(() => setFeedback(null), 2000);
      } catch (e: unknown) {
        setFeedback((e as Error).message);
        setTimeout(() => setFeedback(null), 4000);
      }
    });
  };

  return (
    <div className="space-y-4">
      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {["all","submitted","under_review","approved","rejected","disbursed"].map((s) => (
          <button
            key={s}
            onClick={() => setFilter(s)}
            className={`px-4 py-1.5 rounded-full text-xs font-medium border capitalize transition-colors ${
              filter === s
                ? "bg-navy-900 text-white border-navy-900"
                : "bg-white text-muted-foreground border-gray-200 hover:border-navy-900"
            }`}
          >
            {s.replace("_", " ")}
            {" "}({s === "all" ? requests.length : requests.filter((r) => r.status === s).length})
          </button>
        ))}
      </div>

      {feedback && (
        <div className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-700 text-sm rounded-xl">
          <CheckCircle className="w-4 h-4" />{feedback}
        </div>
      )}

      {/* Request cards */}
      {filtered.length === 0 ? (
        <div className="bg-white rounded-2xl border py-16 text-center text-muted-foreground">
          No welfare requests in this category.
        </div>
      ) : (
        filtered.map((req) => (
          <div key={req.id} className="bg-white rounded-2xl border overflow-hidden">
            {/* Header row */}
            <div
              className="flex items-center gap-4 px-6 py-4 cursor-pointer hover:bg-gray-50 transition-colors"
              onClick={() => setExpanded(expanded === req.id ? null : req.id)}
            >
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap mb-1">
                  <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize ${STATUS_COLORS[req.status]}`}>
                    {req.status.replace("_", " ")}
                  </span>
                  <span className="text-xs text-muted-foreground bg-gold-50 text-gold-700 px-2 py-0.5 rounded-full">
                    {TYPE_LABELS[req.type] ?? req.type}
                  </span>
                  {req.amount_requested && (
                    <span className="text-xs text-muted-foreground bg-gray-100 px-2 py-0.5 rounded-full">
                      GHS {req.amount_requested.toLocaleString()}
                    </span>
                  )}
                </div>
                <p className="font-medium text-navy-900 text-sm">{req.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {req.profiles?.full_name ?? "Unknown"} · {formatDate(req.created_at)}
                </p>
              </div>
              {expanded === req.id
                ? <ChevronUp className="w-4 h-4 text-muted-foreground flex-shrink-0" />
                : <ChevronDown className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
            </div>

            {/* Expanded detail */}
            {expanded === req.id && (
              <div className="border-t px-6 py-5 space-y-5 bg-gray-50">
                {/* Submitter info */}
                <div className="grid sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  {[
                    { label: "Name",      value: req.profiles?.full_name ?? "—" },
                    { label: "Email",     value: req.profiles?.email ?? "—" },
                    { label: "Phone",     value: req.profiles?.phone ?? "—" },
                    { label: "Index No.", value: req.profiles?.student_id ?? "—" },
                  ].map(({ label, value }) => (
                    <div key={label}>
                      <p className="text-xs text-muted-foreground mb-0.5">{label}</p>
                      <p className="text-navy-900 font-medium text-sm break-all">{value}</p>
                    </div>
                  ))}
                </div>

                {/* Description */}
                <div>
                  <p className="text-xs font-medium text-muted-foreground mb-2 uppercase tracking-wide">Description</p>
                  <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap bg-white rounded-xl border px-4 py-3">
                    {req.description}
                  </p>
                </div>

                {/* Existing review notes */}
                {req.review_notes && (
                  <div>
                    <p className="text-xs font-medium text-muted-foreground mb-1 uppercase tracking-wide">Review Notes</p>
                    <p className="text-sm text-gray-700 bg-yellow-50 border border-yellow-100 rounded-xl px-4 py-3">
                      {req.review_notes}
                    </p>
                  </div>
                )}

                {/* Actions */}
                <div className="flex flex-col sm:flex-row gap-3">
                  <textarea
                    rows={2}
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    placeholder="Add a review note (optional)…"
                    className="flex-1 px-3 py-2 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 resize-none"
                  />
                  <div className="flex flex-col gap-2 sm:w-36">
                    {req.status === "submitted" && (
                      <button
                        onClick={() => act(() => updateWelfareStatus(req.id, "under_review", comment || undefined))}
                        disabled={isPending}
                        className="py-2 bg-yellow-500 text-white rounded-xl text-xs font-medium hover:bg-yellow-600 disabled:opacity-60"
                      >
                        Under Review
                      </button>
                    )}
                    {["submitted","under_review"].includes(req.status) && (
                      <>
                        <button
                          onClick={() => act(() => updateWelfareStatus(req.id, "approved", comment || undefined))}
                          disabled={isPending}
                          className="py-2 bg-green-600 text-white rounded-xl text-xs font-medium hover:bg-green-700 disabled:opacity-60"
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => act(() => updateWelfareStatus(req.id, "rejected", comment || undefined))}
                          disabled={isPending}
                          className="py-2 bg-red-600 text-white rounded-xl text-xs font-medium hover:bg-red-700 disabled:opacity-60"
                        >
                          Reject
                        </button>
                      </>
                    )}
                    {req.status === "approved" && (
                      <button
                        onClick={() => act(() => updateWelfareStatus(req.id, "disbursed", comment || undefined))}
                        disabled={isPending}
                        className="py-2 bg-purple-600 text-white rounded-xl text-xs font-medium hover:bg-purple-700 disabled:opacity-60"
                      >
                        Mark Disbursed
                      </button>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        ))
      )}
    </div>
  );
}
