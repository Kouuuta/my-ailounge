import { cn } from "@/lib/utils";
import { Sparkles, BookOpen, ExternalLink } from "lucide-react";
import Link from "next/link";

interface FeedItem {
  id: number;
  title: string;
  url: string;
  summary: string | null;
  tags: string | null;
}

interface InternTaskData {
  title: string;
  description: string;
  difficulty: "beginner" | "intermediate" | "advanced";
}

interface InternTasksProps {
  recommendedItem: FeedItem | null;
  todayTask: InternTaskData;
  tomorrowTask: InternTaskData;
  delay?: number;
}

const DIFFICULTY_COLORS = {
  beginner: "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400",
  intermediate: "bg-yellow-500/10 text-yellow-600 dark:text-yellow-400",
  advanced: "bg-red-500/10 text-red-600 dark:text-red-400",
};

export function InternTasks({
  recommendedItem,
  todayTask,
  tomorrowTask,
  delay = 0,
}: InternTasksProps) {
  return (
    <div
      className="animate-slide-up rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl transition-all duration-300 hover:shadow-lg"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="border-b border-border/50 px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-yellow-500/20">
            <Sparkles className="h-3.5 w-3.5 text-yellow-600 dark:text-yellow-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground font-display tracking-wide">
            Recommended Tool
          </h3>
        </div>
        {recommendedItem ? (
          <Link
            href={recommendedItem.url}
            target="_blank"
            rel="noopener noreferrer"
            className="group block rounded-xl bg-accent/50 border border-border/50 px-3 py-2.5 transition-all duration-200 hover:bg-accent"
          >
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-sm font-medium text-foreground group-hover:text-accent-vibrant transition-colors">
                  {recommendedItem.title}
                </p>
                <p className="text-xs text-muted-foreground mt-0.5">
                  {recommendedItem.summary || recommendedItem.tags || "No description"}
                </p>
              </div>
              <ExternalLink className="h-4 w-4 text-muted-foreground shrink-0 mt-0.5 group-hover:text-accent-vibrant transition-colors" />
            </div>
          </Link>
        ) : (
          <p className="text-sm text-muted-foreground py-2">
            No recommendations yet. Tag items with{" "}
            <code className="text-xs bg-muted px-1 rounded">ai</code> or{" "}
            <code className="text-xs bg-muted px-1 rounded">tool</code>.
          </p>
        )}
      </div>

      <div className="px-4 pt-3 pb-4">
        <div className="flex items-center gap-2 mb-3">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-blue-500/20">
            <BookOpen className="h-3.5 w-3.5 text-blue-600 dark:text-blue-400" />
          </div>
          <h3 className="text-sm font-semibold text-foreground font-display tracking-wide">
            Intern Tasks
          </h3>
        </div>

        <div className="rounded-xl bg-accent/50 border border-border/50 px-3 py-2.5 mb-2">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground font-mono uppercase tracking-wider">Today</span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium font-mono",
                DIFFICULTY_COLORS[todayTask.difficulty],
              )}
            >
              {todayTask.difficulty}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground">{todayTask.title}</p>
          <p className="text-xs text-muted-foreground mt-0.5">{todayTask.description}</p>
        </div>

        <div className="rounded-xl bg-card/30 border border-border/30 px-3 py-2.5">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[10px] text-muted-foreground/70 font-mono uppercase tracking-wider">Tomorrow</span>
            <span
              className={cn(
                "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium font-mono",
                DIFFICULTY_COLORS[tomorrowTask.difficulty],
              )}
            >
              {tomorrowTask.difficulty}
            </span>
          </div>
          <p className="text-sm font-medium text-foreground/80">{tomorrowTask.title}</p>
          <p className="text-xs text-muted-foreground/70 mt-0.5">{tomorrowTask.description}</p>
        </div>
      </div>
    </div>
  );
}
