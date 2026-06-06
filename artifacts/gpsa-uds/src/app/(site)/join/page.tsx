import type { Metadata } from "next";
import { SectionHeader } from "@/components/site/SectionHeader";
import { JoinForm } from "@/components/site/JoinForm";
import { BookOpen, Users, Heart, Star, Globe, Award, CheckCircle } from "lucide-react";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = {
  title: "Join GPSA-UDS",
  description:
    "Apply for membership in the Ghana Pharmaceutical Students Association at UDS. Access resources, events, welfare support, and career opportunities.",
};

const BENEFITS = [
  { icon: BookOpen, title: "Academic Resources", description: "Access past questions, lecture notes, and curated study materials." },
  { icon: Users, title: "Events & Conferences", description: "Priority access to academic conferences, workshops, and social events." },
  { icon: Heart, title: "Welfare Support", description: "Financial, medical, and emergency assistance from the Welfare Committee." },
  { icon: Star, title: "Opportunities", description: "Exclusive scholarships, internships, and job listings for members." },
  { icon: Globe, title: "Professional Network", description: "Connect with peers, alumni, and pharmaceutical industry professionals." },
  { icon: Award, title: "Membership Certificate", description: "Official GPSA-UDS membership certificate recognizing your commitment." },
];

export default async function JoinPage() {
  const supabase = await createClient();
  const { data: settings } = await supabase
    .from("site_settings")
    .select("key, value")
    .in("key", [
      "membership_fee_100_level",
      "membership_fee_200_level",
      "membership_fee_300_level",
      "membership_fee_400_level",
      "membership_fee_500_level",
      "membership_fee_alumnus",
      "current_academic_year",
    ]);

  const fees: Record<string, string> = {};
  for (const s of settings ?? []) fees[s.key] = s.value;

  return (
    <>
      <section className="bg-navy-900 pt-32 pb-20 text-white">
        <div className="container-max section-padding text-center">
          <div className="w-16 h-1 bg-gold-500 mx-auto mb-6 rounded-full" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Join GPSA-UDS
          </h1>
          <p className="text-white/70 max-w-xl mx-auto text-lg">
            Become part of a community dedicated to academic excellence,
            professional growth, and student welfare.
          </p>
          {fees["current_academic_year"] && (
            <div className="mt-6 inline-block px-5 py-2 bg-gold-500/20 border border-gold-500/40 text-gold-300 rounded-full text-sm">
              Academic Year {fees["current_academic_year"]}
            </div>
          )}
        </div>
      </section>

      {/* Benefits */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <SectionHeader
            title="Member Benefits"
            subtitle="Why Join Us"
            align="center"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {BENEFITS.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 p-5 border border-gray-100 rounded-2xl hover:shadow-md hover:border-gold-200 transition-all"
              >
                <div className="w-10 h-10 bg-navy-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon className="w-5 h-5 text-navy-900" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-navy-900 mb-1">{title}</h3>
                  <p className="text-muted-foreground text-sm">{description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Fees */}
      <section className="py-16 bg-gray-50">
        <div className="container-max section-padding">
          <SectionHeader title="Membership Dues" align="center" />
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8 max-w-4xl mx-auto">
            {[
              { level: "100 Level", key: "membership_fee_100_level" },
              { level: "200 Level", key: "membership_fee_200_level" },
              { level: "300 Level", key: "membership_fee_300_level" },
              { level: "400 Level", key: "membership_fee_400_level" },
              { level: "500 Level", key: "membership_fee_500_level" },
              { level: "Alumni", key: "membership_fee_alumnus" },
            ].map(({ level, key }) => (
              <div
                key={level}
                className="bg-white rounded-xl border p-4 text-center hover:border-gold-300 transition-colors"
              >
                <div className="text-xs text-muted-foreground mb-1">{level}</div>
                <div className="font-display font-bold text-2xl text-navy-900">
                  GHS {fees[key] ?? "30"}
                </div>
                <div className="text-xs text-muted-foreground mt-1">per year</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Steps */}
      <section className="py-16 bg-white border-y">
        <div className="container-max section-padding">
          <SectionHeader title="How It Works" align="center" />
          <div className="grid sm:grid-cols-3 gap-6 mt-10 max-w-3xl mx-auto text-center">
            {[
              { step: "1", title: "Fill the Form", desc: "Complete the application with your student details." },
              { step: "2", title: "Pay Dues", desc: "Pay via Mobile Money or upload your receipt." },
              { step: "3", title: "Get Activated", desc: "Treasurer verifies your payment and activates membership." },
            ].map(({ step, title, desc }) => (
              <div key={step} className="flex flex-col items-center">
                <div className="w-12 h-12 rounded-full bg-navy-900 text-white font-display font-bold text-xl flex items-center justify-center mb-4">
                  {step}
                </div>
                <h3 className="font-display font-bold text-navy-900 mb-1">{title}</h3>
                <p className="text-muted-foreground text-sm">{desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-20 bg-gray-50">
        <div className="container-max section-padding">
          <div className="max-w-2xl mx-auto">
            <SectionHeader
              title="Application Form"
              subtitle="Join GPSA-UDS"
              align="center"
            />
            <p className="text-center text-muted-foreground mt-4 mb-10">
              Submit your application below. You will receive an email
              confirmation with next steps after your payment is verified.
            </p>
            <JoinForm fees={fees} />
          </div>
        </div>
      </section>
    </>
  );
}
