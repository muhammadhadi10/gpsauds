import type { Metadata } from "next";
import { createClient } from "@/lib/supabase/server";
import type { AcademicResource } from "@/types";
import { SectionHeader } from "@/components/site/SectionHeader";
import { ResourcesClient } from "@/components/site/ResourcesClient";

export const metadata: Metadata = {
  title: "Academic Resources",
  description:
    "Download past questions, lecture notes, textbooks, and research papers shared by GPSA-UDS members.",
};

export const revalidate = 120;

export default async function ResourcesPage() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("academic_resources")
    .select("*")
    .eq("is_approved", true)
    .order("created_at", { ascending: false });

  const resources = (data ?? []) as AcademicResource[];

  return (
    <>
      <section className="bg-navy-900 pt-32 pb-20 text-white">
        <div className="container-max section-padding text-center">
          <div className="w-16 h-1 bg-gold-500 mx-auto mb-6 rounded-full" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Academic Resources
          </h1>
          <p className="text-white/70 max-w-xl mx-auto">
            Past questions, lecture notes, and study materials shared by
            GPSA-UDS members to help you excel academically.
          </p>
        </div>
      </section>

      <section className="py-20 bg-gray-50 min-h-screen">
        <div className="container-max section-padding">
          <ResourcesClient resources={resources} />
        </div>
      </section>
    </>
  );
}
