import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { formatDate } from "@/lib/utils";

export const revalidate = 30;

const TYPE_COLORS: Record<string, string> = {
  membership:  "bg-blue-100 text-blue-700",
  payment:     "bg-green-100 text-green-700",
  welfare:     "bg-red-100 text-red-700",
  event:       "bg-purple-100 text-purple-700",
  opportunity: "bg-gold-100 text-gold-700",
  news:        "bg-gray-100 text-gray-600",
  system:      "bg-navy-100 text-navy-700",
};

export default async function NotificationsPage() {
  const user = await requireRole("super_admin");
  const supabase = await createClient();

  const { data: notifications } = await supabase
    .from("notifications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(50);

  const unread = (notifications ?? []).filter((n) => !n.is_read).length;

  return (
    <div className="space-y-6 max-w-3xl">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="font-display text-2xl font-bold text-navy-900">Notifications</h2>
          <p className="text-muted-foreground text-sm mt-1">
            {unread > 0 ? `${unread} unread notifications` : "All caught up!"}
          </p>
        </div>
      </div>

      <div className="bg-white rounded-2xl border divide-y overflow-hidden">
        {(notifications ?? []).length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <p>No notifications yet.</p>
          </div>
        ) : (
          (notifications ?? []).map((n) => (
            <div
              key={n.id}
              className={`px-6 py-4 flex items-start gap-4 ${n.is_read ? "" : "bg-blue-50"}`}
            >
              <span
                className={`text-[10px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0 mt-1 ${
                  TYPE_COLORS[n.type] ?? TYPE_COLORS.system
                }`}
              >
                {n.type}
              </span>
              <div className="flex-1">
                <p className="font-medium text-navy-900 text-sm">{n.title}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{n.body}</p>
                {n.action_url && (
                  <a href={n.action_url} className="text-xs text-gold-600 hover:text-gold-700 mt-1 inline-block">
                    View details →
                  </a>
                )}
              </div>
              <div className="flex items-center gap-2 flex-shrink-0">
                <span className="text-xs text-muted-foreground">
                  {formatDate(n.created_at)}
                </span>
                {!n.is_read && (
                  <div className="w-2 h-2 rounded-full bg-blue-500" />
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
