import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { CommitteesPanel } from "@/components/dashboard/CommitteesPanel";

export const revalidate = 30;

const STAFF_ROLES = ["super_admin","treasurer","academic","welfare","events","opportunities","ediboard"];

export default async function CommitteesPage() {
  await requireRole("super_admin");
  const supabase = await createClient();

  const { data: committee } = await supabase
    .from("profiles")
    .select("id, full_name, email, role, created_at, membership_status")
    .in("role", STAFF_ROLES)
    .order("role");

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy-900">Committee Accounts</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Manage login credentials for all GPSA-UDS committee members
        </p>
      </div>
      <CommitteesPanel accounts={committee ?? []} />
    </div>
  );
}
