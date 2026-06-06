import Link from "next/link";
import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import { EventCard } from "@/components/site/EventCard";
import { NewsCard } from "@/components/site/NewsCard";
import { OpportunityCard } from "@/components/site/OpportunityCard";
import { SectionHeader } from "@/components/site/SectionHeader";
import { StatsSection } from "@/components/site/StatsSection";
import { NewsletterForm } from "@/components/site/NewsletterForm";
import { ArrowRight, Phone, Mail, ChevronDown } from "lucide-react";
import type { Event, News, Opportunity } from "@/types";

export const metadata: Metadata = {
  title: "GPSA-UDS — Ghana Pharmaceutical Students Association",
  description:
    "Official portal of the Ghana Pharmaceutical Students Association at the University for Development Studies. Join us for academic excellence, welfare support, and professional growth.",
};

export default async function HomePage() {
  const supabase = await createClient();

  const [eventsRes, newsRes, opportunitiesRes, settingsRes] = await Promise.all([
    supabase
      .from("events")
      .select("*")
      .eq("status", "published")
      .gte("starts_at", new Date().toISOString())
      .order("starts_at")
      .limit(3),
    supabase
      .from("news")
      .select("*, profiles(full_name, avatar_url)")
      .eq("status", "published")
      .order("published_at", { ascending: false })
      .limit(3),
    supabase
      .from("opportunities")
      .select("*")
      .eq("status", "published")
      .order("deadline")
      .limit(3),
    supabase
      .from("site_settings")
      .select("key, value")
      .in("key", ["site_tagline", "site_name", "contact_phone", "contact_email"]),
  ]);

  const events = (eventsRes.data ?? []) as Event[];
  const news = (newsRes.data ?? []) as News[];
  const opportunities = (opportunitiesRes.data ?? []) as Opportunity[];

  const settings: Record<string, string> = {};
  for (const s of settingsRes.data ?? []) {
    settings[s.key] = s.value;
  }

  const phone = settings["contact_phone"] || "+233 XXX XXX XXXX";
  const email = settings["contact_email"] || "info@gpsa-uds.org";

  return (
    <>
      {/* ── HERO ─────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-navy-900">
        {/* Geometric pattern overlay */}
        <div
          className="absolute inset-0 opacity-10"
          style={{
            backgroundImage: `radial-gradient(circle at 25% 25%, #c8973a 0%, transparent 50%),
              radial-gradient(circle at 75% 75%, #c8973a 0%, transparent 50%)`,
          }}
        />
        <div
          className="absolute inset-0 opacity-5"
          style={{
            backgroundImage: `repeating-linear-gradient(
              45deg,
              #ffffff 0px,
              #ffffff 1px,
              transparent 1px,
              transparent 60px
            )`,
          }}
        />

        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto">
          <div className="inline-block px-4 py-1.5 border border-gold-500/40 rounded-full text-gold-400 text-sm font-medium mb-8 tracking-widest uppercase">
            University for Development Studies &bull; Tamale, Ghana
          </div>

          <h1
            className="font-display text-5xl md:text-6xl lg:text-7xl font-bold text-white mb-6 leading-tight"
            style={{ animation: "fade-in 0.8s ease-out both" }}
          >
            Empowering{" "}
            <span className="text-gold-400">Pharmacy</span>{" "}
            Students
          </h1>

          <p
            className="text-lg md:text-xl text-white/70 mb-10 max-w-2xl mx-auto leading-relaxed"
            style={{ animation: "fade-in 0.8s ease-out 0.2s both" }}
          >
            Ghana Pharmaceutical Students Association — UDS. Building academic
            excellence, professional networks, and student welfare since 2016.
          </p>

          <div
            className="flex flex-col sm:flex-row gap-4 justify-center"
            style={{ animation: "fade-in 0.8s ease-out 0.4s both" }}
          >
            <Link
              href="/join"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-full transition-colors text-lg"
            >
              Join GPSA <ArrowRight className="w-5 h-5" />
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center gap-2 px-8 py-4 border-2 border-white/40 hover:border-white text-white font-semibold rounded-full transition-colors text-lg"
            >
              Member Login
            </Link>
          </div>
        </div>

        <div className="absolute bottom-10 left-1/2 -translate-x-1/2 text-white/40 animate-bounce">
          <ChevronDown className="w-6 h-6" />
        </div>
      </section>

      {/* ── STATS ────────────────────────────────────────────── */}
      <StatsSection />

      {/* ── ABOUT SNAPSHOT ───────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container-max section-padding">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <SectionHeader
                title="About GPSA-UDS"
                subtitle="Our Mission"
                align="left"
              />
              <p className="text-muted-foreground leading-relaxed mb-6">
                The Ghana Pharmaceutical Students Association at the University for
                Development Studies is the official body representing pharmacy students
                across all levels. We champion academic excellence, student welfare,
                and the professional development of future pharmacists in Ghana.
              </p>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Founded with a commitment to bridging the gap between academic
                learning and professional practice, GPSA-UDS creates opportunities
                for students to grow, lead, and serve.
              </p>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-navy-900 font-semibold border-b-2 border-gold-500 pb-1 hover:text-gold-600 transition-colors"
              >
                Learn More About Us <ArrowRight className="w-4 h-4" />
              </Link>
            </div>

            {/* Decorative element */}
            <div className="relative">
              <div className="aspect-square max-w-md mx-auto">
                <div className="absolute inset-0 bg-navy-900 rounded-3xl rotate-3" />
                <div className="absolute inset-0 bg-gold-500/20 rounded-3xl -rotate-3" />
                <div className="relative bg-navy-800 rounded-3xl p-8 h-full flex flex-col justify-center gap-6">
                  {[
                    { label: "Academic Excellence", value: "Core Value" },
                    { label: "Student Welfare", value: "Our Priority" },
                    { label: "Professional Growth", value: "Our Goal" },
                    { label: "Community Service", value: "Our Calling" },
                  ].map((item) => (
                    <div
                      key={item.label}
                      className="flex items-center gap-4 p-4 bg-white/5 rounded-xl border border-white/10"
                    >
                      <div className="w-2 h-2 rounded-full bg-gold-500 flex-shrink-0" />
                      <div>
                        <div className="text-white font-semibold text-sm">
                          {item.label}
                        </div>
                        <div className="text-white/50 text-xs">{item.value}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── UPCOMING EVENTS ──────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="container-max section-padding">
          <div className="flex items-end justify-between mb-12">
            <SectionHeader
              title="Upcoming Events"
              subtitle="Don't Miss Out"
              align="left"
            />
            <Link
              href="/events"
              className="hidden sm:inline-flex items-center gap-1 text-navy-900 font-medium hover:text-gold-600 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {events.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <EventCard key={event.id} event={event} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>No upcoming events at the moment. Check back soon.</p>
            </div>
          )}

          <div className="sm:hidden mt-8 text-center">
            <Link href="/events" className="text-navy-900 font-medium underline">
              View All Events
            </Link>
          </div>
        </div>
      </section>

      {/* ── LATEST NEWS ──────────────────────────────────────── */}
      <section className="py-24 bg-white">
        <div className="container-max section-padding">
          <div className="flex items-end justify-between mb-12">
            <SectionHeader
              title="Latest News"
              subtitle="Stay Informed"
              align="left"
            />
            <Link
              href="/news"
              className="hidden sm:inline-flex items-center gap-1 text-navy-900 font-medium hover:text-gold-600 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {news.length > 0 ? (
            <div className="grid gap-6 lg:grid-cols-3">
              {news[0] && (
                <div className="lg:col-span-2">
                  <NewsCard article={news[0]} featured />
                </div>
              )}
              <div className="flex flex-col gap-6">
                {news.slice(1).map((article) => (
                  <NewsCard key={article.id} article={article} />
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>No news articles published yet.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── OPPORTUNITIES ────────────────────────────────────── */}
      <section className="py-24 bg-gray-50">
        <div className="container-max section-padding">
          <div className="flex items-end justify-between mb-12">
            <SectionHeader
              title="Featured Opportunities"
              subtitle="Scholarships & Internships"
              align="left"
            />
            <Link
              href="/opportunities"
              className="hidden sm:inline-flex items-center gap-1 text-navy-900 font-medium hover:text-gold-600 transition-colors"
            >
              View All <ArrowRight className="w-4 h-4" />
            </Link>
          </div>

          {opportunities.length > 0 ? (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {opportunities.map((opp) => (
                <OpportunityCard key={opp.id} opportunity={opp} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 text-muted-foreground">
              <p>No opportunities posted yet. Check back soon.</p>
            </div>
          )}
        </div>
      </section>

      {/* ── WELFARE BANNER ───────────────────────────────────── */}
      <section className="bg-navy-900 py-20">
        <div className="container-max section-padding text-center">
          <div className="max-w-2xl mx-auto">
            <div className="w-16 h-1 bg-gold-500 mx-auto mb-6 rounded-full" />
            <h2 className="font-display text-3xl md:text-4xl font-bold text-white mb-4">
              Need Support? We&apos;re Here.
            </h2>
            <p className="text-white/70 mb-8 text-lg">
              GPSA-UDS Welfare Committee provides confidential support for
              financial, medical, and emergency situations.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-10">
              <a
                href={`tel:${phone.replace(/\s/g, "")}`}
                className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-medium"
              >
                <Phone className="w-5 h-5" /> {phone}
              </a>
              <a
                href={`mailto:${email}`}
                className="inline-flex items-center gap-2 text-gold-400 hover:text-gold-300 font-medium"
              >
                <Mail className="w-5 h-5" /> {email}
              </a>
            </div>
            <Link
              href="/welfare"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-full transition-colors"
            >
              Submit a Welfare Request <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── PARTNERS ─────────────────────────────────────────── */}
      <section className="py-20 bg-white border-t">
        <div className="container-max section-padding">
          <p className="text-center text-sm font-medium tracking-widest uppercase text-muted-foreground mb-10">
            Our Partners & Collaborators
          </p>
          <div className="flex flex-wrap items-center justify-center gap-6">
            {[
              "Ghana Pharmacy Council",
              "Pharmaceutical Society of Ghana",
              "UDS Faculty of Pharmacy",
              "PSWAG",
              "WHO Ghana",
            ].map((partner) => (
              <div
                key={partner}
                className="px-6 py-3 border border-gray-200 rounded-full text-sm text-muted-foreground hover:border-navy-900 hover:text-navy-900 transition-colors"
              >
                {partner}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── NEWSLETTER ───────────────────────────────────────── */}
      <NewsletterSection />
    </>
  );
}

function NewsletterSection() {
  return (
    <section className="py-24 bg-gray-50 border-t">
      <div className="container-max section-padding">
        <div className="max-w-xl mx-auto text-center">
          <SectionHeader
            title="Stay in the Loop"
            subtitle="Newsletter"
            align="center"
          />
          <p className="text-muted-foreground mb-8">
            Get updates on events, opportunities, and association news delivered
            to your inbox.
          </p>
          <NewsletterForm />
        </div>
      </div>
    </section>
  );
}

