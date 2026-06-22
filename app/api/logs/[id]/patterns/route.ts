import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/src/db/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getDb();

  const rows = db
    .prepare("SELECT * FROM log_patterns WHERE analysis_id = ? ORDER BY count DESC")
    .all(id);

  return NextResponse.json({ patterns: rows });
}
