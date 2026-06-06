import Link from "next/link";
import { Building2, MapPin, Clock } from "lucide-react";
import type { Opportunity } from "@/types";
import { Badge } from "@/components/ui/Badge";
import { formatDateShort } from "@/lib/utils";

export function OpportunityCard({ opportunity }: { opportunity: Opportunity }) {
  const isUrgent = opportunity.deadline && new Date(opportunity.deadline).getTime() - new Date().getTime() < 7 * 24 * 60 * 60 * 1000;

  const getTypeVariant = (type: string) => {
    switch (type) {
      case "internship": return "navy";
      case "scholarship": return "gold";
      case "job": return "green";
      default: return "gray";
    }
  };

  return (
    <div className="bg-white rounded-xl border p-6 hover:border-gold-500 hover:shadow-md transition-all flex flex-col h-full">
      <div className="flex justify-between items-start mb-4 gap-4">
        <div className="w-12 h-12 rounded-lg bg-navy-50 flex items-center justify-center shrink-0 text-navy-900 border">
          <Building2 className="w-6 h-6" />
        </div>
        <Badge variant={getTypeVariant(opportunity.type)}>
          {opportunity.type.charAt(0).toUpperCase() + opportunity.type.slice(1)}
        </Badge>
      </div>
      
      <h3 className="font-display font-bold text-lg text-navy-900 mb-1 line-clamp-2">
        {opportunity.title}
      </h3>
      <p className="text-muted-foreground font-medium text-sm mb-4">
        {opportunity.organisation}
      </p>

      <div className="flex flex-col gap-2 mt-auto mb-6 text-sm">
        <div className="flex items-center gap-2 text-muted-foreground">
          <MapPin className="w-4 h-4 shrink-0" />
          <span className="truncate">
            {opportunity.is_remote ? "Remote" : opportunity.location || "Unspecified"}
          </span>
        </div>
        <div className={cn("flex items-center gap-2", isUrgent ? "text-red-600 font-medium" : "text-muted-foreground")}>
          <Clock className="w-4 h-4 shrink-0" />
          <span>
            {opportunity.deadline ? `Deadline: ${formatDateShort(opportunity.deadline)}` : "Rolling Basis"}
          </span>
        </div>
      </div>

      <Link
        href={`/opportunities/${opportunity.slug}`}
        className="w-full inline-flex items-center justify-center px-4 py-2 bg-navy-50 text-navy-900 font-medium rounded-lg hover:bg-navy-900 hover:text-white transition-colors"
      >
        View Details
      </Link>
    </div>
  );
}

// Utility function copied locally to avoid nested imports
function cn(...classes: (string | undefined | null | false)[]) {
  return classes.filter(Boolean).join(" ");
}
