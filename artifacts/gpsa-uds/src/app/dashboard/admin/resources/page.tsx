import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { AdminResourcesTable } from "@/components/dashboard/AdminResourcesTable";

export const revalidate = 30;

export default async function AdminResourcesPage() {
  await requireRole("super_admin", "academic");
  const supabase = await createClient();

  const { data } = await supabase
    .from("academic_resources")
    .select("*, profiles!uploaded_by(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy-900">Academic Resources</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Review and approve uploaded study materials
        </p>
      </div>
      <AdminResourcesTable resources={data ?? []} />
    </div>
  );
}
