import type { Metadata } from "next";
import { SectionHeader } from "@/components/site/SectionHeader";
import { BookOpen, Users, Heart, Star, Globe, Award } from "lucide-react";

export const metadata: Metadata = {
  title: "About Us",
  description:
    "Learn about the history, mission, vision, and committee structure of GPSA-UDS — Ghana Pharmaceutical Students Association at the University for Development Studies.",
};

const COMMITTEES = [
  {
    name: "Executive Committee",
    roles: ["President", "Vice President", "Secretary", "Treasurer", "Public Relations Officer"],
  },
  {
    name: "Academic Committee",
    roles: ["Academic Chairman", "Academic Secretary", "Academic Member"],
  },
  {
    name: "Welfare Committee",
    roles: ["Welfare Chairman", "Welfare Secretary", "Welfare Officer"],
  },
  {
    name: "Events Committee",
    roles: ["Events Coordinator", "Events Secretary", "Events Member"],
  },
  {
    name: "Opportunities Committee",
    roles: ["Opportunities Chairman", "Opportunities Secretary", "Opportunities Member"],
  },
  {
    name: "Editorial Board (EDIBOARD)",
    roles: ["Editor-in-Chief", "Deputy Editor", "Content Writer", "Graphic Designer", "Social Media Manager"],
  },
];

const VALUES = [
  { icon: BookOpen, title: "Academic Excellence", description: "Promoting high academic standards and a culture of learning among pharmacy students." },
  { icon: Users, title: "Unity & Brotherhood", description: "Fostering a strong sense of community and solidarity among all GPSA-UDS members." },
  { icon: Heart, title: "Student Welfare", description: "Ensuring the physical, emotional, and financial wellbeing of every member." },
  { icon: Star, title: "Leadership", description: "Developing the next generation of pharmaceutical leaders for Ghana and Africa." },
  { icon: Globe, title: "Professionalism", description: "Upholding the highest standards of professional conduct in all our activities." },
  { icon: Award, title: "Service", description: "Giving back to our communities through impactful outreach and public health initiatives." },
];

export default function AboutPage() {
  return (
    <>
      {/* Hero */}
      <section className="bg-navy-900 pt-32 pb-20 text-white">
        <div className="container-max section-padding text-center">
          <div className="w-16 h-1 bg-gold-500 mx-auto mb-6 rounded-full" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            About GPSA-UDS
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Our story, our purpose, and the people who make GPSA-UDS the
            backbone of pharmacy student life at UDS.
          </p>
        </div>
      </section>

      {/* History */}
      <section className="py-24 bg-white">
        <div className="container-max section-padding">
          <div className="max-w-3xl mx-auto">
            <SectionHeader title="Our History" subtitle="Since 2016" align="left" />
            <div className="prose prose-lg text-muted-foreground mt-6 space-y-4">
              <p>
                The Ghana Pharmaceutical Students Association — University for
                Development Studies (GPSA-UDS) was founded in 2016 following the
                establishment of the Faculty of Pharmacy and Pharmaceutical Sciences
                at UDS. Recognizing the need for a united student body to champion
                academic and professional interests, a group of pioneering students
                set out to create an association that would stand the test of time.
              </p>
              <p>
                In its early years, GPSA-UDS focused on building its foundational
                structures — establishing committees, drafting its constitution, and
                forming alliances with the Pharmaceutical Society of Ghana (PSG) and
                the Ghana Pharmacy Council. The association quickly gained recognition
                as a critical voice for pharmacy students in northern Ghana.
              </p>
              <p>
                Over the years, GPSA-UDS has grown from a handful of founding members
                to over 500 active members spanning all levels of the pharmacy
                programme. The association has hosted inter-university symposia,
                organized community health outreaches, and secured scholarships and
                internship placements for its members — cementing its reputation as one
                of the most active student associations at UDS.
              </p>
              <p>
                Today, GPSA-UDS continues to evolve, embracing digital tools to
                better serve its members while staying true to its founding mission of
                empowering pharmacy students through knowledge, community, and service.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Mission & Vision */}
      <section className="py-24 bg-gray-50">
        <div className="container-max section-padding">
          <SectionHeader title="Mission & Vision" align="center" />
          <div className="grid md:grid-cols-2 gap-8 mt-12 max-w-4xl mx-auto">
            <div className="bg-navy-900 rounded-2xl p-8 text-white">
              <div className="w-12 h-12 bg-gold-500/20 rounded-xl flex items-center justify-center mb-6">
                <BookOpen className="w-6 h-6 text-gold-400" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4">Our Mission</h3>
              <p className="text-white/70 leading-relaxed">
                To promote the academic, professional, and social welfare of
                pharmacy students at the University for Development Studies by
                providing a platform for learning, leadership, and community
                engagement.
              </p>
            </div>
            <div className="bg-gold-500 rounded-2xl p-8 text-white">
              <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                <Star className="w-6 h-6 text-white" />
              </div>
              <h3 className="font-display text-2xl font-bold mb-4">Our Vision</h3>
              <p className="text-white/80 leading-relaxed">
                To be the premier student pharmaceutical association in Ghana,
                recognized for producing competent, compassionate, and socially
                responsible pharmacy professionals who contribute to the health
                and wellbeing of all Ghanaians.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Core Values */}
      <section className="py-24 bg-white">
        <div className="container-max section-padding">
          <SectionHeader title="Core Values" align="center" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {VALUES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="p-6 border border-gray-100 rounded-2xl hover:shadow-md hover:border-gold-200 transition-all"
              >
                <div className="w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center mb-4">
                  <Icon className="w-6 h-6 text-navy-900" />
                </div>
                <h3 className="font-display font-bold text-lg text-navy-900 mb-2">
                  {title}
                </h3>
                <p className="text-muted-foreground text-sm leading-relaxed">
                  {description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Committee Structure */}
      <section className="py-24 bg-gray-50">
        <div className="container-max section-padding">
          <SectionHeader
            title="Committee Structure"
            subtitle="How We Operate"
            align="center"
          />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 mt-12">
            {COMMITTEES.map((committee) => (
              <div
                key={committee.name}
                className="bg-white rounded-2xl border p-6 hover:shadow-md transition-shadow"
              >
                <h3 className="font-display font-bold text-navy-900 text-lg mb-4 pb-3 border-b border-gold-100">
                  {committee.name}
                </h3>
                <ul className="space-y-2">
                  {committee.roles.map((role) => (
                    <li key={role} className="flex items-center gap-2 text-sm text-muted-foreground">
                      <span className="w-1.5 h-1.5 rounded-full bg-gold-500 flex-shrink-0" />
                      {role}
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Leadership CTA */}
      <section className="py-20 bg-navy-900 text-white text-center">
        <div className="container-max section-padding">
          <h2 className="font-display text-3xl font-bold mb-4">
            Meet Our Executive Team
          </h2>
          <p className="text-white/70 mb-8 max-w-xl mx-auto">
            Our executives are elected by members to serve the association and
            uphold our founding values.
          </p>
          <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4 max-w-4xl mx-auto">
            {["President", "Vice President", "Secretary", "Treasurer", "PRO"].map((role) => (
              <div key={role} className="bg-white/10 rounded-xl p-4 text-center">
                <div className="w-16 h-16 rounded-full bg-white/20 mx-auto mb-3 flex items-center justify-center">
                  <Users className="w-8 h-8 text-gold-400" />
                </div>
                <div className="text-white font-medium text-sm">{role}</div>
                <div className="text-white/50 text-xs mt-1">2024/2025</div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
