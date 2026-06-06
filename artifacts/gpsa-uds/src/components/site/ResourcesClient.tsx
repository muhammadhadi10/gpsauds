"use client";

import { useState } from "react";
import type { AcademicResource, MembershipTier, ResourceType } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { Download, FileText, BookOpen, File } from "lucide-react";
import { createClient } from "@/lib/supabase/client";

type LevelFilter = "all" | MembershipTier;
type TypeFilter = "all" | ResourceType;

const LEVELS: { label: string; value: LevelFilter }[] = [
  { label: "All Levels", value: "all" },
  { label: "100 Level", value: "100_level" },
  { label: "200 Level", value: "200_level" },
  { label: "300 Level", value: "300_level" },
  { label: "400 Level", value: "400_level" },
  { label: "500 Level", value: "500_level" },
];

const TYPES: { label: string; value: TypeFilter }[] = [
  { label: "All Types", value: "all" },
  { label: "Past Questions", value: "past_question" },
  { label: "Lecture Notes", value: "lecture_note" },
  { label: "Textbooks", value: "textbook" },
  { label: "Research Papers", value: "research_paper" },
  { label: "Other", value: "other" },
];

function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

const TYPE_ICONS: Record<string, React.ElementType> = {
  past_question: FileText,
  lecture_note: BookOpen,
  textbook: BookOpen,
  research_paper: FileText,
  other: File,
};

function ResourceCard({ resource }: { resource: AcademicResource }) {
  const [downloading, setDownloading] = useState(false);
  const Icon = TYPE_ICONS[resource.type] ?? File;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      const supabase = createClient();
      await supabase.rpc("increment_download_count", { resource_id: resource.id });
      window.open(resource.file_url, "_blank");
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl border p-5 hover:shadow-md transition-shadow flex flex-col gap-4">
      <div className="flex items-start gap-3">
        <div className="w-10 h-10 bg-navy-50 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon className="w-5 h-5 text-navy-900" />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="font-display font-bold text-navy-900 text-sm leading-snug line-clamp-2 mb-1">
            {resource.title}
          </h3>
          {resource.course_code && (
            <p className="text-xs text-muted-foreground">{resource.course_code}</p>
          )}
        </div>
      </div>

      <div className="flex flex-wrap gap-1.5">
        {resource.level && (
          <Badge variant="navy">
            {resource.level.replace("_", " ").replace(/\b\w/g, (c) => c.toUpperCase())}
          </Badge>
        )}
        <Badge variant="gold">
          {resource.type.replace(/_/g, " ").replace(/\b\w/g, (c) => c.toUpperCase())}
        </Badge>
      </div>

      <div className="flex items-center justify-between text-xs text-muted-foreground">
        <span>{formatBytes(resource.file_size)}</span>
        <span>{resource.download_count} downloads</span>
      </div>

      <button
        onClick={handleDownload}
        disabled={downloading}
        className="flex items-center justify-center gap-2 w-full py-2.5 border border-navy-900 text-navy-900 rounded-lg text-sm font-medium hover:bg-navy-900 hover:text-white transition-colors disabled:opacity-60"
      >
        <Download className="w-4 h-4" />
        {downloading ? "Opening..." : "Download"}
      </button>
    </div>
  );
}

export function ResourcesClient({ resources }: { resources: AcademicResource[] }) {
  const [levelFilter, setLevelFilter] = useState<LevelFilter>("all");
  const [typeFilter, setTypeFilter] = useState<TypeFilter>("all");

  const filtered = resources.filter((r) => {
    const levelOk = levelFilter === "all" || r.level === levelFilter;
    const typeOk = typeFilter === "all" || r.type === typeFilter;
    return levelOk && typeOk;
  });

  return (
    <div>
      <div className="bg-white rounded-2xl border p-6 mb-8 space-y-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Filter by Level
          </p>
          <div className="flex flex-wrap gap-2">
            {LEVELS.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setLevelFilter(value)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  levelFilter === value
                    ? "bg-navy-900 text-white border-navy-900"
                    : "bg-white text-muted-foreground border-gray-200 hover:border-navy-900 hover:text-navy-900"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground mb-2">
            Filter by Type
          </p>
          <div className="flex flex-wrap gap-2">
            {TYPES.map(({ label, value }) => (
              <button
                key={value}
                onClick={() => setTypeFilter(value)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-colors ${
                  typeFilter === value
                    ? "bg-gold-500 text-white border-gold-500"
                    : "bg-white text-muted-foreground border-gray-200 hover:border-gold-500 hover:text-gold-600"
                }`}
              >
                {label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {filtered.length > 0 ? (
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {filtered.map((r) => (
            <ResourceCard key={r.id} resource={r} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 text-muted-foreground">
          <p className="text-lg">No resources match your filters.</p>
          <button
            onClick={() => { setLevelFilter("all"); setTypeFilter("all"); }}
            className="mt-4 text-navy-900 underline text-sm"
          >
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}
