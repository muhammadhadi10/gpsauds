import { cn } from "@/lib/utils";

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: "navy" | "gold" | "green" | "red" | "gray";
}

export function Badge({ children, variant = "navy", className, ...props }: BadgeProps) {
  const variants = {
    navy: "bg-navy-100 text-navy-900 border-navy-200",
    gold: "bg-gold-100 text-gold-900 border-gold-200",
    green: "bg-emerald-100 text-emerald-800 border-emerald-200",
    red: "bg-red-100 text-red-800 border-red-200",
    gray: "bg-gray-100 text-gray-800 border-gray-200",
  };

  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        variants[variant],
        className
      )}
      {...props}
    >
      {children}
    </span>
  );
}
