import Link from "next/link";
import { UserPlus, Calendar, FileText, Briefcase, Settings, Heart } from "lucide-react";

const ACTIONS = [
  { label: "Add Committee Account", href: "/dashboard/admin/committees", icon: UserPlus,  color: "bg-navy-900 text-white" },
  { label: "Manage Events",         href: "/dashboard/admin/events",      icon: Calendar,  color: "bg-gold-500 text-white" },
  { label: "Review Memberships",    href: "/dashboard/admin/memberships", icon: FileText,  color: "bg-blue-600 text-white" },
  { label: "Opportunities",         href: "/dashboard/admin/opportunities",icon: Briefcase, color: "bg-purple-600 text-white" },
  { label: "Welfare Requests",      href: "/dashboard/admin/welfare",     icon: Heart,     color: "bg-red-600 text-white" },
  { label: "Site Settings",         href: "/dashboard/admin/settings",    icon: Settings,  color: "bg-gray-600 text-white" },
];

export function QuickActions() {
  return (
    <div className="bg-white rounded-2xl border">
      <div className="px-6 py-4 border-b">
        <h3 className="font-display font-bold text-navy-900">Quick Actions</h3>
      </div>
      <div className="p-4 grid grid-cols-2 gap-3">
        {ACTIONS.map(({ label, href, icon: Icon, color }) => (
          <Link
            key={href}
            href={href}
            className="flex flex-col items-center gap-2 p-3 rounded-xl border hover:border-navy-200 hover:shadow-sm transition-all text-center group"
          >
            <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${color}`}>
              <Icon className="w-4 h-4" />
            </div>
            <span className="text-xs font-medium text-navy-900 leading-tight">{label}</span>
          </Link>
        ))}
      </div>
    </div>
  );
}
