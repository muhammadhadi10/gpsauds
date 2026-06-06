import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { MembershipsTable } from "@/components/dashboard/MembershipsTable";

export const revalidate = 30;

export default async function MembershipsPage() {
  await requireRole("super_admin", "treasurer");
  const supabase = await createClient();

  const { data } = await supabase
    .from("memberships")
    .select("*, profiles!user_id(full_name, email, student_id, level)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-900">Memberships & Dues</h2>
          <p className="text-muted-foreground text-sm mt-1">
            Review payment submissions and activate memberships
          </p>
        </div>
      </div>
      <MembershipsTable memberships={data ?? []} />
    </div>
  );
}
