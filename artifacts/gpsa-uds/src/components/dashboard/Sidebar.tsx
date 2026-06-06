"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import type { Profile } from "@/types";
import {
  LayoutDashboard, Users, CreditCard, Calendar, Newspaper,
  Briefcase, Heart, BookOpen, UserCog, Settings, Bell,
  ChevronLeft, Menu, LogOut,
} from "lucide-react";

const NAV = [
  { label: "Overview",           href: "/dashboard/admin",               icon: LayoutDashboard },
  { label: "Members",            href: "/dashboard/admin/members",        icon: Users },
  { label: "Memberships & Dues", href: "/dashboard/admin/memberships",    icon: CreditCard },
  { label: "Events",             href: "/dashboard/admin/events",         icon: Calendar },
  { label: "News",               href: "/dashboard/admin/news",           icon: Newspaper },
  { label: "Opportunities",      href: "/dashboard/admin/opportunities",   icon: Briefcase },
  { label: "Welfare Requests",   href: "/dashboard/admin/welfare",        icon: Heart },
  { label: "Academic Resources", href: "/dashboard/admin/resources",      icon: BookOpen },
  { label: "Committee Accounts", href: "/dashboard/admin/committees",     icon: UserCog },
  { label: "Site Settings",      href: "/dashboard/admin/settings",       icon: Settings },
  { label: "Notifications",      href: "/dashboard/admin/notifications",  icon: Bell },
];

export function DashboardSidebar({ user }: { user: Profile }) {
  const pathname = usePathname();
  const [collapsed, setCollapsed] = useState(false);

  return (
    <aside
      className={`bg-navy-900 flex flex-col transition-all duration-200 ease-in-out flex-shrink-0 ${
        collapsed ? "w-16" : "w-64"
      }`}
    >
      {/* Logo */}
      <div className="flex items-center justify-between px-4 py-5 border-b border-white/10">
        {!collapsed && (
          <Link href="/" className="font-display font-bold text-xl text-white tracking-tight">
            GPSA-UDS
          </Link>
        )}
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/60 hover:text-white hover:bg-white/10 transition-colors ml-auto"
          aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
        >
          {collapsed ? <Menu className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Role badge */}
      {!collapsed && (
        <div className="px-4 pt-4 pb-2">
          <div className="px-3 py-1.5 bg-gold-500/20 rounded-lg">
            <p className="text-gold-400 text-xs font-medium truncate">{user.full_name}</p>
            <p className="text-white/40 text-xs capitalize">{user.role.replace("_", " ")}</p>
          </div>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto py-3 px-2">
        {NAV.map(({ label, href, icon: Icon }) => {
          const active =
            href === "/dashboard/admin"
              ? pathname === href
              : pathname.startsWith(href);
          return (
            <Link
              key={href}
              href={href}
              title={collapsed ? label : undefined}
              className={`flex items-center gap-3 px-3 py-2.5 rounded-lg mb-0.5 text-sm font-medium transition-colors ${
                active
                  ? "bg-gold-500 text-white"
                  : "text-white/70 hover:bg-white/10 hover:text-white"
              }`}
            >
              <Icon className="w-4 h-4 flex-shrink-0" />
              {!collapsed && <span className="truncate">{label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="px-2 pb-4 border-t border-white/10 pt-3">
        <form action="/api/auth/logout" method="POST">
          <button
            type="submit"
            title={collapsed ? "Sign Out" : undefined}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          >
            <LogOut className="w-4 h-4 flex-shrink-0" />
            {!collapsed && <span>Sign Out</span>}
          </button>
        </form>
      </div>
    </aside>
  );
}
