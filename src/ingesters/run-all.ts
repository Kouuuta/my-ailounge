import { migrate } from "../db/schema";
import { closeDb } from "../db/client";
import { ingestManualFeeds } from "./manual-feeds/index";
import { ingestHackerNews } from "./hacker-news/index";
import { ingestGithubTrending } from "./github-trending/index";
import { ingestRss } from "./rss/index";

async function runAll(): Promise<void> {
  console.log("=".repeat(60));
  console.log("🚀 Running all feed ingestors");
  console.log("=".repeat(60));

  // Ensure DB schema exists
  migrate();

  // Run each ingester sequentially
  await ingestManualFeeds();
  await ingestHackerNews();
  await ingestGithubTrending();
  await ingestRss();

  console.log("=".repeat(60));
  console.log("✅ All ingestors complete");
  console.log("=".repeat(60));

  closeDb();
}

runAll().catch((err) => {
  console.error("❌ Fatal error:", err);
  process.exit(1);
});
