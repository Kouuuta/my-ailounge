import { cn } from "@/lib/utils";

interface SeverityLegendProps {
  className?: string;
}

const ITEMS = [
  { color: "bg-red-500", label: "High (>5%)" },
  { color: "bg-amber-500", label: "Med (1-5%)" },
  { color: "bg-emerald-500", label: "Low (<1%)" },
];

export function SeverityLegend({ className }: SeverityLegendProps) {
  return (
    <div
      className={cn(
        "flex items-center gap-3 text-[10px] text-muted-foreground",
        className,
      )}
    >
      {ITEMS.map((item) => (
        <span key={item.label} className="flex items-center gap-1.5">
          <span
            className={`inline-block h-2 w-2 rounded-full ${item.color}`}
          />
          {item.label}
        </span>
      ))}
    </div>
  );
}
