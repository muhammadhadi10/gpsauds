import { cn } from "@/lib/utils";

interface SectionHeaderProps {
  title: string;
  subtitle?: string;
  align?: "left" | "center";
  accentColor?: "gold" | "navy";
}

export function SectionHeader({
  title,
  subtitle,
  align = "left",
  accentColor = "gold",
}: SectionHeaderProps) {
  return (
    <div className={cn("mb-8", align === "center" && "text-center flex flex-col items-center")}>
      <h2 className="text-3xl md:text-4xl font-display font-bold text-navy-900 mb-4 relative inline-block">
        {title}
        <span
          className={cn(
            "absolute -bottom-2 left-0 h-1 w-1/3 rounded-full",
            align === "center" && "left-1/2 -translate-x-1/2 w-24",
            accentColor === "gold" ? "bg-gold-500" : "bg-navy-900"
          )}
        />
      </h2>
      {subtitle && <p className="text-muted-foreground mt-4 max-w-2xl">{subtitle}</p>}
    </div>
  );
}
