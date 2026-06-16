import { DatabaseSync } from "node:sqlite";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "dashboard.db");

let db: DatabaseSync | null = null;

const BOOT_SQL = `
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

export function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA foreign_keys = ON");
    db.exec(BOOT_SQL);
    const existing = db.prepare("SELECT COUNT(*) as count FROM watchlist_items").get() as { count: number };
    if (existing.count === 0) {
      const insert = db.prepare("INSERT OR IGNORE INTO watchlist_items (name, category) VALUES (@name, @category)");
      for (const item of SEED_WATCHLIST) {
        insert.run(item);
      }
    }
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
