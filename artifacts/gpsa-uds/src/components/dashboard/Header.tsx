import { createClient } from "@/lib/supabase/server";
import type { Profile } from "@/types";
import { NotificationBell } from "@/components/dashboard/NotificationBell";

export async function DashboardHeader({ user }: { user: Profile }) {
  const supabase = createClient();
  const { count } = await supabase
    .from("notifications")
    .select("id", { count: "exact", head: true })
    .eq("user_id", user.id)
    .eq("is_read", false);

  return (
    <header className="bg-white border-b h-16 flex items-center justify-between px-6 lg:px-8 flex-shrink-0">
      <div>
        <h1 className="font-display font-bold text-navy-900 text-base">
          Admin Dashboard
        </h1>
        <p className="text-xs text-muted-foreground">GPSA-UDS Control Panel</p>
      </div>
      <div className="flex items-center gap-4">
        <NotificationBell unreadCount={count ?? 0} userId={user.id} />
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-full bg-navy-900 flex items-center justify-center">
            {user.avatar_url ? (
              <img src={user.avatar_url} alt={user.full_name} className="w-8 h-8 rounded-full object-cover" />
            ) : (
              <span className="text-white text-xs font-bold">
                {user.full_name.charAt(0).toUpperCase()}
              </span>
            )}
          </div>
          <div className="hidden sm:block">
            <p className="text-sm font-medium text-navy-900 leading-none">{user.full_name}</p>
            <p className="text-xs text-muted-foreground capitalize mt-0.5">{user.role.replace("_", " ")}</p>
          </div>
        </div>
      </div>
    </header>
  );
}
