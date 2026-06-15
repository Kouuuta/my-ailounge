import fs from "fs";
import path from "path";
import { getDb } from "../../db/client";

// ─── Config ──────────────────────────────────────────────────────────────────

const FEEDS_DIR = path.join(process.cwd(), "docs", "feeds");

// Maps each MD filename to its default category tag
const FILE_CATEGORY_MAP: Record<string, string> = {
  "01-ai-news.md":         "ai",
  "02-cloud-news.md":      "cloud",
  "03-django-news.md":     "django",
  "04-github-trending.md": "github",
  "05-hacker-news.md":     "hn",
  "06-nextjs-news.md":     "nextjs",
  "07-rumors.md":          "rumors",
  "08-security-alerts.md": "security",
};

// ─── Types ────────────────────────────────────────────────────────────────────

interface ParsedEntry {
  title:        string;
  url:          string;
  published_at: string;
  tags:         string;
  category:     string;
  source:       string;
}

// ─── Parser ───────────────────────────────────────────────────────────────────

/**
 * Parses a single line from a feed MD file.
 *
 * Expected format:
 *   - [Title](https://url.com) | YYYY-MM-DD | tag1, tag2
 *
 * Returns null if the line doesn't match the format (skipped silently).
 */
function parseLine(line: string, category: string): ParsedEntry | null {
  const trimmed = line.trim();

  // Must start with "- [" to be a valid entry
  if (!trimmed.startsWith("- [")) return null;

  // Match: - [Title](URL) | date | tags
  const pattern = /^-\s+\[(.+?)\]\((https?:\/\/.+?)\)\s*\|\s*(\d{4}-\d{2}-\d{2})\s*\|\s*(.+)$/;
  const match = trimmed.match(pattern);

  if (!match) {
    // Line starts with "- [" but doesn't fully match — log a warning
    console.warn(`  ⚠️  Skipping malformed line: ${trimmed.substring(0, 80)}...`);
    return null;
  }

  const [, title, url, date, rawTags] = match;

  return {
    title:        title.trim(),
    url:          url.trim(),
    published_at: date.trim(),
    tags:         rawTags.trim().toLowerCase(),
    category,
    source:       "manual",
  };
}

/**
 * Reads a single MD file and returns all valid parsed entries.
 */
function parseFile(filePath: string, category: string): ParsedEntry[] {
  const content = fs.readFileSync(filePath, "utf-8");
  const lines   = content.split("\n");
  const entries: ParsedEntry[] = [];

  for (const line of lines) {
    const entry = parseLine(line, category);
    if (entry) entries.push(entry);
  }

  return entries;
}

// ─── Database ─────────────────────────────────────────────────────────────────

/**
 * Upserts a single entry into feed_items.
 * UNIQUE(source, url) constraint means duplicates are safely ignored.
 */
function upsertEntry(entry: ParsedEntry): "inserted" | "skipped" {
  const db = getDb();

  const stmt = db.prepare(`
    INSERT OR IGNORE INTO feed_items
      (source, category, title, url, tags, published_at, fetched_at)
    VALUES
      (@source, @category, @title, @url, @tags, @published_at, datetime('now'))
  `);

  const result = stmt.run(entry);

  // changes === 1 means a new row was inserted
  // changes === 0 means the UNIQUE constraint fired (duplicate, skipped)
  return result.changes === 1 ? "inserted" : "skipped";
}

// ─── Main ─────────────────────────────────────────────────────────────────────

export async function ingestManualFeeds(): Promise<void> {
  console.log("\n📂 Manual Feeds Ingester");
  console.log(`   Reading from: ${FEEDS_DIR}\n`);

  if (!fs.existsSync(FEEDS_DIR)) {
    console.error(`❌ Feeds directory not found: ${FEEDS_DIR}`);
    process.exit(1);
  }

  let totalInserted = 0;
  let totalSkipped  = 0;
  let totalErrors   = 0;

  for (const [filename, category] of Object.entries(FILE_CATEGORY_MAP)) {
    const filePath = path.join(FEEDS_DIR, filename);

    if (!fs.existsSync(filePath)) {
      console.warn(`  ⚠️  File not found, skipping: ${filename}`);
      continue;
    }

    console.log(`  📄 ${filename} (category: ${category})`);

    let fileInserted = 0;
    let fileSkipped  = 0;

    try {
      const entries = parseFile(filePath, category);

      for (const entry of entries) {
        const result = upsertEntry(entry);
        if (result === "inserted") {
          fileInserted++;
          console.log(`     ✅ Inserted: ${entry.title.substring(0, 60)}`);
        } else {
          fileSkipped++;
        }
      }

      console.log(`     → ${fileInserted} inserted, ${fileSkipped} already existed\n`);
      totalInserted += fileInserted;
      totalSkipped  += fileSkipped;

    } catch (err) {
      console.error(`  ❌ Error processing ${filename}:`, err);
      totalErrors++;
    }
  }

  console.log("─".repeat(50));
  console.log(`✅ Manual feeds ingestion complete`);
  console.log(`   Inserted : ${totalInserted}`);
  console.log(`   Skipped  : ${totalSkipped} (already in DB)`);
  console.log(`   Errors   : ${totalErrors}`);
  console.log("─".repeat(50) + "\n");
}

// Allow running directly: npx ts-node src/ingesters/manual-feeds/index.ts
if (require.main === module) {
  ingestManualFeeds().catch(console.error);
}
