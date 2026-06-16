import { migrate } from "../db/schema";
import { getDb, closeDb } from "../db/client";
import { ingestManualFeeds } from "./manual-feeds/index";
import { ingestHackerNews } from "./hacker-news/index";
import { ingestGithubTrending } from "./github-trending/index";
import { ingestRss } from "./rss/index";

function setKv(key: string, value: string): void {
  const db = getDb();
  db.prepare(
    "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)",
  ).run(key, value);
}

function countBySource(source: string): number {
  const db = getDb();
  const row = db
    .prepare("SELECT COUNT(*) as count FROM feed_items WHERE source = ?")
    .get(source) as { count: number };
  return row.count;
}

async function runTracked(
  label: string,
  source: string,
  fn: () => Promise<void>,
): Promise<void> {
  const before = countBySource(source);
  const start = Date.now();
  try {
    await fn();
    const after = countBySource(source);
    const inserted = after - before;
    const elapsed = Date.now() - start;
    const timestamp = new Date().toISOString();
    setKv(`ingest:last_run:${label}`, timestamp);
    setKv(`ingest:status:${label}`, "ok");
    setKv(`ingest:count:${label}`, String(inserted));
    setKv(`ingest:elapsed_ms:${label}`, String(elapsed));
    console.log(`  ⏱  ${label} took ${elapsed}ms, inserted ${inserted} new items`);
  } catch (err) {
    const timestamp = new Date().toISOString();
    setKv(`ingest:last_run:${label}`, timestamp);
    setKv(`ingest:status:${label}`, "error");
    setKv(`ingest:count:${label}`, "0");
    setKv(`ingest:elapsed_ms:${label}`, "0");
    console.error(`  ❌ ${label} failed:`, err);
  }
}

async function runAll(): Promise<void> {
  console.log("=".repeat(60));
  console.log("🚀 Running all feed ingestors");
  console.log("=".repeat(60));

  migrate();

  await runTracked("manual", "manual", ingestManualFeeds);
  await runTracked("hn", "hn", ingestHackerNews);
  await runTracked("github_trending", "github_trending", ingestGithubTrending);
  await runTracked("rss", "rss", ingestRss);

  const allOk = ["manual", "hn", "github_trending", "rss"].every(
    (src) => {
      const row = getDb()
        .prepare("SELECT value FROM kv_store WHERE key = ?")
        .get(`ingest:status:${src}`) as { value: string } | undefined;
      return row?.value === "ok";
    },
  );

  setKv("ingest:last_run:all", new Date().toISOString());
  setKv("ingest:status:all", allOk ? "ok" : "degraded");

  console.log("=".repeat(60));

  // Print summary table
  console.log("📊 Ingestion Summary:");
  console.log("  Source           Status    Items  Last Run");
  console.log("  " + "─".repeat(55));
  for (const src of ["manual", "hn", "github_trending", "rss"]) {
    const s = getDb()
      .prepare("SELECT value FROM kv_store WHERE key = ?")
      .get(`ingest:status:${src}`) as { value: string } | undefined;
    const c = getDb()
      .prepare("SELECT value FROM kv_store WHERE key = ?")
      .get(`ingest:count:${src}`) as { value: string } | undefined;
    const t = getDb()
      .prepare("SELECT value FROM kv_store WHERE key = ?")
      .get(`ingest:last_run:${src}`) as { value: string } | undefined;
    const status = s?.value ?? "unknown";
    const count = c?.value ?? "?";
    const time = t?.value ? new Date(t.value).toLocaleTimeString() : "—";
    const icon = status === "ok" ? "✅" : "❌";
    console.log(`  ${icon} ${src.padEnd(16)} ${status.padEnd(8)} ${count.padEnd(5)} ${time}`);
  }
  console.log("  " + "─".repeat(55));

  const globalStatus = allOk ? "ok" : "degraded";
  console.log(`\n✅ All ingestors complete — global status: ${globalStatus}`);

  closeDb();
}

runAll().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
