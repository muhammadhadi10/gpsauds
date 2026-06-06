"use client";

import { useState, useEffect, useRef } from "react";
import { Bell } from "lucide-react";
import { createClient } from "@/lib/supabase/client";
import { formatDateShort } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  body: string;
  type: string;
  is_read: boolean;
  created_at: string;
  action_url: string | null;
}

export function NotificationBell({
  unreadCount: initialCount,
  userId,
}: {
  unreadCount: number;
  userId: string;
}) {
  const [open, setOpen] = useState(false);
  const [unread, setUnread] = useState(initialCount);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClick = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  const loadNotifications = async () => {
    const supabase = createClient();
    const { data } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false })
      .limit(20);
    setNotifications((data ?? []) as Notification[]);
  };

  const markAllRead = async () => {
    const supabase = createClient();
    await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", userId)
      .eq("is_read", false);
    setUnread(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, is_read: true })));
  };

  const handleOpen = () => {
    if (!open) loadNotifications();
    setOpen(!open);
  };

  const TYPE_COLORS: Record<string, string> = {
    membership: "bg-blue-100 text-blue-700",
    payment:    "bg-green-100 text-green-700",
    welfare:    "bg-red-100 text-red-700",
    event:      "bg-purple-100 text-purple-700",
    system:     "bg-gray-100 text-gray-700",
  };

  return (
    <div ref={ref} className="relative">
      <button
        onClick={handleOpen}
        className="relative w-9 h-9 rounded-lg flex items-center justify-center text-gray-500 hover:bg-gray-100 hover:text-navy-900 transition-colors"
        aria-label="Notifications"
      >
        <Bell className="w-5 h-5" />
        {unread > 0 && (
          <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
            {unread > 9 ? "9+" : unread}
          </span>
        )}
      </button>

      {open && (
        <div className="absolute right-0 top-11 w-80 bg-white rounded-xl border shadow-xl z-50 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-3 border-b">
            <h3 className="font-display font-bold text-navy-900 text-sm">Notifications</h3>
            {unread > 0 && (
              <button
                onClick={markAllRead}
                className="text-xs text-gold-600 hover:text-gold-700 font-medium"
              >
                Mark all read
              </button>
            )}
          </div>

          <div className="max-h-80 overflow-y-auto divide-y">
            {notifications.length === 0 ? (
              <div className="py-10 text-center text-sm text-muted-foreground">
                No notifications yet
              </div>
            ) : (
              notifications.map((n) => (
                <div
                  key={n.id}
                  className={`px-4 py-3 ${n.is_read ? "bg-white" : "bg-blue-50"}`}
                >
                  <div className="flex items-start gap-3">
                    <span
                      className={`text-[10px] font-medium px-1.5 py-0.5 rounded uppercase tracking-wide flex-shrink-0 mt-0.5 ${
                        TYPE_COLORS[n.type] ?? TYPE_COLORS.system
                      }`}
                    >
                      {n.type}
                    </span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-navy-900 leading-tight">{n.title}</p>
                      <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>
                      {n.action_url && (
                        <a href={n.action_url} className="text-xs text-gold-600 mt-1 inline-block hover:underline">
                          View →
                        </a>
                      )}
                      <p className="text-[10px] text-muted-foreground mt-1">
                        {formatDateShort(n.created_at)}
                      </p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
}
