"use client";

import { useState, useTransition } from "react";
import { saveSiteSettings } from "@/lib/actions/admin";
import { CheckCircle, Save } from "lucide-react";

const SECTIONS = [
  {
    title: "Organisation",
    fields: [
      { key: "site_name",           label: "Association Name",       type: "text",  placeholder: "GPSA-UDS" },
      { key: "site_tagline",        label: "Tagline",                type: "text",  placeholder: "Empowering Pharmacy Students" },
      { key: "current_academic_year", label: "Current Academic Year", type: "text",  placeholder: "2024/2025" },
    ],
  },
  {
    title: "President's Message",
    fields: [
      { key: "president_name",      label: "President's Name",       type: "text",     placeholder: "Full name" },
      { key: "president_message",   label: "President's Message",    type: "textarea", placeholder: "Welcome message from the president…" },
      { key: "president_photo_url", label: "President Photo URL",    type: "url",      placeholder: "https://…" },
    ],
  },
  {
    title: "Contact Information",
    fields: [
      { key: "contact_phone",       label: "General Phone",          type: "tel",   placeholder: "+233 XX XXX XXXX" },
      { key: "contact_email",       label: "General Email",          type: "email", placeholder: "info@gpsa-uds.org" },
      { key: "welfare_email",       label: "Welfare Committee Email", type: "email", placeholder: "welfare@gpsa-uds.org" },
      { key: "welfare_phone",       label: "Welfare Emergency Phone", type: "tel",   placeholder: "+233 XX XXX XXXX" },
      { key: "contact_address",     label: "Physical Address",       type: "text",  placeholder: "UDS Tamale Campus, Dungu" },
    ],
  },
  {
    title: "Social Media",
    fields: [
      { key: "social_facebook",     label: "Facebook URL",           type: "url",   placeholder: "https://facebook.com/gpsa.uds" },
      { key: "social_twitter",      label: "Twitter / X URL",        type: "url",   placeholder: "https://twitter.com/gpsa_uds" },
      { key: "social_instagram",    label: "Instagram URL",          type: "url",   placeholder: "https://instagram.com/gpsa.uds" },
      { key: "social_linkedin",     label: "LinkedIn URL",           type: "url",   placeholder: "https://linkedin.com/…" },
      { key: "social_whatsapp",     label: "WhatsApp Group Link",    type: "url",   placeholder: "https://chat.whatsapp.com/…" },
    ],
  },
  {
    title: "Membership Dues (GHS)",
    fields: [
      { key: "membership_fee_100_level", label: "100 Level", type: "number", placeholder: "30" },
      { key: "membership_fee_200_level", label: "200 Level", type: "number", placeholder: "30" },
      { key: "membership_fee_300_level", label: "300 Level", type: "number", placeholder: "30" },
      { key: "membership_fee_400_level", label: "400 Level", type: "number", placeholder: "30" },
      { key: "membership_fee_500_level", label: "500 Level", type: "number", placeholder: "30" },
      { key: "membership_fee_alumnus",   label: "Alumni",    type: "number", placeholder: "50" },
    ],
  },
  {
    title: "MoMo Payment Details",
    fields: [
      { key: "momo_number",         label: "MoMo Number",            type: "tel",  placeholder: "+233 XX XXX XXXX" },
      { key: "momo_name",           label: "Account Name",           type: "text", placeholder: "GPSA UDS Treasurer" },
      { key: "momo_network",        label: "Network",                type: "text", placeholder: "MTN / Vodafone / AirtelTigo" },
    ],
  },
];

export function SettingsForm({ settings }: { settings: Record<string, string> }) {
  const [values, setValues] = useState<Record<string, string>>(settings);
  const [isPending, startTransition] = useTransition();
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const set = (key: string, value: string) =>
    setValues((prev) => ({ ...prev, [key]: value }));

  const handleSave = () => {
    startTransition(async () => {
      try {
        await saveSiteSettings(values);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
      } catch (e: unknown) {
        setError((e as Error).message);
        setTimeout(() => setError(null), 5000);
      }
    });
  };

  return (
    <div className="space-y-6">
      {saved && (
        <div className="flex items-center gap-2 px-4 py-3 bg-green-50 border border-green-200 rounded-xl text-sm text-green-700">
          <CheckCircle className="w-4 h-4" /> Settings saved successfully.
        </div>
      )}
      {error && (
        <div className="px-4 py-3 bg-red-50 border border-red-100 rounded-xl text-sm text-red-700">
          {error}
        </div>
      )}

      {SECTIONS.map((section) => (
        <div key={section.title} className="bg-white rounded-2xl border p-6">
          <h3 className="font-display font-bold text-navy-900 text-base mb-5 pb-3 border-b">
            {section.title}
          </h3>
          <div className={`grid gap-4 ${section.fields.length > 3 ? "sm:grid-cols-2" : "sm:grid-cols-1"}`}>
            {section.fields.map(({ key, label, type, placeholder }) => (
              <div key={key}>
                <label className="block text-sm font-medium text-navy-900 mb-1.5">{label}</label>
                {type === "textarea" ? (
                  <textarea
                    rows={4}
                    value={values[key] ?? ""}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={placeholder}
                    className={ic + " resize-none"}
                  />
                ) : (
                  <input
                    type={type}
                    value={values[key] ?? ""}
                    onChange={(e) => set(key, e.target.value)}
                    placeholder={placeholder}
                    className={ic}
                  />
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={isPending}
          className="flex items-center gap-2 px-6 py-3 bg-navy-900 text-white rounded-xl font-medium hover:bg-navy-800 transition-colors disabled:opacity-60"
        >
          <Save className="w-4 h-4" />
          {isPending ? "Saving…" : "Save All Settings"}
        </button>
      </div>
    </div>
  );
}

const ic = "w-full px-4 py-2.5 border border-gray-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-navy-900 transition-colors";
