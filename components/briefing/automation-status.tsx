import { cn } from "@/lib/utils";
import { getIngestionStatus, getGlobalIngestionStatus } from "@/src/lib/analytics";
import { Activity } from "lucide-react";

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export async function AutomationStatus() {
  const statuses = await getIngestionStatus();
  const globalStatus = await getGlobalIngestionStatus();
  const errors = statuses.filter((s) => s.status === "error").length;

  return (
    <div className="animate-slide-up rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:shadow-lg">
      <div className="px-4 pt-4 pb-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-teal-500/20">
              <Activity className="h-3.5 w-3.5 text-teal-600 dark:text-teal-400" />
            </div>
            <h3 className="text-sm font-semibold text-foreground font-display tracking-wide">
              Automation Status
            </h3>
          </div>
          {globalStatus && (
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium font-mono",
                errors > 0
                  ? "bg-red-500/10 text-red-600 dark:text-red-400"
                  : "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
              )}
            >
              {errors > 0 ? `${errors} error${errors > 1 ? "s" : ""}` : "Healthy"}
            </span>
          )}
        </div>
      </div>
      <div className="px-4 pb-4">
        {statuses.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center font-mono">
            No data. Run{" "}
            <code className="text-xs bg-muted px-1 rounded">npm run ingest</code>
          </p>
        ) : (
          <div className="space-y-1.5">
            {statuses.map((s) => (
              <div
                key={s.source}
                className="flex items-center justify-between rounded-xl bg-accent/50 border border-border/50 px-3 py-2 transition-all duration-200 hover:bg-accent"
              >
                <div className="flex items-center gap-2.5 min-w-0">
                  <span className="relative flex h-2 w-2 shrink-0">
                    <span
                      className={cn(
                        "absolute inline-flex h-full w-full rounded-full opacity-75",
                        s.status === "ok"
                          ? "bg-emerald-400 animate-ping"
                          : s.status === "error"
                            ? "bg-red-400"
                            : "bg-muted-foreground/30",
                      )}
                    />
                    <span
                      className={cn(
                        "relative inline-flex h-2 w-2 rounded-full",
                        s.status === "ok"
                          ? "bg-emerald-400"
                          : s.status === "error"
                            ? "bg-red-400"
                            : "bg-muted-foreground/30",
                      )}
                    />
                  </span>
                  <span className="text-sm text-foreground/90 truncate">
                    {s.source.replace("_", " ")}
                  </span>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground shrink-0 font-mono">
                  {s.lastRun && <span>{timeAgo(s.lastRun)}</span>}
                  <span
                    className={cn(
                      s.status === "ok" && "text-emerald-600 dark:text-emerald-400",
                      s.status === "error" && "text-red-600 dark:text-red-400",
                    )}
                  >
                    +{s.count}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
