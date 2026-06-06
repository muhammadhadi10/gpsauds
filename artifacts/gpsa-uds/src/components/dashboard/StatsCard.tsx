import type { LucideIcon } from "lucide-react";

interface StatsCardProps {
  title: string;
  value: number | string;
  icon: LucideIcon;
  trend?: { value: number; label: string };
  color?: "navy" | "gold" | "green" | "red" | "purple" | "blue";
  href?: string;
}

const COLOR_MAP = {
  navy:   { bg: "bg-navy-50",   icon: "bg-navy-900 text-white",  value: "text-navy-900" },
  gold:   { bg: "bg-gold-50",   icon: "bg-gold-500 text-white",  value: "text-gold-700" },
  green:  { bg: "bg-green-50",  icon: "bg-green-600 text-white", value: "text-green-700" },
  red:    { bg: "bg-red-50",    icon: "bg-red-600 text-white",   value: "text-red-700" },
  purple: { bg: "bg-purple-50", icon: "bg-purple-600 text-white",value: "text-purple-700" },
  blue:   { bg: "bg-blue-50",   icon: "bg-blue-600 text-white",  value: "text-blue-700" },
};

export function StatsCard({ title, value, icon: Icon, trend, color = "navy" }: StatsCardProps) {
  const c = COLOR_MAP[color];
  return (
    <div className={`rounded-2xl border p-5 ${c.bg} hover:shadow-md transition-shadow`}>
      <div className="flex items-start justify-between mb-4">
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${c.icon}`}>
          <Icon className="w-4 h-4" />
        </div>
      </div>
      <p className={`font-display text-3xl font-bold ${c.value}`}>{value}</p>
      {trend && (
        <p className="text-xs text-muted-foreground mt-1">
          <span className={trend.value >= 0 ? "text-green-600" : "text-red-600"}>
            {trend.value >= 0 ? "+" : ""}{trend.value}
          </span>{" "}
          {trend.label}
        </p>
      )}
    </div>
  );
}
