import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { MembersTable } from "@/components/dashboard/MembersTable";

export const revalidate = 30;

export default async function MembersPage() {
  await requireRole("super_admin");
  const supabase = await createClient();

  const { data: members } = await supabase
    .from("profiles")
    .select("*, memberships(status, tier, academic_year, start_date, end_date)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-900">Members</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {members?.length ?? 0} total accounts
          </p>
        </div>
      </div>
      <MembersTable members={members ?? []} />
    </div>
  );
}
