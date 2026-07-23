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
): string {
  const num = parseInt(pid, 10);
  if (!isNaN(num)) {
    const row = db
      .prepare("SELECT pattern_key FROM log_patterns WHERE id = ? AND analysis_id = ?")
      .get(num, analysisId) as { pattern_key: string } | undefined;
    if (row && row.pattern_key) return row.pattern_key;
  }
  return pid;
}

function queryPatternRows(
  db: ReturnType<typeof getDb>,
  analysisId: number,
  patternKey: string,
) {
  const byKey = db
    .prepare(
      "SELECT id, method, action, content, error_type, error_code, raw_message, timestamp, is_error FROM log_errors WHERE analysis_id = ? AND pattern_key = ? ORDER BY timestamp",
    )
    .all(analysisId, patternKey) as Array<{
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
    .prepare(
      "SELECT id, method, action, content, error_type, error_code, raw_message, timestamp, is_error FROM log_errors WHERE analysis_id = ? AND pattern_key LIKE ? ESCAPE '\\' ORDER BY timestamp",
    )
    .all(analysisId, prefix) as typeof byKey;
  if (byPrefix.length > 0) return byPrefix;

  const like = patternToLike(patternKey);
  return db
    .prepare(
      "SELECT id, method, action, content, error_type, error_code, raw_message, timestamp, is_error FROM log_errors WHERE analysis_id = ? AND error_type LIKE ? ESCAPE '\\' ORDER BY timestamp",
    )
    .all(analysisId, like) as typeof byKey;
}

function describePattern(pid: string): string {
  const noVar = pid.replace(/\{var\}/g, "");
  const key = noVar.replace(/-/g, " ").trim();
  return key.charAt(0).toUpperCase() + key.slice(1) || pid;
}

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string; pid: string }> },
) {
  const { id, pid } = await params;
  const db = getDb();

  const analysis = db
    .prepare("SELECT id FROM log_analyses WHERE id = ?")
    .get(id) as { id: number } | undefined;
  if (!analysis) {
    return NextResponse.json({ error: "Analysis not found" }, { status: 404 });
  }

  const patternKey = resolvePatternKey(db, Number(id), pid);
  const rows = queryPatternRows(db, Number(id), patternKey);
  if (rows.length === 0) {
    return NextResponse.json({ error: "Pattern not found" }, { status: 404 });
  }

  const methods: Array<{ method: string; count: number }> = [];
  const methodCount = new Map<string, number>();
  for (const r of rows) {
    if (r.method) methodCount.set(r.method, (methodCount.get(r.method) || 0) + 1);
  }
  for (const [method, count] of methodCount) {
    methods.push({ method, count });
  }

  const timeline: Array<{ date: string; count: number }> = [];
  const dateCount = new Map<string, number>();
  for (const r of rows) {
    const d = r.timestamp ? r.timestamp.substring(0, 10) : "unknown";
    dateCount.set(d, (dateCount.get(d) || 0) + 1);
  }
  for (const [date, count] of dateCount) {
    timeline.push({ date, count });
  }
  timeline.sort((a, b) => a.date.localeCompare(b.date));

  return NextResponse.json({
    pattern_key: patternKey,
    description: describePattern(patternKey),
    total: rows.length,
    errors_only: rows.filter((r) => r.is_error).length,
    timeline,
    methods,
  });
}
