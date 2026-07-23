import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/src/db/client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;
  const body = await req.json();

  const item = db.prepare("SELECT * FROM feed_items WHERE id = @id").get({ id: Number(id) }) as Record<string, unknown> | undefined;
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const updates: string[] = [];
  const updateParams: Record<string, string | number> = { id: Number(id) };

  for (const field of ["title", "summary", "tags", "category", "score"] as const) {
    if (body[field] !== undefined) {
      updates.push(`${field} = @${field}`);
      updateParams[field] = body[field];
    }
  }

  if (body.is_read !== undefined) {
    updates.push("is_read = @is_read");
    updateParams.is_read = body.is_read ? 1 : 0;
  }

  if (body.is_pinned !== undefined) {
    updates.push("is_pinned = @is_pinned");
    updateParams.is_pinned = body.is_pinned ? 1 : 0;
  }

  if (updates.length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  db.prepare(`UPDATE feed_items SET ${updates.join(", ")} WHERE id = @id`).run(updateParams);

  const updated = db.prepare("SELECT * FROM feed_items WHERE id = @id").get({ id: Number(id) });
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const db = getDb();
  const { id } = await params;

  const item = db.prepare("SELECT * FROM feed_items WHERE id = @id").get({ id: Number(id) }) as Record<string, unknown> | undefined;
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  db.prepare("DELETE FROM feed_items WHERE id = @id").run({ id: Number(id) });
  return NextResponse.json({ ok: true });
}
