import { getDb } from "@/src/db/client";
import { getItemsBySource, getItemsByCategory, getItemsToday, getItemsThisWeek, getLastGlobalIngestion } from "@/src/lib/analytics";
import { INTERN_TASKS } from "@/src/config/intern-tasks";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Brain,
  Code,
  TrendingUp,
  Shield,
  Wrench,
  BookOpen,
  ExternalLink,
  ChevronRight,
  Sparkles,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { IngestButton } from "@/components/engineering-intelligence/ingest-button";
import { StatCard } from "@/components/engineering-intelligence/stat-card";
import { BreakdownCard } from "@/components/engineering-intelligence/breakdown-card";
import type { BreakdownItem } from "@/components/engineering-intelligence/breakdown-card";
import { AutomationStatus } from "@/components/engineering-intelligence/automation-status";

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

function formatDate(dateStr: string | null): string {
  if (!dateStr) return "N/A";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "N/A";
  return d.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
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

const SOURCE_BADGE: Record<string, string> = {
  hn: "bg-orange-100 text-orange-700 dark:bg-orange-900/60 dark:text-orange-300",
  rss: "bg-blue-100 text-blue-700 dark:bg-blue-900/60 dark:text-blue-300",
  github_trending:
    "bg-purple-100 text-purple-700 dark:bg-purple-900/60 dark:text-purple-300",
};

const SOURCE_ACCENT: Record<string, string> = {
  hn: "bg-orange-500",
  rss: "bg-blue-500",
  github_trending: "bg-purple-500",
};

const SECTION_THEME = {
  ai: {
    border: "border-t-teal-500",
    iconBg: "bg-teal-500/10 dark:bg-teal-500/15",
    iconColor: "text-teal-600 dark:text-teal-400",
    badgeBg: "bg-teal-500/10 text-teal-600 dark:bg-teal-500/15 dark:text-teal-400",
    buttonText: "text-teal-600 hover:text-teal-700 dark:text-teal-400 dark:hover:text-teal-300",
  },
  trending: {
    border: "border-t-purple-500",
    iconBg: "bg-purple-500/10 dark:bg-purple-500/15",
    iconColor: "text-purple-600 dark:text-purple-400",
    badgeBg: "bg-purple-500/10 text-purple-600 dark:bg-purple-500/15 dark:text-purple-400",
    buttonText: "text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300",
  },
  framework: {
    border: "border-t-blue-500",
    iconBg: "bg-blue-500/10 dark:bg-blue-500/15",
    iconColor: "text-blue-600 dark:text-blue-400",
    badgeBg: "bg-blue-500/10 text-blue-600 dark:bg-blue-500/15 dark:text-blue-400",
    buttonText: "text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300",
  },
  security: {
    border: "border-t-red-500",
    iconBg: "bg-red-500/10 dark:bg-red-500/15",
    iconColor: "text-red-600 dark:text-red-400",
    badgeBg: "bg-red-500/10 text-red-600 dark:bg-red-500/15 dark:text-red-400",
    buttonText: "text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300",
  },
};

function ItemCard({ item, delay }: { item: FeedItem; delay: number }) {
  const source = item.source;
  const accentColor = SOURCE_ACCENT[source] ?? "bg-blue-500";
  const badgeColor = SOURCE_BADGE[source] ?? SOURCE_BADGE.rss;

  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="relative flex items-stretch rounded-lg border bg-card text-card-foreground shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md overflow-hidden">
        <div className={`w-[3px] shrink-0 transition-all duration-200 group-hover:w-[5px] ${accentColor}`} />
        <div className="flex min-w-0 flex-1 items-start justify-between gap-2 p-2.5 pl-3">
          <div className="min-w-0 flex-1">
            <p className="text-sm font-medium leading-snug group-hover:text-accent-vibrant transition-colors line-clamp-2">
              {item.title}
            </p>
            <div className="flex flex-wrap items-center gap-1.5 mt-1.5">
              <span className={`inline-flex items-center rounded-full px-2 py-0.5 text-[10px] font-medium ${badgeColor}`}>
                {source.replace("_", " ")}
              </span>
              {item.tags && (
                <span className="text-[10px] text-muted-foreground truncate max-w-[180px]">
                  {item.tags
                    .split(",")
                    .slice(0, 2)
                    .map((t) => t.trim())
                    .join(", ")}
                </span>
              )}
              <span className="text-[10px] text-muted-foreground ml-auto shrink-0">
                {formatDate(item.published_at)}
              </span>
            </div>
          </div>
          <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all mt-1 group-hover:translate-x-0.5" />
        </div>
      </div>
    </a>
  );
}

