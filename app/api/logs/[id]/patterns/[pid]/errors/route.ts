import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/src/db/client";

export const dynamic = "force-dynamic";

function patternToLike(pid: string): string {
  return pid.replace(/[%_]/g, "\\$&").replace(/\{var\}/g, "%");
}

function resolvePatternKey(
  db: ReturnType<typeof getDb>,
  analysisId: number,
  pid: string,
): string | null {
  const num = parseInt(pid, 10);
  if (!isNaN(num)) {
    const row = db
      .prepare("SELECT pattern_key FROM log_patterns WHERE id = ? AND analysis_id = ?")
      .get(num, analysisId) as { pattern_key: string } | undefined;
    if (row) return row.pattern_key;
  }
  return pid;
}

function countMatchingRows(
  db: ReturnType<typeof getDb>,
  analysisId: number,
  patternKey: string,
): number {
  const byKey = db
    .prepare("SELECT COUNT(*) AS cnt FROM log_errors WHERE analysis_id = ? AND pattern_key = ?")
    .get(analysisId, patternKey) as { cnt: number };
  if (byKey.cnt > 0) return byKey.cnt;

  const prefix = patternToLike(patternKey.substring(0, 400)) + "%";
  const byPrefix = db
    .prepare(
      "SELECT COUNT(*) AS cnt FROM log_errors WHERE analysis_id = ? AND pattern_key LIKE ? ESCAPE '\\'",
    )
    .get(analysisId, prefix) as { cnt: number };
  if (byPrefix.cnt > 0) return byPrefix.cnt;

  const like = patternToLike(patternKey);
  const byLike = db
    .prepare(
      "SELECT COUNT(*) AS cnt FROM log_errors WHERE analysis_id = ? AND error_type LIKE ? ESCAPE '\\'",
    )
    .get(analysisId, like) as { cnt: number };
  return byLike.cnt;
}

function queryErrorRows(
  db: ReturnType<typeof getDb>,
  analysisId: number,
  patternKey: string,
  limit: number,
  offset: number,
) {
  const sql =
    "SELECT id, method, action, content, error_type, error_code, raw_message, timestamp, is_error FROM log_errors WHERE analysis_id = ? AND %s ORDER BY timestamp LIMIT ? OFFSET ?";

  const byKey = db
    .prepare(sql.replace("%s", "pattern_key = ?"))
    .all(analysisId, patternKey, limit, offset) as Array<{
    id: number;
    method: string;
    action: string;
    content: string;
    error_type: string;
    error_code: string;
    raw_message: string;
    timestamp: string;
    is_error: number;
  }>;
  if (byKey.length > 0) return byKey;

  const prefix = patternToLike(patternKey.substring(0, 400)) + "%";
  const byPrefix = db
    .prepare(sql.replace("%s", "pattern_key LIKE ? ESCAPE '\\'"))
    .all(analysisId, prefix, limit, offset) as typeof byKey;
  if (byPrefix.length > 0) return byPrefix;

  const like = patternToLike(patternKey);
  return db
    .prepare(sql.replace("%s", "error_type LIKE ? ESCAPE '\\'"))
    .all(analysisId, like, limit, offset) as typeof byKey;
}

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> },
) {
  const { id, pid } = await params;
  const url = new URL(req.url);
  const page = Math.max(1, parseInt(url.searchParams.get("page") || "1", 10));
  const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get("limit") || "50", 10)));
  const offset = (page - 1) * limit;

  const db = getDb();

  const analysis = db
    .prepare("SELECT id FROM log_analyses WHERE id = ?")
    .get(id) as { id: number } | undefined;
  if (!analysis) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  const patternKey = resolvePatternKey(db, Number(id), pid) ?? pid;
  const total = countMatchingRows(db, Number(id), patternKey);
  if (total === 0) {
    return NextResponse.json({ error: "Pattern not found" }, { status: 404 });
  }

  const rows = queryErrorRows(db, Number(id), patternKey, limit, offset);

  return NextResponse.json({
    rows,
    pagination: {
      page,
      limit,
      total,
      total_pages: Math.ceil(total / limit),
    },
  });
}
