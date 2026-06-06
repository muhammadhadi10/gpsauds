"use client";

import { useState } from "react";
import type { Opportunity, OpportunityType } from "@/types";
import { OpportunityCard } from "@/components/site/OpportunityCard";

type Filter = "all" | OpportunityType;

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Scholarship", value: "scholarship" },
  { label: "Internship", value: "internship" },
  { label: "Job", value: "job" },
  { label: "Conference", value: "conference" },
  { label: "Workshop", value: "workshop" },
  { label: "Other", value: "other" },
];

export function OpportunitiesClient({
  opportunities,
}: {
  opportunities: Opportunity[];
}) {
  const [filter, setFilter] = useState<Filter>("all");

  const filtered =
    filter === "all"
      ? opportunities
      : opportunities.filter((o) => o.type === filter);

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-10">
        {FILTERS.map(({ label, value }) => (
          <button
            key={value}
            onClick={() => setFilter(value)}
            className={`px-5 py-2 rounded-full text-sm font-medium border transition-colors ${
              filter === value
                ? "bg-navy-900 text-white border-navy-900"
                : "bg-white text-muted-foreground border-gray-200 hover:border-navy-900 hover:text-navy-900"
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((opp) => (
            <OpportunityCard key={opp.id} opportunity={opp} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No {filter} opportunities posted yet.</p>
          <button
            onClick={() => setFilter("all")}
            className="mt-4 text-navy-900 underline text-sm"
          >
            View all opportunities
          </button>
        </div>
      )}
    </div>
  );
}
