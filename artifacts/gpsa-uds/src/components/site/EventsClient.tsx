"use client";

import { useState } from "react";
import type { Event, EventType } from "@/types";
import { EventCard } from "@/components/site/EventCard";

type Filter = "all" | "upcoming" | "past" | EventType;

const FILTERS: { label: string; value: Filter }[] = [
  { label: "All", value: "all" },
  { label: "Upcoming", value: "upcoming" },
  { label: "Past", value: "past" },
  { label: "Academic", value: "academic" },
  { label: "Social", value: "social" },
  { label: "General", value: "general" },
];

export function EventsClient({ events }: { events: Event[] }) {
  const [filter, setFilter] = useState<Filter>("upcoming");
  const now = new Date();

  const filtered = events.filter((e) => {
    if (filter === "upcoming") return new Date(e.starts_at) >= now;
    if (filter === "past") return new Date(e.starts_at) < now;
    if (filter === "all") return true;
    return e.type === filter;
  });

  return (
    <div>
      {/* Filter tabs */}
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
          {filtered.map((event) => (
            <EventCard key={event.id} event={event} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No events match this filter.</p>
          <button
            onClick={() => setFilter("all")}
            className="mt-4 text-navy-900 underline text-sm"
          >
            View all events
          </button>
        </div>
      )}
    </div>
  );
}
