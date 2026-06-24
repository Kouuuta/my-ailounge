import Link from "next/link";
import { cn } from "@/lib/utils";
import { ChevronRight } from "lucide-react";

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
  is_pinned: number;
  is_read: number;
}

const SECTION_ACCENT = {
  ai: { border: "border-l-teal-500", icon: "bg-teal-500/20", text: "text-teal-600 dark:text-teal-400", iconColor: "text-teal-600 dark:text-teal-400" },
  trending: { border: "border-l-purple-500", icon: "bg-purple-500/20", text: "text-purple-600 dark:text-purple-400", iconColor: "text-purple-600 dark:text-purple-400" },
  framework: { border: "border-l-blue-500", icon: "bg-blue-500/20", text: "text-blue-600 dark:text-blue-400", iconColor: "text-blue-600 dark:text-blue-400" },
  security: { border: "border-l-red-500", icon: "bg-red-500/20", text: "text-red-600 dark:text-red-400", iconColor: "text-red-600 dark:text-red-400" },
};

interface FeedSectionProps {
  title: string;
  icon: React.ElementType;
  items: FeedItem[];
  viewAllHref?: string;
  delay?: number;
  theme: keyof typeof SECTION_ACCENT;
}

export function FeedSection({
  title,
  icon: Icon,
  items,
  viewAllHref,
  delay = 0,
  theme,
}: FeedSectionProps) {
  const accent = SECTION_ACCENT[theme];

  return (
    <div
      className={cn(
        "animate-slide-up rounded-2xl border border-border/50 bg-card/50 backdrop-blur-xl overflow-hidden transition-all duration-300 hover:shadow-lg",
        "border-l-[3px]",
        accent.border,
      )}
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-2">
          <div
            className={cn(
              "flex h-7 w-7 items-center justify-center rounded-lg",
              accent.icon,
            )}
          >
            <Icon className={cn("h-3.5 w-3.5", accent.iconColor)} />
          </div>
          <h3 className="text-sm font-semibold text-foreground font-display tracking-wide">{title}</h3>
          <span className="inline-flex items-center justify-center rounded-full bg-muted text-[10px] font-semibold h-5 min-w-5 px-1.5 text-muted-foreground font-mono">
            {items.length}
          </span>
        </div>
        {viewAllHref && (
          <Link
            href={viewAllHref}
            className={cn(
              "flex items-center gap-1 text-xs font-medium transition-colors",
              accent.text,
            )}
          >
            View all
            <ChevronRight className="h-3 w-3" />
          </Link>
        )}
      </div>

      <div className="px-2 pb-2">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8 text-muted-foreground">
            <Icon className="h-8 w-8 opacity-20" />
            <p className="text-sm">No items yet</p>
            <p className="text-xs">
              Run{" "}
              <code className="text-xs bg-muted px-1 rounded">npm run ingest</code>
            </p>
          </div>
        ) : (
          items.map((item, i) => (
            <FeedItemCard key={item.id} item={item} index={i} baseDelay={delay} />
          ))
        )}
      </div>
    </div>
  );
}

function FeedItemCard({
  item,
  index,
  baseDelay,
}: {
  item: FeedItem;
  index: number;
  baseDelay: number;
}) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="group block"
      style={{ animationDelay: `${index * 60 + baseDelay + 200}ms` }}
    >
      <div
        className={cn(
          "relative flex items-start gap-3 rounded-xl border border-transparent px-3 py-2.5 transition-all duration-200",
          "hover:bg-accent/30 hover:border-border/50",
        )}
      >
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium leading-snug text-foreground/90 group-hover:text-foreground transition-colors line-clamp-2">
            {item.title}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <span className="text-[10px] text-muted-foreground font-mono">
              {item.source.replace("_", " ")}
            </span>
            {item.published_at && (
              <span className="text-[10px] text-muted-foreground/70">
                {new Date(item.published_at).toLocaleDateString("en-US", {
                  month: "short",
                  day: "numeric",
                })}
              </span>
            )}
          </div>
        </div>
      </div>
    </a>
  );
}
