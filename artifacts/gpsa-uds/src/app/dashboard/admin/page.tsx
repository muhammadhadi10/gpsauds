import { createClient } from "@/lib/supabase/server";
import { requireRole } from "@/lib/auth";
import { StatsCard } from "@/components/dashboard/StatsCard";
import { RecentActivity } from "@/components/dashboard/RecentActivity";
import { QuickActions } from "@/components/dashboard/QuickActions";
import {
  Users, Clock, Calendar, Heart,
  Newspaper, Briefcase,
} from "lucide-react";

export const revalidate = 60;

export default async function AdminOverviewPage() {
  await requireRole("super_admin");
  const supabase = await createClient();

  const [
    { count: totalMembers },
    { count: pendingMemberships },
    { count: upcomingEvents },
    { count: openWelfare },
    { count: publishedNews },
    { count: activeOpps },
    { data: recentActivity },
  ] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }).eq("role", "student"),
    supabase.from("memberships").select("id", { count: "exact", head: true }).eq("status", "pending"),
    supabase.from("events").select("id", { count: "exact", head: true })
      .eq("status", "published").gte("starts_at", new Date().toISOString()),
    supabase.from("welfare_requests").select("id", { count: "exact", head: true })
      .in("status", ["submitted", "under_review"]),
    supabase.from("news").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("opportunities").select("id", { count: "exact", head: true }).eq("status", "published"),
    supabase.from("notifications")
      .select("id, title, body, type, created_at")
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  const stats = [
    { title: "Total Students",        value: totalMembers ?? 0,       icon: Users,     color: "navy"   as const },
    { title: "Pending Memberships",   value: pendingMemberships ?? 0, icon: Clock,     color: "gold"   as const },
    { title: "Upcoming Events",       value: upcomingEvents ?? 0,     icon: Calendar,  color: "blue"   as const },
    { title: "Open Welfare Requests", value: openWelfare ?? 0,        icon: Heart,     color: "red"    as const },
    { title: "Published Articles",    value: publishedNews ?? 0,      icon: Newspaper, color: "purple" as const },
    { title: "Active Opportunities",  value: activeOpps ?? 0,         icon: Briefcase, color: "green"  as const },
  ];

  return (
    <div className="space-y-8">
      <div>
        <h2 className="font-display text-2xl font-bold text-navy-900">Dashboard Overview</h2>
        <p className="text-muted-foreground text-sm mt-1">
          Welcome back. Here&apos;s what&apos;s happening in GPSA-UDS.
        </p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-4">
        {stats.map((s) => (
          <StatsCard key={s.title} {...s} />
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Recent activity */}
        <div className="lg:col-span-2">
          <RecentActivity items={recentActivity ?? []} />
        </div>
        {/* Quick actions */}
        <div>
          <QuickActions />
        </div>
      </div>
    </div>
  );
}
