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
`;

export function migrate(): void {
  const db = getDb();
  db.exec(SCHEMA_SQL);
  console.log("Database migrated successfully.");
}
