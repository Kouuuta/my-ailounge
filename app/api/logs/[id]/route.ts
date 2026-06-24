import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/src/db/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getDb();

  const analysis = db
    .prepare("SELECT * FROM log_analyses WHERE id = ?")
    .get(id) as Record<string, unknown> | undefined;

  if (!analysis) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  const errorCount = (
    db
      .prepare("SELECT COUNT(*) as count FROM log_errors WHERE analysis_id = ? AND is_error = 1")
      .get(id) as { count: number }
  ).count;

  const patternCount = (
    db
      .prepare("SELECT COUNT(*) as count FROM log_patterns WHERE analysis_id = ?")
      .get(id) as { count: number }
  ).count;

  const anomalyCount = (
    db
      .prepare("SELECT COUNT(*) as count FROM log_anomalies WHERE analysis_id = ?")
      .get(id) as { count: number }
  ).count;

  const dailyCounts = db
    .prepare(
      "SELECT substr(timestamp,1,10) as day, COUNT(*) as count FROM log_errors WHERE analysis_id = ? AND is_error = 1 GROUP BY day ORDER BY day",
    )
    .all(id) as { day: string; count: number }[];

  return NextResponse.json({ ...analysis, errorCount, patternCount, anomalyCount, dailyCounts });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getDb();

  const result = db.prepare("DELETE FROM log_analyses WHERE id = ?").run(id);

  if (result.changes === 0) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  return NextResponse.json({ ok: true });
}
