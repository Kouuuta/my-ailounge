import Link from "next/link";
import { cn } from "@/lib/utils";
import { ExternalLink, Pin } from "lucide-react";

interface FeedItem {
  id: number;
  source: string;
  category: string;
  title: string;
  url: string;
  summary: string | null;
  tags: string | null;
  score: number | null;
  published_at: string | null;
  fetched_at: string;
}

const SOURCE_BADGE: Record<string, string> = {
  hn: "text-orange-600 dark:text-orange-400 bg-orange-500/10",
  rss: "text-blue-600 dark:text-blue-400 bg-blue-500/10",
  github_trending: "text-purple-600 dark:text-purple-400 bg-purple-500/10",
};

interface FeaturedNewsProps {
  items: FeedItem[];
  delay?: number;
}

export function FeaturedNews({ items, delay = 0 }: FeaturedNewsProps) {
  if (items.length === 0) return null;

  const top = items[0];
  const rest = items.slice(1, 4);

  return (
    <div
      className="animate-slide-up"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center gap-2 mb-3">
        <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-orange-500/20">
          <Pin className="h-3.5 w-3.5 text-orange-600 dark:text-orange-400" />
        </div>
        <h3 className="text-sm font-semibold text-foreground font-display tracking-wide">
          Featured
        </h3>
      </div>

      <Link
        href={top.url}
        target="_blank"
        rel="noopener noreferrer"
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl",
          "transition-all duration-300 hover:shadow-lg",
          "mb-3",
        )}
      >
        <div className="p-4">
          <div className="flex items-center gap-2 mb-2">
            <span
              className={cn(
                "inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium",
                SOURCE_BADGE[top.source] ?? SOURCE_BADGE.rss,
              )}
            >
              {top.source.replace("_", " ")}
            </span>
            {top.published_at && (
              <span className="text-[10px] text-muted-foreground/70">
                {new Date(top.published_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
          <h4 className="text-lg font-semibold text-foreground font-display leading-tight group-hover:text-accent-vibrant transition-colors">
            {top.title}
          </h4>
          {top.summary && (
            <p className="text-sm text-muted-foreground mt-1.5 line-clamp-2">
              {top.summary}
            </p>
          )}
          <span className="inline-flex items-center gap-1 text-xs text-accent-vibrant mt-3 md:opacity-0 md:group-hover:opacity-100 transition-opacity">
            Read more <ExternalLink className="h-3 w-3" />
          </span>
        </div>
      </Link>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {rest.map((item) => (
          <Link
            key={item.id}
            href={item.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              "group relative flex flex-col overflow-hidden rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl",
              "transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg",
            )}
          >
            <div className="p-3">
              <div className="flex items-center gap-2 mb-1.5">
                <span
                  className={cn(
                    "inline-flex items-center rounded-full px-1.5 py-0.5 text-[9px] font-medium",
                    SOURCE_BADGE[item.source] ?? SOURCE_BADGE.rss,
                  )}
                >
                  {item.source.replace("_", " ")}
                </span>
              </div>
              <p className="text-sm font-medium text-foreground/90 leading-snug line-clamp-2 group-hover:text-foreground transition-colors">
                {item.title}
              </p>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}
