import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/src/db/client";

export async function GET() {
  const db = getDb();
  const items = db.prepare("SELECT * FROM watchlist_items ORDER BY category, name").all();
  return NextResponse.json({ items });
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();

  const { name, category, installed_version, latest_version, risk_level, upgrade_notes } = body;

  if (!name) {
    return NextResponse.json({ error: "name is required" }, { status: 400 });
  }

  const validRisk = ["low", "medium", "high"];
  if (risk_level && !validRisk.includes(risk_level)) {
    return NextResponse.json({ error: "risk_level must be low, medium, or high" }, { status: 400 });
  }

  const stmt = db.prepare(`
    INSERT INTO watchlist_items (name, category, installed_version, latest_version, risk_level, upgrade_notes)
    VALUES (@name, @category, @installed_version, @latest_version, @risk_level, @upgrade_notes)
  `);

  try {
    const result = stmt.run({
      name,
      category: category || null,
      installed_version: installed_version || null,
      latest_version: latest_version || null,
      risk_level: risk_level || "low",
      upgrade_notes: upgrade_notes || null,
    });
    return NextResponse.json({ ok: true, id: Number(result.lastInsertRowid) }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("UNIQUE constraint")) {
      return NextResponse.json({ error: "Item with this name already exists" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
