import { getDb } from "@/src/db/client";

export const dynamic = "force-dynamic";

export async function POST(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const db = getDb();

  const existing = db.prepare("SELECT id FROM prompts WHERE id = ?").get(id);
  if (!existing) {
    return Response.json({ error: "Prompt not found" }, { status: 404 });
  }

  db.prepare("UPDATE prompts SET usage_count = usage_count + 1, updated_at = datetime('now') WHERE id = ?").run(id);
  const item = db.prepare("SELECT * FROM prompts WHERE id = ?").get(id);
  return Response.json({ ok: true, item });
}
