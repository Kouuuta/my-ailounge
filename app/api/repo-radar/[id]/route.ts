import { getDb } from "@/src/db/client";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const item = db
      .prepare("SELECT * FROM repo_radar_items WHERE id = ?")
      .get(id) as { id: number } | undefined;

    if (!item) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const allowed = ["notes", "is_active"];
    const sets: string[] = [];
    const values: Record<string, string | number | null> = { id: Number(id) };

    for (const field of allowed) {
      if (body[field] !== undefined) {
        sets.push(`${field} = @${field}`);
        values[field] = body[field] as string | number;
      }
    }

    if (sets.length === 0) {
      return Response.json({ error: "No valid fields provided" }, { status: 400 });
    }

    sets.push("updated_at = datetime('now')");
    db.prepare(`UPDATE repo_radar_items SET ${sets.join(", ")} WHERE id = @id`).run(values);

    const updated = db
      .prepare("SELECT * FROM repo_radar_items WHERE id = ?")
      .get(id);

    return Response.json({ ok: true, item: updated });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const db = getDb();

    const item = db
      .prepare("SELECT id FROM repo_radar_items WHERE id = ?")
      .get(id) as { id: number } | undefined;

    if (!item) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    db.prepare("DELETE FROM repo_radar_items WHERE id = ?").run(id);
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
