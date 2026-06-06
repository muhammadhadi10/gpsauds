import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { AdminOpportunitiesTable } from "@/components/dashboard/AdminOpportunitiesTable";

export const revalidate = 30;

export default async function AdminOpportunitiesPage() {
  await requireRole("super_admin", "opportunities");
  const supabase = await createClient();

  const { data } = await supabase
    .from("opportunities")
    .select("*, profiles!created_by(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy-900">Opportunities</h2>
        <p className="text-muted-foreground text-sm mt-1">Scholarships, internships, jobs, and more</p>
      </div>
      <AdminOpportunitiesTable opportunities={data ?? []} />
    </div>
  );
}
