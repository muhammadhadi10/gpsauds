import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import { Calendar, MapPin, Clock, Users, ArrowLeft, ExternalLink } from "lucide-react";
import type { Event } from "@/types";

interface Props {
  params: { slug: string };
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("title, description")
    .eq("slug", params.slug)
    .single();

  if (!data) return { title: "Event Not Found" };
  return {
    title: data.title,
    description: data.description.slice(0, 160),
  };
}

export default async function EventDetailPage({ params }: Props) {
  const supabase = await createClient();

  const { data: event } = await supabase
    .from("events")
    .select("*, profiles!created_by(full_name)")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!event) notFound();

  const { data: related } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .neq("id", event.id)
    .gte("starts_at", new Date().toISOString())
    .order("starts_at")
    .limit(3);

  const ev = event as Event & { profiles: { full_name: string } };
  const relatedEvents = (related ?? []) as Event[];
  const isPast = new Date(ev.starts_at) < new Date();
  const isDeadlinePassed = ev.registration_deadline
    ? new Date(ev.registration_deadline) < new Date()
    : false;

  return (
    <>
      {/* Hero */}
      <div className="relative bg-navy-900 pt-24">
        {ev.cover_image_url ? (
          <div className="relative h-72 md:h-96">
            <img
              src={ev.cover_image_url}
              alt={ev.title}
              className="w-full h-full object-cover opacity-40"
            />
          </div>
        ) : (
          <div className="h-48 bg-gradient-to-br from-navy-800 to-navy-900" />
        )}
      </div>

      <div className="container-max section-padding py-12">
        <Link
          href="/events"
          className="inline-flex items-center gap-2 text-muted-foreground hover:text-navy-900 text-sm mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Events
        </Link>

        <div className="grid lg:grid-cols-3 gap-12">
          {/* Main content */}
          <div className="lg:col-span-2">
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant="gold">
                {ev.type.charAt(0).toUpperCase() + ev.type.slice(1)}
              </Badge>
              {isPast && <Badge variant="gray">Past Event</Badge>}
              {ev.is_virtual && <Badge variant="navy">Virtual</Badge>}
            </div>

            <h1 className="font-display text-3xl md:text-4xl font-bold text-navy-900 mb-6">
              {ev.title}
            </h1>

            <div className="prose prose-lg text-muted-foreground max-w-none">
              <div dangerouslySetInnerHTML={{ __html: ev.description }} />
            </div>
          </div>

          {/* Sidebar */}
          <div>
            <div className="bg-gray-50 rounded-2xl p-6 border sticky top-24 space-y-4">
              <h3 className="font-display font-bold text-navy-900 text-lg">
                Event Details
              </h3>

              <div className="space-y-3 text-sm">
                <div className="flex items-start gap-3">
                  <Calendar className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="font-medium text-navy-900">
                      {formatDate(ev.starts_at)}
                    </div>
                    {ev.ends_at && (
                      <div className="text-muted-foreground">
                        Ends: {formatDate(ev.ends_at)}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Clock className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                  <div className="font-medium text-navy-900">
                    {new Date(ev.starts_at).toLocaleTimeString("en-GH", {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                  <div className="font-medium text-navy-900">
                    {ev.is_virtual ? (
                      <>
                        Virtual Event
                        {ev.virtual_link && (
                          <a
                            href={ev.virtual_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="flex items-center gap-1 text-gold-600 hover:text-gold-700 mt-1"
                          >
                            Join Link <ExternalLink className="w-3 h-3" />
                          </a>
                        )}
                      </>
                    ) : (
                      ev.location || "TBA"
                    )}
                  </div>
                </div>

                {ev.capacity && (
                  <div className="flex items-start gap-3">
                    <Users className="w-4 h-4 text-gold-500 mt-0.5 flex-shrink-0" />
                    <div className="font-medium text-navy-900">
                      Capacity: {ev.capacity} attendees
                    </div>
                  </div>
                )}
              </div>

              {ev.registration_required && !isPast && (
                <div className="pt-4 border-t">
                  {ev.registration_deadline && (
                    <p className="text-xs text-muted-foreground mb-3">
                      Registration deadline:{" "}
                      <span className={isDeadlinePassed ? "text-red-600 font-medium" : "font-medium"}>
                        {formatDate(ev.registration_deadline)}
                      </span>
                    </p>
                  )}
                  <a
                    href="/login"
                    className="block w-full text-center px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition-colors"
                  >
                    {isDeadlinePassed ? "Registration Closed" : "Register for Event"}
                  </a>
                  <p className="text-xs text-center text-muted-foreground mt-2">
                    Login required to register
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Related Events */}
        {relatedEvents.length > 0 && (
          <div className="mt-16 pt-12 border-t">
            <h2 className="font-display text-2xl font-bold text-navy-900 mb-8">
              More Upcoming Events
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedEvents.map((e) => (
                <div key={e.id} className="bg-white rounded-xl border p-4 hover:shadow-md transition-shadow">
                  <Badge variant="gold" className="mb-2">
                    {e.type}
                  </Badge>
                  <h3 className="font-display font-bold text-navy-900 mb-2 line-clamp-2">
                    {e.title}
                  </h3>
                  <p className="text-sm text-muted-foreground mb-3">
                    {formatDate(e.starts_at)}
                  </p>
                  <Link
                    href={`/events/${e.slug}`}
                    className="text-sm font-medium text-navy-900 hover:text-gold-600"
                  >
                    View Details →
                  </Link>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
}
