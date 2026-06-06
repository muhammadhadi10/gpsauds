import Link from "next/link";
import { Calendar, MapPin } from "lucide-react";
import type { Event } from "@/types";
import { formatDateShort, truncate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";

export function EventCard({ event }: { event: Event }) {
  return (
    <div className="group bg-white rounded-xl border overflow-hidden hover:shadow-lg transition-all duration-300 flex flex-col h-full">
      <div className="aspect-[4/3] bg-navy-900 relative overflow-hidden">
        {event.cover_image_url ? (
          <img
            src={event.cover_image_url}
            alt={event.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-tr from-navy-900 to-navy-700 opacity-80" />
        )}
        <div className="absolute top-4 right-4">
          <Badge variant="gold" className="shadow-sm">
            {event.type.charAt(0).toUpperCase() + event.type.slice(1)}
          </Badge>
        </div>
      </div>
      <div className="p-6 flex flex-col flex-1">
        <h3 className="font-display font-bold text-xl text-navy-900 mb-2 line-clamp-2">
          {event.title}
        </h3>
        <div className="flex flex-col gap-2 mt-auto mb-6 text-sm text-muted-foreground">
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gold-500" />
            <span>{formatDateShort(event.starts_at)}</span>
          </div>
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-gold-500" />
            <span className="truncate">
              {event.is_virtual ? "Virtual Event" : event.location || "TBA"}
            </span>
          </div>
        </div>
        <Link
          href={`/events/${event.slug}`}
          className="inline-flex items-center justify-center w-full px-4 py-2 border border-navy-900 text-navy-900 rounded-lg hover:bg-navy-900 hover:text-white transition-colors font-medium"
        >
          View Details
        </Link>
      </div>
    </div>
  );
}
