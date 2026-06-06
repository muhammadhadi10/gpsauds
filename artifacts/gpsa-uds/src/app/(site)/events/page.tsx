import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { Event } from "@/types";
import { SectionHeader } from "@/components/site/SectionHeader";
import { EventsClient } from "@/components/site/EventsClient";

export const metadata: Metadata = {
  title: "Events",
  description:
    "Browse upcoming and past events organized by GPSA-UDS — academic conferences, welfare drives, social events, and more.",
};

export const revalidate = 60;

export default async function EventsPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("events")
    .select("*")
    .eq("status", "published")
    .order("starts_at", { ascending: false });

  const events = (data ?? []) as Event[];

  return (
    <>
      <section className="bg-navy-900 pt-32 pb-20 text-white">
        <div className="container-max section-padding text-center">
          <div className="w-16 h-1 bg-gold-500 mx-auto mb-6 rounded-full" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">Events</h1>
          <p className="text-white/70 max-w-xl mx-auto">
            Stay connected with GPSA-UDS activities — academic, social, and
            community events throughout the year.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50 min-h-screen">
        <div className="container-max section-padding">
          <EventsClient events={events} />
        </div>
      </section>
    </>
  );
}
