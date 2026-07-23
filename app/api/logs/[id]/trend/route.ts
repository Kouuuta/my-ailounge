import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/src/db/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const numId = Number(id);
  const fromDate = req.nextUrl.searchParams.get("from_date");
  const toDate = req.nextUrl.searchParams.get("to_date");

  const db = getDb();

  let where = "WHERE analysis_id = @id AND is_error = 1";
  const bindings: Record<string, string | number> = { id: numId };
  if (fromDate && toDate) {
    where += " AND timestamp >= @fromDate AND timestamp <= @toDate";
    bindings.fromDate = fromDate;
    bindings.toDate = toDate;
  }

  const errorRows = db
    .prepare(`SELECT timestamp FROM log_errors ${where} ORDER BY timestamp`)
    .all(bindings) as { timestamp: string | null }[];

  const dayMap = new Map<string, number>();
  for (const row of errorRows) {
    const day = row.timestamp ? row.timestamp.substring(0, 10) : "unknown";
    dayMap.set(day, (dayMap.get(day) ?? 0) + 1);
  }

  const dailyCounts = [...dayMap.entries()]
    .map(([day, count]) => ({ day, count }))
    .sort((a, b) => a.day.localeCompare(b.day));

  return NextResponse.json({ dailyCounts });
}
