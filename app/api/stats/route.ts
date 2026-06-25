import { supabase } from "@/src/db/supabase-client";
import { getItemsToday, getItemsThisWeek, getLastGlobalIngestion, getIngestionStatus } from "@/src/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  const { count: totalItems } = await supabase
    .from("feed_items")
    .select("*", { count: "exact", head: true })
    .neq("source", "manual");

  const [lastIngest, itemsToday, itemsThisWeek, statuses] = await Promise.all([
    getLastGlobalIngestion(),
    getItemsToday(),
    getItemsThisWeek(),
    getIngestionStatus(),
  ]);
  const errors = statuses.filter((s) => s.status === "error").length;

  return Response.json({
    totalItems: totalItems ?? 0,
    lastIngest,
    itemsToday,
    itemsThisWeek,
    errors,
  });
}
