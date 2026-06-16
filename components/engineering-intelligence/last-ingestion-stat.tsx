import { getLastGlobalIngestion } from "@/src/lib/analytics";
import { Card, CardContent } from "@/components/ui/card";
import { RotateCcw } from "lucide-react";

interface LastIngestionStatProps {
  delay?: number;
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
}

export function LastIngestionStat({ delay = 0 }: LastIngestionStatProps) {
  const lastRun = getLastGlobalIngestion();

  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-vibrant/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <CardContent className="relative z-10 py-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-slate-500 to-gray-500 shadow-sm">
            <RotateCcw className="h-4 w-4 text-white" />
          </div>
          <div className="min-w-0">
            <p className="text-xs text-muted-foreground">Last Ingestion</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">
              {lastRun ? timeAgo(lastRun) : "Never"}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
