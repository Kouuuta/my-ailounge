import { getDb } from "../src/db/client";

const db = getDb();
const rows = db
  .prepare(
    "SELECT source, category, COUNT(*) as count, MIN(published_at) as earliest, MAX(published_at) as latest FROM feed_items GROUP BY source, category ORDER BY category"
  )
  .all() as Record<string, unknown>[];
console.table(rows);
