import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { SettingsForm } from "@/components/dashboard/SettingsForm";

export const revalidate = 0;

export default async function SettingsPage() {
  await requireRole("super_admin");
  const supabase = await createClient();

  const { data: rows } = await supabase
    .from("site_settings")
    .select("key, value");

  const settings: Record<string, string> = {};
  for (const r of rows ?? []) settings[r.key] = r.value;

  return (
    <div className="space-y-6 max-w-3xl">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy-900">Site Settings</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage public-facing content and contact information
        </p>
      </div>
      <SettingsForm settings={settings} />
    </div>
  );
}
