import type { Metadata } from "next";
import { notFound } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { formatDate, formatCurrency } from "@/lib/utils";
import { Badge } from "@/components/ui/Badge";
import {
  ArrowLeft,
  Calendar,
  MapPin,
  Building,
  ExternalLink,
  CheckCircle,
  Gift,
} from "lucide-react";
import type { Opportunity } from "@/types";

interface Props {
  params: { slug: string };
}

const TYPE_COLORS: Record<string, "navy" | "gold" | "green" | "red" | "gray"> = {
  scholarship: "gold",
  internship: "navy",
  job: "green",
  conference: "gray",
  workshop: "gray",
  other: "gray",
};

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const supabase = await createClient();
  const { data } = await supabase
    .from("opportunities")
    .select("title, description")
    .eq("slug", params.slug)
    .single();

  if (!data) return { title: "Opportunity Not Found" };
  return {
    title: data.title,
    description: data.description.slice(0, 160),
  };
}

export default async function OpportunityDetailPage({ params }: Props) {
  const supabase = await createClient();

  const { data } = await supabase
    .from("opportunities")
    .select("*")
    .eq("slug", params.slug)
    .eq("status", "published")
    .single();

  if (!data) notFound();

  const opp = data as Opportunity;
  const isDeadlinePassed = opp.deadline
    ? new Date(opp.deadline) < new Date()
    : false;

  const { data: related } = await supabase
    .from("opportunities")
    .select("id, title, slug, type, deadline, organisation")
    .eq("status", "published")
    .eq("type", opp.type)
    .neq("id", opp.id)
    .limit(3);

  return (
    <div className="pt-24">
      <div className="bg-gradient-to-br from-navy-900 to-navy-700 pb-20 pt-8">
        <div className="container-max section-padding">
          <Link
            href="/opportunities"
            className="inline-flex items-center gap-2 text-white/60 hover:text-white text-sm mb-8 transition-colors"
          >
            <ArrowLeft className="w-4 h-4" /> Back to Opportunities
          </Link>

          <Badge variant={TYPE_COLORS[opp.type] ?? "gray"} className="mb-4">
            {opp.type.charAt(0).toUpperCase() + opp.type.slice(1)}
          </Badge>

          <h1 className="font-display text-3xl md:text-4xl font-bold text-white mb-4 max-w-3xl">
            {opp.title}
          </h1>

          <div className="flex flex-wrap gap-4 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <Building className="w-4 h-4 text-gold-400" />
              {opp.organisation}
            </span>
            {opp.deadline && (
              <span
                className={`flex items-center gap-1.5 ${isDeadlinePassed ? "text-red-400" : ""}`}
              >
                <Calendar className="w-4 h-4 text-gold-400" />
                Deadline: {formatDate(opp.deadline)}{" "}
                {isDeadlinePassed && "(Closed)"}
              </span>
            )}
            <span className="flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-gold-400" />
              {opp.is_remote ? "Remote" : opp.location || "Ghana"}
            </span>
          </div>
        </div>
      </div>

      <div className="container-max section-padding py-12">
        <div className="grid lg:grid-cols-3 gap-12">
          <div className="lg:col-span-2 space-y-8">
            <div>
              <h2 className="font-display text-xl font-bold text-navy-900 mb-4">
                About This Opportunity
              </h2>
              <div
                className="prose prose-lg text-gray-700 max-w-none"
                dangerouslySetInnerHTML={{ __html: opp.description }}
              />
            </div>

            {opp.eligibility && (
              <div className="bg-blue-50 border border-blue-100 rounded-2xl p-6">
                <h3 className="font-display font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-blue-500" />
                  Eligibility Requirements
                </h3>
                <div
                  className="prose text-gray-700 max-w-none"
                  dangerouslySetInnerHTML={{ __html: opp.eligibility }}
                />
              </div>
            )}

            {opp.benefits && (
              <div className="bg-gold-50 border border-gold-100 rounded-2xl p-6">
                <h3 className="font-display font-bold text-navy-900 mb-3 flex items-center gap-2">
                  <Gift className="w-5 h-5 text-gold-500" />
                  Benefits
                </h3>
                <div
                  className="prose text-gray-700 max-w-none"
                  dangerouslySetInnerHTML={{ __html: opp.benefits }}
                />
              </div>
            )}
          </div>

          <div>
            <div className="bg-gray-50 rounded-2xl p-6 border sticky top-24 space-y-4">
              <h3 className="font-display font-bold text-navy-900 text-lg">
                Quick Info
              </h3>

              <div className="space-y-3 text-sm divide-y divide-gray-100">
                {[
                  { label: "Organisation", value: opp.organisation },
                  { label: "Type", value: opp.type.charAt(0).toUpperCase() + opp.type.slice(1) },
                  { label: "Location", value: opp.is_remote ? "Remote / Online" : (opp.location ?? "Not specified") },
                  opp.deadline
                    ? {
                        label: "Deadline",
                        value: formatDate(opp.deadline),
                        red: isDeadlinePassed,
                      }
                    : null,
                ]
                  .filter(Boolean)
                  .map((item) => (
                    <div key={item!.label} className="flex justify-between pt-3 first:pt-0">
                      <span className="text-muted-foreground">{item!.label}</span>
                      <span
                        className={`font-medium text-right ${
                          (item as { red?: boolean }).red
                            ? "text-red-600"
                            : "text-navy-900"
                        }`}
                      >
                        {item!.value}
                      </span>
                    </div>
                  ))}
              </div>

              {opp.application_url && !isDeadlinePassed && (
                <a
                  href={opp.application_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 w-full px-6 py-3 bg-gold-500 hover:bg-gold-600 text-white font-semibold rounded-xl transition-colors mt-4"
                >
                  Apply Now <ExternalLink className="w-4 h-4" />
                </a>
              )}
              {isDeadlinePassed && (
                <div className="text-center text-sm text-red-600 font-medium mt-4 py-2 bg-red-50 rounded-xl">
                  Applications Closed
                </div>
              )}
            </div>
          </div>
        </div>

        {(related ?? []).length > 0 && (
          <div className="mt-16 pt-12 border-t">
            <h2 className="font-display text-2xl font-bold text-navy-900 mb-6">
              More {opp.type.charAt(0).toUpperCase() + opp.type.slice(1)} Opportunities
            </h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {(related ?? []).map((r) => (
                <Link
                  key={r.id}
                  href={`/opportunities/${r.slug}`}
                  className="block bg-white border rounded-xl p-4 hover:shadow-md transition-shadow"
                >
                  <Badge variant={TYPE_COLORS[r.type] ?? "gray"} className="mb-2">
                    {r.type}
                  </Badge>
                  <h3 className="font-display font-bold text-navy-900 text-sm leading-snug mb-1">
                    {r.title}
                  </h3>
                  <p className="text-xs text-muted-foreground">{r.organisation}</p>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