function SectionCard({
  title,
  icon: Icon,
  items,
  viewAllHref,
  delay,
  theme,
}: {
  title: string;
  icon: React.ElementType;
  items: FeedItem[];
  viewAllHref?: string;
  delay: number;
  theme: keyof typeof SECTION_THEME;
}) {
  const t = SECTION_THEME[theme];

  return (
    <Card
      className={`animate-slide-up transition-all duration-300 hover:shadow-md border-t-2 ${t.border}`}
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className={`flex h-8 w-8 items-center justify-center rounded-lg ${t.iconBg}`}>
              <Icon className={`h-4 w-4 ${t.iconColor}`} />
            </div>
            <CardTitle className="text-base tracking-tight">{title}</CardTitle>
            <span className={`inline-flex items-center justify-center rounded-full text-[10px] font-semibold h-5 min-w-5 px-1.5 ${t.badgeBg}`}>
              {items.length}
            </span>
          </div>
          {viewAllHref && (
            <Button
              variant="ghost"
              size="sm"
              asChild
              className={`hidden md:inline-flex h-7 ${t.buttonText}`}
            >
              <Link href={viewAllHref}>
                View all
                <ChevronRight className="h-3.5 w-3.5 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-0.5 pt-1">
        {items.length === 0 ? (
          <div className="flex flex-col items-center gap-1 py-8 text-muted-foreground">
            <Icon className="h-8 w-8 opacity-20" />
            <p className="text-sm">No items yet</p>
            <p className="text-xs">
              Run{" "}
              <code className="text-xs bg-muted px-1 rounded">
                npm run ingest
              </code>
            </p>
          </div>
        ) : (
          items.map((item, i) => (
            <ItemCard key={item.id} item={item} delay={i * 60 + delay + 200} />
          ))
        )}
      </CardContent>
    </Card>
  );
}

export const dynamic = "force-dynamic";

export default function HomePage() {
  const db = getDb();

  const toItems = (rows: unknown): FeedItem[] => rows as FeedItem[];

  const aiItems = toItems(
    db
      .prepare(
        "SELECT * FROM feed_items WHERE category = 'ai' AND source != 'manual' ORDER BY score DESC, published_at DESC LIMIT 5",
      )
      .all(),
  );

  const frameworkItems = toItems(
    db
      .prepare(
        "SELECT * FROM feed_items WHERE category IN ('nextjs', 'django') AND source != 'manual' ORDER BY published_at DESC, fetched_at DESC LIMIT 5",
      )
      .all(),
  );

  const trendingItems = toItems(
    db
      .prepare(
        "SELECT * FROM feed_items WHERE source = 'github_trending' ORDER BY fetched_at DESC LIMIT 5",
      )
      .all(),
  );

  const securityItems = toItems(
    db
      .prepare(
        "SELECT * FROM feed_items WHERE (category = 'security' OR tags LIKE '%cve%') AND source != 'manual' ORDER BY published_at DESC, fetched_at DESC LIMIT 5",
      )
      .all(),
  );

  const recommendedItem = toItems(
    db
      .prepare(
        "SELECT * FROM feed_items WHERE is_read = 0 AND source != 'manual' AND (tags LIKE '%ai%' OR tags LIKE '%tool%') ORDER BY score DESC, fetched_at DESC LIMIT 1",
      )
      .all(),
  );

  const totalItems = (
    db
      .prepare(
        "SELECT COUNT(*) as count FROM feed_items WHERE source != 'manual'",
      )
      .get() as {
      count: number;
    }
  ).count;

  const unreadItems = (
    db
      .prepare(
        "SELECT COUNT(*) as count FROM feed_items WHERE is_read = 0 AND source != 'manual'",
      )
      .get() as { count: number }
  ).count;

  const taskIndex = Math.floor(Date.now() / 86400000);
  const todayTask = INTERN_TASKS[taskIndex % INTERN_TASKS.length];
  const tomorrowTask = INTERN_TASKS[(taskIndex + 1) % INTERN_TASKS.length];

  const itemsToday = getItemsToday();
  const itemsThisWeek = getItemsThisWeek();
  const lastIngestion = getLastGlobalIngestion();

  const sources: BreakdownItem[] = getItemsBySource().map((s) => ({
    name: s.source,
    count: s.count,
  }));
  const categories: BreakdownItem[] = getItemsByCategory().map((c) => ({
    name: c.category,
    count: c.count,
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        <div className="animate-fade-in flex items-center justify-between gap-3 flex-wrap mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight">
                Engineering Briefing
              </h1>
              <Sparkles className="h-5 w-5 text-accent-vibrant" />
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {totalItems} items ingested &middot; {unreadItems} unread
            </p>
          </div>
          <div className="flex gap-2">
            <IngestButton />
            <Button asChild>
              <Link href="/feed">
                <BookOpen className="h-4 w-4" />
                Full Feed
              </Link>
            </Button>
          </div>
        </div>

        <div className="animate-fade-in grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          <StatCard
            label="Total Items"
            value={totalItems}
            icon={BookOpen}
            accentColor="bg-emerald-500"
            gradient="from-emerald-500 to-teal-500"
            secondary={`${unreadItems} unread`}
            delay={0}
          />
          <StatCard
            label="Last Ingestion"
            value={lastIngestion ? timeAgo(lastIngestion) : "Never"}
            icon={Sparkles}
            accentColor="bg-slate-500"
            gradient="from-slate-500 to-gray-500"
            delay={100}
          />
          <StatCard
            label="Items Today"
            value={itemsToday}
            icon={TrendingUp}
            accentColor="bg-amber-500"
            gradient="from-amber-500 to-orange-500"
            delay={200}
          />
          <StatCard
            label="Items This Week"
            value={itemsThisWeek}
            icon={Clock}
            accentColor="bg-indigo-500"
            gradient="from-blue-500 to-indigo-500"
            delay={300}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <SectionCard
            title="AI Changes"
            icon={Brain}
            items={aiItems}
            viewAllHref="/feed?category=ai"
            delay={0}
            theme="ai"
          />
          <SectionCard
            title="Trending Repos"
            icon={TrendingUp}
            items={trendingItems}
            viewAllHref="/feed?source=github_trending"
            delay={100}
            theme="trending"
          />
          <SectionCard
            title="Framework Updates"
            icon={Code}
            items={frameworkItems}
            viewAllHref="/feed?category=nextjs"
            delay={200}
            theme="framework"
          />
          <SectionCard
            title="Security"
            icon={Shield}
            items={securityItems}
            viewAllHref="/feed?category=security"
            delay={300}
            theme="security"
          />
        </div>

        <Separator className="my-8" />

        <div className="hidden md:block animate-fade-in mb-8">
          <BreakdownCard
            sources={sources}
            categories={categories}
            total={totalItems}
          />
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <Card
            className="animate-slide-up transition-all duration-300 hover:shadow-md"
            style={{ animationDelay: "500ms" }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-vibrant/10">
                  <Wrench className="h-4 w-4 text-accent-vibrant" />
                </div>
                <CardTitle className="text-lg">Recommended Tool</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              {recommendedItem[0] ? (
                <a
                  href={recommendedItem[0].url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="block w-full min-w-0 group"
                >
                  <p className="text-sm font-medium group-hover:text-accent-vibrant transition-colors">
                    {recommendedItem[0].title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {recommendedItem[0].summary ||
                      recommendedItem[0].tags ||
                      "No description"}
                  </p>
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recommendations yet. Add items tagged with{" "}
                  <code className="text-xs bg-muted px-1 rounded">ai</code> or{" "}
                  <code className="text-xs bg-muted px-1 rounded">tool</code>.
                </p>
              )}
            </CardContent>
          </Card>
          <Card
            className="animate-slide-up transition-all duration-300 hover:shadow-md"
            style={{ animationDelay: "600ms" }}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-vibrant/10">
                  <BookOpen className="h-4 w-4 text-accent-vibrant" />
                </div>
                <CardTitle className="text-lg">Intern Tasks</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{todayTask.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {todayTask.description}
              </p>
              <Badge
                variant={
                  todayTask.difficulty === "beginner"
                    ? "secondary"
                    : todayTask.difficulty === "intermediate"
                      ? "default"
                      : "destructive"
                }
                className="mt-2 text-[10px]"
              >
                {todayTask.difficulty}
              </Badge>
              <Separator className="my-3" />
              <p className="text-sm font-medium">{tomorrowTask.title}</p>
              <p className="text-xs text-muted-foreground mt-1">
                {tomorrowTask.description}
              </p>
              <Badge
                variant={
                  tomorrowTask.difficulty === "beginner"
                    ? "secondary"
                    : tomorrowTask.difficulty === "intermediate"
                      ? "default"
                      : "destructive"
                }
                className="mt-2 text-[10px]"
              >
                {tomorrowTask.difficulty}
              </Badge>
            </CardContent>
          </Card>
        </div>

        <div className="animate-fade-in mt-8">
          <AutomationStatus />
        </div>
      </div>
    </div>
  );
}
