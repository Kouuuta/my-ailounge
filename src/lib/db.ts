import { getDb } from "../db/client";

export interface IngestEntry {
  source:       string;
  category:     string;
  title:        string;
  url:          string;
  summary?:     string;
  tags?:        string;
  score?:       number;
  published_at: string;
}

export function upsertEntry(entry: IngestEntry): "inserted" | "skipped" {
  const db = getDb();

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO feed_items
      (source, category, title, url, summary, tags, score, published_at, fetched_at)
    VALUES
      (@source, @category, @title, @url, @summary, @tags, @score, @published_at, datetime('now'))
  `);

  const result = stmt.run({
    source:       entry.source,
    category:     entry.category,
    title:        entry.title,
    url:          entry.url,
    summary:      entry.summary ?? null,
    tags:         entry.tags ?? null,
    score:        entry.score ?? null,
    published_at: entry.published_at,
  });

  return result.changes === 1 ? "inserted" : "skipped";
}
