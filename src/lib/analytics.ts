import { supabase } from "../db/supabase-client";

export interface SourceBreakdown {
  source: string;
  count: number;
}

export interface CategoryBreakdown {
  category: string;
  count: number;
}

export interface IngestionStatus {
  source: string;
  lastRun: string | null;
  status: string | null;
  count: number;
  elapsedMs: number | null;
}

export async function getTotalItems(): Promise<number> {
  const { count } = await supabase
    .from("feed_items")
    .select("*", { count: "exact", head: true });
  return count ?? 0;
}

export async function getItemsToday(): Promise<number> {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const tomorrow = new Date(today);
  tomorrow.setDate(tomorrow.getDate() + 1);
  const { count } = await supabase
    .from("feed_items")
    .select("*", { count: "exact", head: true })
    .gte("fetched_at", today.toISOString())
    .lt("fetched_at", tomorrow.toISOString());
  return count ?? 0;
}

export async function getItemsThisWeek(): Promise<number> {
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString();
  const { count } = await supabase
    .from("feed_items")
    .select("*", { count: "exact", head: true })
    .gte("fetched_at", weekAgo);
  return count ?? 0;
}

export async function getItemsBySource(): Promise<SourceBreakdown[]> {
  const { data } = await supabase
    .from("feed_items")
    .select("source")
    .order("source");
  if (!data) return [];
  const map = new Map<string, number>();
  for (const item of data) {
    map.set(item.source, (map.get(item.source) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([source, count]) => ({ source, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getItemsByCategory(): Promise<CategoryBreakdown[]> {
  const { data } = await supabase
    .from("feed_items")
    .select("category")
    .order("category");
  if (!data) return [];
  const map = new Map<string, number>();
  for (const item of data) {
    map.set(item.category, (map.get(item.category) ?? 0) + 1);
  }
  return Array.from(map.entries())
    .map(([category, count]) => ({ category, count }))
    .sort((a, b) => b.count - a.count);
}

export async function getIngestionStatus(): Promise<IngestionStatus[]> {
  const sources = ["hn", "rss", "github_trending"];
  const keys = sources.flatMap((s) => [
    `ingest:last_run:${s}`,
    `ingest:status:${s}`,
    `ingest:count:${s}`,
    `ingest:elapsed_ms:${s}`,
  ]);
  const { data } = await supabase.from("kv_store").select("*").in("key", keys);
  const lookup = new Map((data ?? []).map((r) => [r.key, r.value]));

  return sources.map((source) => ({
    source,
    lastRun: lookup.get(`ingest:last_run:${source}`) ?? null,
    status: lookup.get(`ingest:status:${source}`) ?? null,
    count: Number(lookup.get(`ingest:count:${source}`) ?? 0),
    elapsedMs: lookup.get(`ingest:elapsed_ms:${source}`)
      ? Number(lookup.get(`ingest:elapsed_ms:${source}`))
      : null,
  }));
}

export async function getLastGlobalIngestion(): Promise<string | null> {
  const { data } = await supabase
    .from("kv_store")
    .select("value")
    .eq("key", "ingest:last_run:all")
    .single();
  return data?.value ?? null;
}

export async function getGlobalIngestionStatus(): Promise<string | null> {
  const { data } = await supabase
    .from("kv_store")
    .select("value")
    .eq("key", "ingest:status:all")
    .single();
  return data?.value ?? null;
}
