import { getDb } from "@/src/db/client";
import { getItemsToday, getItemsThisWeek, getLastGlobalIngestion, getIngestionStatus } from "@/src/lib/analytics";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();

  const totalItems = (
    db.prepare("SELECT COUNT(*) as count FROM feed_items WHERE source != 'manual'").get() as { count: number }
  ).count;

  const lastIngest = getLastGlobalIngestion();
  const itemsToday = getItemsToday();
  const itemsThisWeek = getItemsThisWeek();
  const statuses = getIngestionStatus();
  const errors = statuses.filter((s) => s.status === "error").length;

  return Response.json({
    totalItems,
    lastIngest,
    itemsToday,
    itemsThisWeek,
    errors,
  });
}
