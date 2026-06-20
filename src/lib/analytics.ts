import { getDb } from "../db/client";

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

export function getTotalItems(): number {
  const db = getDb();
  const row = db
    .prepare("SELECT COUNT(*) as count FROM feed_items")
    .get() as { count: number };
  return row.count;
}

export function getItemsToday(): number {
  const db = getDb();
  const row = db
    .prepare(
      "SELECT COUNT(*) as count FROM feed_items WHERE date(fetched_at) = date('now')",
    )
    .get() as { count: number };
  return row.count;
}

export function getItemsThisWeek(): number {
  const db = getDb();
  const row = db
    .prepare(
      "SELECT COUNT(*) as count FROM feed_items WHERE fetched_at >= datetime('now', '-7 days')",
    )
    .get() as { count: number };
  return row.count;
}

export function getItemsBySource(): SourceBreakdown[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT source, COUNT(*) as count FROM feed_items GROUP BY source ORDER BY count DESC",
    )
    .all() as unknown as SourceBreakdown[];
}

export function getItemsByCategory(): CategoryBreakdown[] {
  const db = getDb();
  return db
    .prepare(
      "SELECT category, COUNT(*) as count FROM feed_items GROUP BY category ORDER BY count DESC",
    )
    .all() as unknown as CategoryBreakdown[];
}

export function getIngestionStatus(): IngestionStatus[] {
  const db = getDb();
  const sources = ["hn", "rss", "github_trending"];

  return sources.map((source) => {
    const lastRun = db
      .prepare("SELECT value FROM kv_store WHERE key = ?")
      .get(`ingest:last_run:${source}`) as { value: string } | undefined;

    const status = db
      .prepare("SELECT value FROM kv_store WHERE key = ?")
      .get(`ingest:status:${source}`) as { value: string } | undefined;

    const count = db
      .prepare("SELECT value FROM kv_store WHERE key = ?")
      .get(`ingest:count:${source}`) as { value: string } | undefined;

    const elapsed = db
      .prepare("SELECT value FROM kv_store WHERE key = ?")
      .get(`ingest:elapsed_ms:${source}`) as { value: string } | undefined;

    return {
      source,
      lastRun: lastRun?.value ?? null,
      status: status?.value ?? null,
      count: count ? Number(count.value) : 0,
      elapsedMs: elapsed ? Number(elapsed.value) : null,
    };
  });
}

export function getLastGlobalIngestion(): string | null {
  const db = getDb();
  const row = db
    .prepare("SELECT value FROM kv_store WHERE key = 'ingest:last_run:all'")
    .get() as { value: string } | undefined;
  return row?.value ?? null;
}

export function getGlobalIngestionStatus(): string | null {
  const db = getDb();
  const row = db
    .prepare("SELECT value FROM kv_store WHERE key = 'ingest:status:all'")
    .get() as { value: string } | undefined;
  return row?.value ?? null;
}
