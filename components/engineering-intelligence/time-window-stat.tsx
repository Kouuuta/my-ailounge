import { getItemsToday, getItemsThisWeek } from "@/src/lib/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";

interface TimeWindowStatProps {
  window: "today" | "week";
  delay?: number;
}

const WINDOW_CONFIG = {
  today: {
    label: "Items Today",
    icon: Clock,
    gradient: "from-amber-500 to-orange-500",
  },
  week: {
    label: "Items This Week",
    icon: Calendar,
    gradient: "from-blue-500 to-indigo-500",
  },
} as const;

export function TimeWindowStat({ window, delay = 0 }: TimeWindowStatProps) {
  const value =
    window === "today" ? getItemsToday() : getItemsThisWeek();
  const config = WINDOW_CONFIG[window];
  const Icon = config.icon;

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-vibrant/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <CardContent className="relative z-10 py-4">
        <div className="flex items-center gap-3">
          <div
            className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${config.gradient} shadow-sm`}
          >
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">{config.label}</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {value}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
