import { getDb } from "./client";
import { normalizeMessage } from "@/src/lib/log-parser";

const db = getDb();
const nullRows = db.prepare("SELECT id, error_type FROM log_errors WHERE pattern_key IS NULL").all() as { id: number; error_type: string }[];

if (nullRows.length === 0) {
  console.log("No rows to backfill.");
  process.exit(0);
}

console.log(`Backfilling ${nullRows.length} rows...`);

const update = db.prepare("UPDATE log_errors SET pattern_key = ? WHERE id = ?");
let updated = 0;
for (const row of nullRows) {
  const key = normalizeMessage(row.error_type || "unknown");
  update.run(key, row.id);
  updated++;
}

console.log(`Updated ${updated} rows.`);
