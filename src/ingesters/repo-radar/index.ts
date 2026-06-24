import { getDb } from "../../db/client";
import { refreshSingleRepo, type RepoRadarItem } from "../../lib/repo-radar";

export async function ingestRepoRadar(): Promise<void> {
  const db = getDb();

  const items = db.prepare(
    "SELECT * FROM repo_radar_items WHERE is_active = 1",
    ).all() as unknown as RepoRadarItem[];

  if (items.length === 0) {
    console.log("  ⏭  No repos to refresh");
    return;
  }

  let updated = 0;
  let errors = 0;

  for (const item of items) {
    const result = await refreshSingleRepo(item);
    if (result.ok) updated++;
    else errors++;
  }

  db.prepare(
    "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)",
  ).run("ingest:last_run:repo_radar", new Date().toISOString());
  db.prepare(
    "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)",
  ).run("ingest:status:repo_radar", errors === 0 ? "ok" : "degraded");
  db.prepare(
    "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)",
  ).run("ingest:count:repo_radar", String(items.length));
  db.prepare(
    "INSERT OR REPLACE INTO kv_store (key, value) VALUES (?, ?)",
  ).run("ingest:elapsed_ms:repo_radar", "0");

  console.log(`  📡 repo_radar: refreshed ${updated} repos${errors ? `, ${errors} errors` : ""}`);
}
