import { formatDateShort } from "@/lib/utils";
import { Bell, Users, CreditCard, Heart, Calendar, Briefcase, Newspaper } from "lucide-react";

const TYPE_ICONS: Record<string, React.ElementType> = {
  membership: CreditCard,
  payment:    CreditCard,
  welfare:    Heart,
  event:      Calendar,
  opportunity:Briefcase,
  news:       Newspaper,
  system:     Bell,
};

const TYPE_COLORS: Record<string, string> = {
  membership: "bg-blue-100 text-blue-700",
  payment:    "bg-green-100 text-green-700",
  welfare:    "bg-red-100 text-red-700",
  event:      "bg-purple-100 text-purple-700",
  opportunity:"bg-gold-100 text-gold-700",
  news:       "bg-gray-100 text-gray-600",
  system:     "bg-navy-100 text-navy-700",
};

interface Item {
  id: string;
  title: string;
  body: string;
  type: string;
  created_at: string;
}

export function RecentActivity({ items }: { items: Item[] }) {
  return (
    <div className="bg-white rounded-2xl border">
      <div className="px-6 py-4 border-b">
        <h3 className="font-display font-bold text-navy-900">Recent Activity</h3>
      </div>
      <div className="divide-y">
        {items.length === 0 ? (
          <div className="py-12 text-center text-sm text-muted-foreground">
            No recent activity
          </div>
        ) : (
          items.map((item) => {
            const Icon = TYPE_ICONS[item.type] ?? Bell;
            return (
              <div key={item.id} className="flex items-start gap-4 px-6 py-4">
                <div
                  className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                    TYPE_COLORS[item.type] ?? TYPE_COLORS.system
                  }`}
                >
                  <Icon className="w-4 h-4" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-navy-900">{item.title}</p>
                  <p className="text-xs text-muted-foreground mt-0.5 line-clamp-1">{item.body}</p>
                </div>
                <span className="text-xs text-muted-foreground flex-shrink-0">
                  {formatDateShort(item.created_at)}
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
