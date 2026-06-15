import { getDb } from "@/src/db/client";
import { INTERN_TASKS } from "@/src/config/intern-tasks";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
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
} from "lucide-react";
import Link from "next/link";

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

function timeAgo(dateStr: string): string {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

const STAT_ICONS = [
  { icon: Brain, label: "AI Updates", gradient: "from-sky-500 to-cyan-500" },
  { icon: Code, label: "Framework Updates", gradient: "from-violet-500 to-purple-500" },
  { icon: Shield, label: "Security Alerts", gradient: "from-rose-500 to-pink-500" },
  { icon: BookOpen, label: "Total Items", gradient: "from-emerald-500 to-teal-500" },
];

function StatCard({
  icon: Icon,
  label,
  value,
  gradient,
  delay,
}: {
  icon: React.ElementType;
  label: string;
  value: number;
  gradient: string;
  delay: number;
}) {
  return (
    <Card
      className="group relative overflow-hidden transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-accent-vibrant/5 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      <CardContent className="relative z-10 py-4">
        <div className="flex items-center gap-3">
          <div className={`flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br ${gradient} shadow-sm`}>
            <Icon className="h-4 w-4 text-white" />
          </div>
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className="text-2xl font-bold tabular-nums tracking-tight">{value}</p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function ItemCard({ item, delay }: { item: FeedItem; delay: number }) {
  return (
    <a
      href={item.url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <Card className="transition-all duration-200 hover:-translate-y-0.5 hover:border-accent-vibrant/30 hover:shadow-md">
        <CardContent className="py-3 px-4">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0 flex-1">
              <p className="text-sm font-medium group-hover:text-accent-vibrant transition-colors truncate">
                {item.title}
              </p>
              <div className="flex items-center gap-2 mt-1">
                <Badge variant="secondary" className="text-[10px] px-1 py-0">
                  {item.source.replace("_", " ")}
                </Badge>
                {item.tags && (
                  <span className="text-[10px] text-muted-foreground">
                    {item.tags.split(",").slice(0, 3).map((t) => t.trim()).join(", ")}
                  </span>
                )}
                <span className="text-[10px] text-muted-foreground ml-auto">
                  {timeAgo(item.fetched_at)}
                </span>
              </div>
            </div>
            <ExternalLink className="h-3.5 w-3.5 shrink-0 text-muted-foreground opacity-0 group-hover:opacity-100 transition-all mt-1 group-hover:translate-x-0.5" />
          </div>
        </CardContent>
      </Card>
    </a>
  );
}

function SectionCard({
  title,
  icon: Icon,
  items,
  viewAllHref,
  delay,
}: {
  title: string;
  icon: React.ElementType;
  items: FeedItem[];
  viewAllHref?: string;
  delay: number;
}) {
  return (
    <Card
      className="transition-all duration-300 hover:shadow-md"
      style={{ animationDelay: `${delay}ms` }}
    >
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-vibrant/10">
              <Icon className="h-4 w-4 text-accent-vibrant" />
            </div>
            <CardTitle className="text-lg">{title}</CardTitle>
          </div>
          {viewAllHref && (
            <Button variant="ghost" size="sm" asChild>
              <Link href={viewAllHref}>
                View all
                <ChevronRight className="h-4 w-4 ml-1" />
              </Link>
            </Button>
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {items.length === 0 ? (
          <p className="text-sm text-muted-foreground py-4 text-center">No items yet. Run <code className="text-xs bg-muted px-1 rounded">npm run ingest</code> to fetch data.</p>
        ) : (
          items.map((item, i) => <ItemCard key={item.id} item={item} delay={i * 60 + delay + 200} />)
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
        "SELECT * FROM feed_items WHERE category = 'ai' ORDER BY score DESC, published_at DESC LIMIT 5"
      )
      .all()
  );

  const frameworkItems = toItems(
    db
      .prepare(
        "SELECT * FROM feed_items WHERE category IN ('nextjs', 'django') ORDER BY published_at DESC, fetched_at DESC LIMIT 5"
      )
      .all()
  );

  const trendingItems = toItems(
    db
      .prepare(
        "SELECT * FROM feed_items WHERE source = 'github_trending' ORDER BY fetched_at DESC LIMIT 5"
      )
      .all()
  );

  const securityItems = toItems(
    db
      .prepare(
        "SELECT * FROM feed_items WHERE category = 'security' OR tags LIKE '%cve%' ORDER BY published_at DESC, fetched_at DESC LIMIT 5"
      )
      .all()
  );

  const recommendedItem = toItems(
    db
      .prepare(
        "SELECT * FROM feed_items WHERE is_read = 0 AND (tags LIKE '%ai%' OR tags LIKE '%tool%') ORDER BY score DESC, fetched_at DESC LIMIT 1"
      )
      .all()
  );

  const totalItems = (
    db.prepare("SELECT COUNT(*) as count FROM feed_items").get() as { count: number }
  ).count;

  const unreadItems = (
    db.prepare("SELECT COUNT(*) as count FROM feed_items WHERE is_read = 0").get() as { count: number }
  ).count;

  const todayTask = INTERN_TASKS[Math.floor(Date.now() / 86400000) % INTERN_TASKS.length];

  const statValues = [aiItems.length, frameworkItems.length, securityItems.length, totalItems];

  return (
    <div className="min-h-screen bg-background">
      <div className="mx-auto max-w-5xl px-4 py-8">
        <div className="animate-fade-in flex items-center justify-between mb-8">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-3xl font-bold tracking-tight">Engineering Briefing</h1>
              <Sparkles className="h-5 w-5 text-accent-vibrant" />
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {totalItems} items ingested &middot; {unreadItems} unread
            </p>
          </div>
          <div className="flex gap-2">
            <Button asChild>
              <Link href="/feed">
                <BookOpen className="h-4 w-4" />
                Full Feed
              </Link>
            </Button>
          </div>
        </div>

        <div className="animate-fade-in grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
          {STAT_ICONS.map((s, i) => (
            <StatCard key={s.label} {...s} value={statValues[i]} delay={i * 100} />
          ))}
        </div>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: "200ms" }}>
            <SectionCard
              title="AI Changes"
              icon={Brain}
              items={aiItems}
              viewAllHref="/feed?category=ai"
              delay={0}
            />
            <SectionCard
              title="Trending Repos"
              icon={TrendingUp}
              items={trendingItems}
              viewAllHref="/feed?source=github_trending"
              delay={100}
            />
          </div>
          <div className="space-y-4 animate-slide-up" style={{ animationDelay: "300ms" }}>
            <SectionCard
              title="Framework Updates"
              icon={Code}
              items={frameworkItems}
              viewAllHref="/feed?category=nextjs"
              delay={0}
            />
            <SectionCard
              title="Security"
              icon={Shield}
              items={securityItems}
              viewAllHref="/feed?category=security"
              delay={100}
            />
          </div>
        </div>

        <Separator className="my-8" />

        <div className="grid gap-4 md:grid-cols-2">
          <Card className="animate-slide-up transition-all duration-300 hover:shadow-md" style={{ animationDelay: "500ms" }}>
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
                  className="block group"
                >
                  <p className="text-sm font-medium group-hover:text-accent-vibrant transition-colors">
                    {recommendedItem[0].title}
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {recommendedItem[0].summary || recommendedItem[0].tags || "No description"}
                  </p>
                </a>
              ) : (
                <p className="text-sm text-muted-foreground">
                  No recommendations yet. Add items tagged with <code className="text-xs bg-muted px-1 rounded">ai</code> or <code className="text-xs bg-muted px-1 rounded">tool</code>.
                </p>
              )}
            </CardContent>
          </Card>
          <Card className="animate-slide-up transition-all duration-300 hover:shadow-md" style={{ animationDelay: "600ms" }}>
            <CardHeader className="pb-3">
              <div className="flex items-center gap-2">
                <div className="flex h-7 w-7 items-center justify-center rounded-md bg-accent-vibrant/10">
                  <BookOpen className="h-4 w-4 text-accent-vibrant" />
                </div>
                <CardTitle className="text-lg">Intern Task</CardTitle>
              </div>
            </CardHeader>
            <CardContent>
              <p className="text-sm font-medium">{todayTask.title}</p>
              <p className="text-xs text-muted-foreground mt-1">{todayTask.description}</p>
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
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
