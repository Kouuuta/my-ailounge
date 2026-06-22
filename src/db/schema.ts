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

CREATE TABLE IF NOT EXISTS log_analyses (
  id                INTEGER PRIMARY KEY AUTOINCREMENT,
  filename          TEXT NOT NULL,
  source            TEXT NOT NULL,
  uploaded_at       TEXT DEFAULT (datetime('now')),
  total_rows        INTEGER DEFAULT 0,
  error_count       INTEGER DEFAULT 0,
  unique_errors     INTEGER DEFAULT 0,
  time_range_start  TEXT,
  time_range_end    TEXT,
  methods           TEXT,
  executive_summary TEXT
);

CREATE TABLE IF NOT EXISTS log_errors (
  id          INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id INTEGER NOT NULL REFERENCES log_analyses(id) ON DELETE CASCADE,
  source      TEXT NOT NULL,
  method      TEXT,
  action      TEXT,
  content     TEXT,
  error_type  TEXT,
  error_code  TEXT,
  raw_message TEXT,
  timestamp   TEXT,
  is_error    INTEGER DEFAULT 1
);

CREATE TABLE IF NOT EXISTS log_patterns (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id     INTEGER NOT NULL REFERENCES log_analyses(id) ON DELETE CASCADE,
  source          TEXT NOT NULL,
  pattern_key     TEXT NOT NULL,
  sample_message  TEXT,
  count           INTEGER DEFAULT 0,
  first_seen      TEXT,
  last_seen       TEXT,
  severity        TEXT DEFAULT 'medium'
);

CREATE TABLE IF NOT EXISTS log_anomalies (
  id              INTEGER PRIMARY KEY AUTOINCREMENT,
  analysis_id     INTEGER NOT NULL REFERENCES log_analyses(id) ON DELETE CASCADE,
  source          TEXT NOT NULL,
  description     TEXT,
  severity        TEXT DEFAULT 'medium',
  detected_at     TEXT,
  error_count     INTEGER,
  expected_count  REAL,
  deviation       REAL
);

CREATE INDEX IF NOT EXISTS idx_log_errors_analysis ON log_errors(analysis_id);
CREATE INDEX IF NOT EXISTS idx_log_patterns_analysis ON log_patterns(analysis_id);
CREATE INDEX IF NOT EXISTS idx_log_anomalies_analysis ON log_anomalies(analysis_id);
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
