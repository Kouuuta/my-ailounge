import { getDb } from "./client";

const SCHEMA_SQL = `
CREATE TABLE IF NOT EXISTS feed_items (
  id           INTEGER PRIMARY KEY AUTOINCREMENT,
  source       TEXT NOT NULL,
  category     TEXT NOT NULL DEFAULT 'general',
  external_id  TEXT,
  title        TEXT NOT NULL,
  url          TEXT NOT NULL,
  summary      TEXT,
  tags         TEXT,
  score        INTEGER,
  published_at TEXT,
  fetched_at   TEXT DEFAULT (datetime('now')),
  is_pinned    INTEGER DEFAULT 0,
  is_read      INTEGER DEFAULT 0,
  UNIQUE (source, url)
);

CREATE INDEX IF NOT EXISTS idx_feed_category ON feed_items(category);
CREATE INDEX IF NOT EXISTS idx_feed_source ON feed_items(source);
CREATE INDEX IF NOT EXISTS idx_feed_published ON feed_items(published_at);

CREATE TABLE IF NOT EXISTS kv_store (
  key   TEXT PRIMARY KEY,
  value TEXT
);

CREATE TABLE IF NOT EXISTS watchlist_items (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  name              TEXT NOT NULL UNIQUE,
  category          TEXT,
  installed_version TEXT,
  latest_version    TEXT,
  risk_level        TEXT DEFAULT 'low',
  upgrade_notes     TEXT,
  known_vulns       TEXT,
  migration_link    TEXT,
  updated_at        TEXT DEFAULT (datetime('now'))
);
`;

const SEED_WATCHLIST = [
  { name: "Next.js", category: "framework" },
  { name: "React", category: "framework" },
  { name: "Django", category: "framework" },
  { name: "DRF", category: "framework" },
  { name: "PostgreSQL", category: "database" },
  { name: "Redis", category: "database" },
  { name: "Docker", category: "infra" },
  { name: "AWS", category: "cloud" },
  { name: "Celery", category: "infra" },
  { name: "GitHub Actions", category: "infra" },
  { name: "Sentry", category: "infra" },
  { name: "OpenAI SDK", category: "ai-sdk" },
  { name: "Anthropic SDK", category: "ai-sdk" },
  { name: "DeepSeek SDK", category: "ai-sdk" },
];

export function migrate(): void {
  const db = getDb();
  db.exec(SCHEMA_SQL);

  const existing = db.prepare("SELECT COUNT(*) as count FROM watchlist_items").get() as { count: number };
  if (existing.count === 0) {
    const insert = db.prepare("INSERT INTO watchlist_items (name, category) VALUES (@name, @category)");
    for (const item of SEED_WATCHLIST) {
      try {
        insert.run(item);
      } catch {
        // ignore duplicates
      }
    }
    console.log(`Seeded ${SEED_WATCHLIST.length} watchlist items.`);
  }

  console.log("Database migrated successfully.");
}
