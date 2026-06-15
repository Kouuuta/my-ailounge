export interface FeedConfig {
  url: string;
  category: string;
}

export async function ingestRss(feeds: FeedConfig[]): Promise<void> {
  // TODO: Fetch and parse each RSS feed URL
  // Write new items to:
  //   1. docs/feeds/<category>.md (based on category)
  //   2. feed_items table in SQLite
  console.log(`RSS ingester not yet implemented. Received ${feeds.length} feed(s).`);
}
