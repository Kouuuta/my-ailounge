import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/src/db/client";

const VALID_FIELDS = [
  "name", "category", "installed_version", "latest_version",
  "risk_level", "upgrade_notes", "known_vulns", "migration_link",
] as const;

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const body = await req.json();

  const item = db.prepare("SELECT * FROM watchlist_items WHERE id = @id").get({ id: Number(id) }) as Record<string, unknown> | undefined;
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const updates: string[] = [];
  const updateParams: Record<string, string | number> = { id: Number(id) };

  for (const field of VALID_FIELDS) {
    if (body[field] !== undefined) {
      updates.push(`${field} = @${field}`);
      updateParams[field] = body[field];
    }
  }

  if (body.risk_level !== undefined) {
    const validRisk = ["low", "medium", "high"];
    if (!validRisk.includes(body.risk_level)) {
      return NextResponse.json({ error: "risk_level must be low, medium, or high" }, { status: 400 });
    }
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  updates.push("updated_at = datetime('now')");

  db.prepare(`UPDATE watchlist_items SET ${updates.join(", ")} WHERE id = @id`).run(updateParams);

  const updated = db.prepare("SELECT * FROM watchlist_items WHERE id = @id").get({ id: Number(id) });
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;

  const item = db.prepare("SELECT * FROM watchlist_items WHERE id = @id").get({ id: Number(id) }) as Record<string, unknown> | undefined;
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  db.prepare("DELETE FROM watchlist_items WHERE id = @id").run({ id: Number(id) });
  return NextResponse.json({ ok: true });
}
