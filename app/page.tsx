import { getServerSupabase } from "@/src/db/server-client";
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
import { FeaturedPrompt } from "@/components/briefing/featured-prompt";

interface PromptItem {
  id: number;
  title: string;
  content: string;
  category: string;
  description: string | null;
  usage_count: number;
  is_featured: number;
}

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

export default async function HomePage() {
  const supabase = await getServerSupabase();
  const { data: { user } } = await supabase.auth.getUser();

  const [
    { data: aiData },
    { data: frameworkData },
    { data: trendingData },
    { data: securityData },
    { data: recommendedData },
    { count: totalCount },
    { data: featuredPromptData },
  ] = await Promise.all([
    supabase.from("feed_items").select("*").eq("category", "ai").neq("source", "manual").order("score", { ascending: false }).order("published_at", { ascending: false }).limit(5),
    supabase.from("feed_items").select("*").in("category", ["nextjs", "django"]).neq("source", "manual").order("published_at", { ascending: false }).order("fetched_at", { ascending: false }).limit(5),
    supabase.from("feed_items").select("*").eq("source", "github_trending").order("fetched_at", { ascending: false }).limit(5),
    supabase.from("feed_items").select("*").or("category.eq.security,tags.ilike.%cve%").neq("source", "manual").order("published_at", { ascending: false }).order("fetched_at", { ascending: false }).limit(5),
    supabase.from("feed_items").select("id, title, url, summary, tags").neq("source", "manual").or("tags.ilike.%ai%,tags.ilike.%tool%").order("score", { ascending: false }).order("fetched_at", { ascending: false }).limit(1).maybeSingle(),
    supabase.from("feed_items").select("*", { count: "exact", head: true }).neq("source", "manual"),
    supabase.from("prompts").select("*").eq("is_featured", 1).eq("source", "curated").order("id").limit(1).maybeSingle(),
  ]);

  const aiItems = (aiData ?? []) as FeedItem[];
  const frameworkItems = (frameworkData ?? []) as FeedItem[];
  const trendingItems = (trendingData ?? []) as FeedItem[];
  const securityItems = (securityData ?? []) as FeedItem[];
  const recommendedItem = (recommendedData as FeedItem | null) ?? null;
  const totalItems = totalCount ?? 0;
  const featuredPrompt = (featuredPromptData as PromptItem | null) ?? null;

  let featuredItems: FeedItem[] = [];
  if (user) {
    const { data: pinnedStates } = await supabase
      .from("user_feed_states")
      .select("feed_item_id")
      .eq("user_id", user.id)
      .eq("is_pinned", 1);

    const pinnedIds = (pinnedStates ?? []).map((p) => p.feed_item_id);
    if (pinnedIds.length > 0) {
      const { data: pinnedData } = await supabase
        .from("feed_items")
        .select("*")
        .in("id", pinnedIds)
        .order("published_at", { ascending: false })
        .limit(4);

      featuredItems = (pinnedData ?? []) as FeedItem[];
    }
  }

  const taskIndex = Math.floor(Date.now() / 86400000);
  const todayTask = INTERN_TASKS[taskIndex % INTERN_TASKS.length];
  const tomorrowTask = INTERN_TASKS[(taskIndex + 1) % INTERN_TASKS.length];

  const [itemsToday, itemsThisWeek, lastIngestion] = await Promise.all([
    getItemsToday(),
    getItemsThisWeek(),
    getLastGlobalIngestion(),
  ]);

  const [sourcesData, categoriesData] = await Promise.all([
    getItemsBySource(),
    getItemsByCategory(),
  ]);
  const sources: BreakdownItem[] = sourcesData.map((s) => ({
    name: s.source,
    count: s.count,
  }));
  const categories: BreakdownItem[] = categoriesData.map((c) => ({
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
              <Sparkles className="h-5 w-5 text-accent-vibrant" />
              <h1 className="text-3xl font-bold tracking-tight">
                Engineering Briefing
              </h1>
            </div>
            <p className="text-muted-foreground text-sm mt-1">
              {totalItems} items
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
            secondary="ingested"
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

        {/* Bottom row: Breakdown + Tasks + Automation + Featured Prompt */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
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
            <FeaturedPrompt item={featuredPrompt} delay={600} />
          </div>
          <div className="md:col-span-1 lg:col-span-1">
            <AutomationStatus />
          </div>
        </div>
      </div>
    </div>
  );
}
