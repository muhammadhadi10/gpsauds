import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { AdminNewsTable } from "@/components/dashboard/AdminNewsTable";

export const revalidate = 30;

export default async function AdminNewsPage() {
  await requireRole("super_admin", "ediboard");
  const supabase = await createClient();

  const { data } = await supabase
    .from("news")
    .select("*, profiles!author_id(full_name)")
    .order("created_at", { ascending: false });

  return (
    <div className="space-y-6">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy-900">News Articles</h2>
        <p className="text-muted-foreground text-sm mt-1">Manage EDIBOARD publications</p>
      </div>
      <AdminNewsTable articles={data ?? []} />
    </div>
  );
}
