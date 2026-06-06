import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { WelfareRequestsPanel } from "@/components/dashboard/WelfareRequestsPanel";

export const revalidate = 30;

export default async function WelfareDashboardPage() {
  await requireRole("super_admin", "welfare");
  const supabase = await createClient();

  const { data } = await supabase
    .from("welfare_requests")
    .select("*, profiles!user_id(full_name, email, student_id, phone)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy-900">Welfare Requests</h2>
        <p className="text-muted-foreground text-sm mt-1">
          {(data ?? []).filter((r) => ["submitted","under_review"].includes(r.status)).length} open requests
        </p>
      </div>
      <WelfareRequestsPanel requests={data ?? []} />
    </div>
  );
}
