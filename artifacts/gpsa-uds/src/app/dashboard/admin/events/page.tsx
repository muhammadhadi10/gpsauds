import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { AdminEventsTable } from "@/components/dashboard/AdminEventsTable";

export const revalidate = 30;

export default async function AdminEventsPage() {
  await requireRole("super_admin", "events");
  const supabase = await createClient();

  const { data } = await supabase
    .from("events")
    .select("*, profiles!created_by(full_name)")
    .order("starts_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy-900">Events</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage all GPSA-UDS events
        </p>
      </div>
      <AdminEventsTable events={data ?? []} />
    </div>
  );
}
