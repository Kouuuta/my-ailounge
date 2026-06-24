import { cn } from "@/lib/utils";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: React.ElementType;
  accentColor: string;
  gradient: string;
  secondary?: string;
  delay?: number;
}

export function StatCard({
  label,
  value,
  icon: Icon,
  accentColor,
  gradient,
  secondary,
  delay = 0,
}: StatCardProps) {
  return (
    <div
      className="group relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div
        className={cn(
          "absolute left-0 top-0 h-full w-[3px] transition-all duration-300 group-hover:w-[4px]",
          accentColor,
        )}
      />
      <div className="relative z-10 py-4 pl-5">
        <div className="flex items-center gap-3">
          <div
            className={cn(
              "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br shadow-sm transition-transform duration-300 group-hover:scale-110",
              gradient,
            )}
          >
            <Icon className="h-5 w-5 text-white" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-3xl font-bold tabular-nums tracking-tight text-foreground font-display">
              {value}
            </div>
            <div className="text-xs font-medium text-muted-foreground">
              {label}
            </div>
            {secondary && (
              <div className="mt-0.5 text-[11px] text-muted-foreground/70">
                {secondary}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
