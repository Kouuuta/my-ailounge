import { migrate } from "../db/schema";
import { getDb, closeDb } from "../db/client";
import { ingestHackerNews } from "./hacker-news/index";
import { ingestGithubTrending } from "./github-trending/index";
import { ingestRss } from "./rss/index";
import { ingestRepoRadar } from "./repo-radar/index";

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
): Promise<{ ok: boolean; inserted: number; elapsed: number }> {
  const before = countBySource(source);
  const start = Date.now();
  try {
    await fn();
    const inserted = countBySource(source) - before;
    const elapsed = Date.now() - start;
    setKv(`ingest:last_run:${label}`, new Date().toISOString());
    setKv(`ingest:status:${label}`, "ok");
    setKv(`ingest:count:${label}`, String(inserted));
    setKv(`ingest:elapsed_ms:${label}`, String(elapsed));
    console.log(`  ⏱  ${label} took ${elapsed}ms, inserted ${inserted} new items`);
    return { ok: true, inserted, elapsed };
  } catch (err) {
    const elapsed = Date.now() - start;
    setKv(`ingest:last_run:${label}`, new Date().toISOString());
    setKv(`ingest:status:${label}`, "error");
    setKv(`ingest:count:${label}`, "0");
    setKv(`ingest:elapsed_ms:${label}`, "0");
    console.error(`  ❌ ${label} failed:`, err);
    return { ok: false, inserted: 0, elapsed };
  }
}

export interface IngestResults {
  results: Record<string, { ok: boolean; inserted: number; elapsed: number }>;
  allOk: boolean;
}

export async function runAll(opts?: { closeDb?: boolean }): Promise<IngestResults> {
  console.log("=".repeat(60));
  console.log("🚀 Running all feed ingestors");
  console.log("=".repeat(60));

  migrate();

  const results: IngestResults["results"] = {};
  results.hn = await runTracked("hn", "hn", ingestHackerNews);
  results.github_trending = await runTracked("github_trending", "github_trending", ingestGithubTrending);
  results.rss = await runTracked("rss", "rss", ingestRss);
  results.repo_radar = await runTracked("repo_radar", "repo_radar", ingestRepoRadar);

  const allOk = Object.values(results).every((r) => r.ok);

  setKv("ingest:last_run:all", new Date().toISOString());
  setKv("ingest:status:all", allOk ? "ok" : "degraded");

  console.log("=".repeat(60));

  // Print summary table
  console.log("📊 Ingestion Summary:");
  console.log("  Source           Status    Items  Last Run");
  console.log("  " + "─".repeat(55));
  for (const src of ["hn", "github_trending", "rss", "repo_radar"]) {
    const r = results[src];
    const count = r.ok ? String(r.inserted) : "ERR";
    const time = new Date().toLocaleTimeString();
    const icon = r.ok ? "✅" : "❌";
    console.log(`  ${icon} ${src.padEnd(16)} ${r.ok ? "ok".padEnd(8) : "error".padEnd(8)} ${count.padEnd(5)} ${time}`);
  }
  console.log("  " + "─".repeat(55));

  const globalStatus = allOk ? "ok" : "degraded";
  console.log(`\n✅ All ingestors complete — global status: ${globalStatus}`);

  if (opts?.closeDb ?? true) closeDb();

  return { results, allOk };
}

const isMain = process.argv[1]?.replace(/\\/g, "/").endsWith("run-all.ts");
if (isMain) {
  runAll().catch((err) => {
    console.error("❌ Fatal error:", err);
    process.exit(1);
  });
}
