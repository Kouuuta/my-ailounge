import { supabase } from "./supabase-client";
import { normalizeMessage } from "@/src/lib/log-parser";

const { data: nullRows } = await supabase
  .from("log_errors")
  .select("id, error_type")
  .is("pattern_key", null);

if (!nullRows || nullRows.length === 0) {
  console.log("No rows to backfill.");
  process.exit(0);
}

console.log(`Backfilling ${nullRows.length} rows...`);

let updated = 0;
for (const row of nullRows) {
  const key = normalizeMessage(row.error_type || "unknown");
  const { error } = await supabase
    .from("log_errors")
    .update({ pattern_key: key })
    .eq("id", row.id);
  if (!error) updated++;
}

console.log(`Updated ${updated} rows.`);