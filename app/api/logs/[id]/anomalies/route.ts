import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/src/db/client";
import { normalizeMessage } from "@/src/lib/log-parser";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getDb();
  const includePatterns = req.nextUrl.searchParams.get("include_patterns") === "true";
  const fromDate = req.nextUrl.searchParams.get("from_date");
  const toDate = req.nextUrl.searchParams.get("to_date");

  let sql = "SELECT * FROM log_anomalies WHERE analysis_id = ?";
  const queryParams: (string | number)[] = [id];
  if (fromDate && toDate) {
    sql += " AND detected_at >= ? AND detected_at <= ?";
    queryParams.push(fromDate, toDate);
  }
  sql += " ORDER BY deviation DESC";

  const rows = db.prepare(sql).all(...queryParams) as Record<string, unknown>[];

  if (includePatterns && rows.length > 0) {
    const getTopPatterns = db.prepare(`
      SELECT error_type, COUNT(*) as cnt
      FROM log_errors
      WHERE analysis_id = ? AND substr(timestamp,1,10) = ?
        AND is_error = 1
      GROUP BY error_type
      ORDER BY cnt DESC
      LIMIT 3
    `);

    for (const a of rows) {
      const patterns = getTopPatterns.all(id, a.detected_at as string) as { error_type: string; cnt: number }[];
      a.top_patterns = patterns.map((p) => ({
        pattern_key: normalizeMessage(p.error_type),
        raw_sample: p.error_type,
        count: p.cnt,
        percentage: parseFloat(((p.cnt / (a.error_count as number)) * 100).toFixed(1)),
      }));
    }
  }

  return NextResponse.json({ anomalies: rows });
}
