import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/src/db/client";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getDb();
  const url = new URL(req.url);
  const limit = Math.min(parseInt(url.searchParams.get("limit") || "50"), 200);
  const offset = Math.max(parseInt(url.searchParams.get("offset") || "0"), 0);
  const isError = url.searchParams.get("is_error");

  let where = "WHERE analysis_id = @id";
  const bindings: Record<string, string | number> = { id: Number(id), limit, offset };

  if (isError === "0" || isError === "1") {
    where += " AND is_error = @is_error";
    bindings.is_error = parseInt(isError);
  }

  const count = (
    db.prepare(`SELECT COUNT(*) as count FROM log_errors ${where}`).get(bindings) as { count: number }
  ).count;

  const rows = db
    .prepare(`SELECT * FROM log_errors ${where} ORDER BY timestamp DESC, id DESC LIMIT @limit OFFSET @offset`)
    .all(bindings);

  return NextResponse.json({ items: rows, total: count, limit, offset });
}
