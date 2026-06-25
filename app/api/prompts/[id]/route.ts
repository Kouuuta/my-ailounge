import { getDb } from "@/src/db/client";

export const dynamic = "force-dynamic";

export async function GET(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const item = db.prepare("SELECT * FROM prompts WHERE id = ?").get(id);
  if (!item) {
    return Response.json({ error: "Prompt not found" }, { status: 404 });
  }
  return Response.json({ item });
}

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    const db = getDb();

    const existing = db.prepare("SELECT id FROM prompts WHERE id = ?").get(id);
    if (!existing) {
      return Response.json({ error: "Prompt not found" }, { status: 404 });
    }

    const fields = ["title", "content", "category", "description", "input_fields", "output_description", "model_recommendation", "is_featured"];
    const setClauses: string[] = [];
    const values: Record<string, string | number | null> = { id };

    for (const field of fields) {
      if (body[field] !== undefined) {
        setClauses.push(`${field} = @${field}`);
        values[field] = body[field] as string | number | null;
      }
    }

    if (setClauses.length === 0) {
      return Response.json({ error: "No fields to update" }, { status: 400 });
    }

    setClauses.push("updated_at = datetime('now')");
    db.prepare(`UPDATE prompts SET ${setClauses.join(", ")} WHERE id = @id`).run(values);

    const item = db.prepare("SELECT * FROM prompts WHERE id = ?").get(id);
    return Response.json({ ok: true, item });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();
  const existing = db.prepare("SELECT id FROM prompts WHERE id = ?").get(id);
  if (!existing) {
    return Response.json({ error: "Prompt not found" }, { status: 404 });
  }
  db.prepare("DELETE FROM prompts WHERE id = ?").run(id);
  return Response.json({ ok: true });
}
