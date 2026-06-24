import { getDb } from "@/src/db/client";
import {
  getItemsBySource,
  getItemsByCategory,
  getItemsToday,
  getItemsThisWeek,
  getLastGlobalIngestion,
} from "@/src/lib/analytics";
import { INTERN_TASKS } from "@/src/config/intern-tasks";
import {
  Brain,
  Code,
  TrendingUp,
  Shield,
  BookOpen,
  Sparkles,
  Clock,
} from "lucide-react";
import Link from "next/link";
import { IngestButton } from "@/components/engineering-intelligence/ingest-button";
import { StatCard } from "@/components/briefing/stat-card";
import { FeedSection } from "@/components/briefing/feed-section";
import { FeedBreakdown } from "@/components/briefing/feed-breakdown";
import type { BreakdownItem } from "@/components/briefing/feed-breakdown";
import { FeaturedNews } from "@/components/briefing/featured-news";
import { InternTasks } from "@/components/briefing/intern-tasks";
import { AutomationStatus } from "@/components/briefing/automation-status";

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
  return new Date(dateStr).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
  });
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

  const recommendedItem = (
    db
      .prepare(
        "SELECT id, title, url, summary, tags FROM feed_items WHERE is_read = 0 AND source != 'manual' AND (tags LIKE '%ai%' OR tags LIKE '%tool%') ORDER BY score DESC, fetched_at DESC LIMIT 1",
      )
      .get() as FeedItem | undefined
  ) ?? null;

  const featuredItems = toItems(
    db
      .prepare(
        "SELECT * FROM feed_items WHERE is_pinned = 1 AND source != 'manual' ORDER BY published_at DESC, fetched_at DESC LIMIT 4",
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
    <div className="min-h-screen">
      <div className="mx-auto max-w-7xl px-4 md:px-6 py-6 md:py-8">
        {/* Header */}
        <div className="animate-fade-in flex items-center justify-between gap-3 flex-wrap mb-8">
          <div>
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-teal-400 to-purple-600">
                <Sparkles className="h-4 w-4 text-white" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold text-white font-display tracking-tight">
                Engineering Briefing
              </h1>
            </div>
            <p className="text-gray-500 text-sm mt-1 font-mono">
              {totalItems} items &middot; {unreadItems} unread
            </p>
          </div>
          <div className="flex gap-2">
            <IngestButton />
            <Link
              href="/feed"
              className="inline-flex items-center gap-1.5 rounded-xl bg-white/[0.06] border border-white/[0.08] px-3 py-2 text-sm font-medium text-gray-300 transition-all duration-200 hover:bg-white/[0.1] hover:text-white"
            >
              <BookOpen className="h-4 w-4" />
              Full Feed
            </Link>
          </div>
        </div>

        {/* Stat Cards */}
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
            accentColor="bg-gray-500"
            gradient="from-gray-500 to-slate-500"
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

        {/* Featured News */}
        {featuredItems.length > 0 && (
          <div className="mb-8">
            <FeaturedNews items={featuredItems} delay={400} />
          </div>
        )}

        {/* Feed Sections */}
        <div className="grid gap-4 md:grid-cols-2 mb-8">
          <FeedSection
            title="AI Changes"
            icon={Brain}
            items={aiItems}
            viewAllHref="/feed?category=ai"
            delay={0}
            theme="ai"
          />
          <FeedSection
            title="Trending Repos"
            icon={TrendingUp}
            items={trendingItems}
            viewAllHref="/feed?source=github_trending"
            delay={100}
            theme="trending"
          />
          <FeedSection
            title="Framework Updates"
            icon={Code}
            items={frameworkItems}
            viewAllHref="/feed?category=nextjs"
            delay={200}
            theme="framework"
          />
          <FeedSection
            title="Security"
            icon={Shield}
            items={securityItems}
            viewAllHref="/feed?category=security"
            delay={300}
            theme="security"
          />
        </div>

        {/* Bottom row: Breakdown + Tasks + Automation */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 mb-8">
          <div className="md:col-span-1 lg:col-span-1">
            <div className="hidden md:block">
              <FeedBreakdown
                sources={sources}
                categories={categories}
                total={totalItems}
                delay={400}
              />
            </div>
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            <InternTasks
              recommendedItem={recommendedItem}
              todayTask={todayTask}
              tomorrowTask={tomorrowTask}
              delay={500}
            />
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            <AutomationStatus />
          </div>
        </div>
      </div>
    </div>
  );
}
