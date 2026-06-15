import fs from "fs";
import path from "path";
import { appendToFeed } from "../../lib/markdown";
import { upsertEntry } from "../../lib/db";

const TRENDING_FILE = path.join(process.cwd(), "ideas", "trending.md");

interface TrendingEntry {
  title:       string;
  repoUrl:     string;
  description: string;
  date:        string;
}

export async function ingestGithubTrending(): Promise<void> {
  console.log("\n⭐ GitHub Trending Ingester");
  console.log(`   Reading from: ${TRENDING_FILE}\n`);

  if (!fs.existsSync(TRENDING_FILE)) {
    console.error(`❌ File not found: ${TRENDING_FILE}`);
    return;
  }

  let inserted = 0;
  let skipped = 0;

  try {
    const content = fs.readFileSync(TRENDING_FILE, "utf-8");
    const entries = parseTrendingMd(content);

    for (const entry of entries) {
      // Write to markdown
      appendToFeed("04-github-trending.md", entry.title, entry.repoUrl, entry.date, "github, trending, opensource");

      // Write to DB
      const result = upsertEntry({
        source: "github_trending",
        category: "github",
        title: entry.title,
        url: entry.repoUrl,
        summary: entry.description,
        tags: "github, trending, opensource",
        published_at: entry.date,
      });

      if (result === "inserted") inserted++;
      else skipped++;
    }

    console.log(`   → ${inserted} inserted, ${skipped} skipped\n`);
    console.log("✅ GitHub Trending ingestion complete\n");

  } catch (err) {
    console.error("❌ Failed to process GitHub trending:", err);
  }
}

function parseTrendingMd(content: string): TrendingEntry[] {
  const lines = content.split("\n");
  const entries: TrendingEntry[] = [];
  let currentDate = "";

  // Regex for: ### YYYY-MM-DD
  const datePattern = /^###\s+(\d{4}-\d{2}-\d{2})/;
  // Regex for: N. **[name](url)**: description
  const entryPattern = /^\d+\.\s+\*\*\[(.+?)\]\((https?:\/\/.+?)\)\*\*:\s*(.+)$/;

  for (const line of lines) {
    const trimmed = line.trim();

    const dateMatch = trimmed.match(datePattern);
    if (dateMatch) {
      currentDate = dateMatch[1];
      continue;
    }

    const entryMatch = trimmed.match(entryPattern);
    if (entryMatch && currentDate) {
      entries.push({
        title: entryMatch[1].trim(),
        repoUrl: entryMatch[2].trim(),
        description: entryMatch[3].trim(),
        date: currentDate,
      });
    }
  }

  return entries;
}

// Allow running directly
if (require.main === module) {
  ingestGithubTrending().catch(console.error);
}
