import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/src/db/client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const db = getDb();

  const rows = db
    .prepare("SELECT * FROM log_anomalies WHERE analysis_id = ? ORDER BY deviation DESC")
    .all(id);

  return NextResponse.json({ anomalies: rows });
}
