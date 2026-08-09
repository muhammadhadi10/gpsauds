import type { Metadata } from "next";
import { getPublishedOpportunities } from "@/lib/data/repository";
import type { Opportunity } from "@/types";
import { SectionHeader } from "@/components/site/SectionHeader";
import { OpportunitiesClient } from "@/components/site/OpportunitiesClient";

export const metadata: Metadata = {
  title: "Opportunities",
  description:
    "Browse scholarships, internships, jobs, conferences, and workshops curated for GPSA-UDS members.",
};

export const revalidate = 60;

export default async function OpportunitiesPage() {
  const opportunities = await getPublishedOpportunities();

  return (
    <>
      <section className="bg-navy-900 pt-32 pb-20 text-white">
        <div className="container-max section-padding text-center">
          <div className="w-16 h-1 bg-gold-500 mx-auto mb-6 rounded-full" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Opportunities
          </h1>
          <p className="text-white/70 max-w-xl mx-auto">
            Scholarships, internships, conferences, and career opportunities
            handpicked for pharmacy students at UDS.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50 min-h-screen">
        <div className="container-max section-padding">
          <OpportunitiesClient opportunities={opportunities} />
        </div>
      </section>
    </>
  );
}
