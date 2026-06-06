import type { Metadata } from "next";
import { SectionHeader } from "@/components/site/SectionHeader";
import { WelfareForm } from "@/components/site/WelfareForm";
import { Heart, DollarSign, Stethoscope, AlertCircle, Shield } from "lucide-react";

export const metadata: Metadata = {
  title: "Welfare Services",
  description:
    "GPSA-UDS Welfare Committee provides confidential support for financial, medical, emergency, and bereavement situations.",
};

const SERVICES = [
  {
    icon: DollarSign,
    title: "Financial Aid",
    description:
      "Support for members facing financial hardship affecting their academic progress. Applications are assessed confidentially by the Welfare Committee.",
  },
  {
    icon: Stethoscope,
    title: "Medical Support",
    description:
      "Assistance for members with unexpected medical expenses. We work with relevant bodies to provide timely support.",
  },
  {
    icon: Heart,
    title: "Bereavement Support",
    description:
      "Compassionate support for members who have lost a close family member. We stand with you in difficult times.",
  },
  {
    icon: AlertCircle,
    title: "Emergency Assistance",
    description:
      "Rapid response for urgent situations affecting members' safety and wellbeing. Contact us immediately for emergency cases.",
  },
];

export default function WelfarePage() {
  return (
    <>
      <section className="bg-navy-900 pt-32 pb-20 text-white">
        <div className="container-max section-padding text-center">
          <div className="w-16 h-1 bg-gold-500 mx-auto mb-6 rounded-full" />
          <h1 className="font-display text-4xl md:text-5xl font-bold mb-4">
            Student Welfare Services
          </h1>
          <p className="text-white/70 max-w-2xl mx-auto text-lg">
            Your wellbeing is our priority. GPSA-UDS Welfare Committee is here
            to support you — confidentially and with care.
          </p>
        </div>
      </section>

      {/* Services */}
      <section className="py-20 bg-white">
        <div className="container-max section-padding">
          <SectionHeader
            title="How We Support You"
            subtitle="Welfare Services"
            align="center"
          />
          <div className="grid sm:grid-cols-2 gap-6 mt-12">
            {SERVICES.map(({ icon: Icon, title, description }) => (
              <div
                key={title}
                className="flex gap-4 p-6 border border-gray-100 rounded-2xl hover:shadow-md hover:border-gold-200 transition-all"
              >
                <div className="flex-shrink-0 w-12 h-12 bg-navy-50 rounded-xl flex items-center justify-center">
                  <Icon className="w-6 h-6 text-navy-900" />
                </div>
                <div>
                  <h3 className="font-display font-bold text-navy-900 text-lg mb-2">
                    {title}
                  </h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    {description}
                  </p>
                </div>
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
              title="Submit a Welfare Request"
              subtitle="Confidential Support"
              align="center"
            />
            <p className="text-center text-muted-foreground mt-4 mb-10">
              Fill in the form below. All submissions are treated with the utmost
              confidentiality. You will receive a ticket reference number upon
              submission.
            </p>
            <WelfareForm />
          </div>
        </div>
      </section>

      {/* Confidentiality notice */}
      <section className="py-16 bg-navy-900">
        <div className="container-max section-padding">
          <div className="flex flex-col sm:flex-row items-center gap-6 max-w-2xl mx-auto text-center sm:text-left">
            <div className="flex-shrink-0 w-14 h-14 bg-gold-500/20 rounded-full flex items-center justify-center">
              <Shield className="w-7 h-7 text-gold-400" />
            </div>
            <div>
              <h3 className="font-display font-bold text-white text-xl mb-2">
                Your Privacy Is Protected
              </h3>
              <p className="text-white/70 text-sm leading-relaxed">
                All welfare requests are handled exclusively by the Welfare
                Committee and the Executive body. Your information will never be
                shared without your consent. We are committed to providing
                support with dignity and discretion.
              </p>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}
