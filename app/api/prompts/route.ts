import { getDb } from "@/src/db/client";

export const dynamic = "force-dynamic";

export async function GET(request: Request) {
  const db = getDb();
  const { searchParams } = new URL(request.url);
  const category = searchParams.get("category");
  const search = searchParams.get("search");
  const source = searchParams.get("source");

  let sql = "SELECT * FROM prompts";
  const params: (string | number | null)[] = [];
  const conditions: string[] = [];

  if (category) {
    conditions.push("category = ?");
    params.push(category);
  }
  if (source) {
    conditions.push("source = ?");
    params.push(source);
  }
  if (search) {
    conditions.push("title LIKE ? OR description LIKE ?");
    params.push(`%${search}%`, `%${search}%`);
  }
  if (conditions.length > 0) {
    sql += " WHERE " + conditions.join(" AND ");
  }
  sql += " ORDER BY source = 'curated' DESC, usage_count DESC, created_at DESC";

  const items = db.prepare(sql).all(...params);
  return Response.json({ items });
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, content, category, description, input_fields, output_description, model_recommendation } = body;

    if (!title || !content || !category) {
      return Response.json({ error: "title, content, and category are required" }, { status: 400 });
    }

    const db = getDb();
    const result = db.prepare(`
      INSERT INTO prompts (title, content, category, description, input_fields, output_description, model_recommendation)
      VALUES (@title, @content, @category, @description, @input_fields, @output_description, @model_recommendation)
    `).run({
      title,
      content,
      category,
      description: description ?? null,
      input_fields: input_fields ?? null,
      output_description: output_description ?? null,
      model_recommendation: model_recommendation ?? null,
    });

    const item = db.prepare("SELECT * FROM prompts WHERE id = ?").get(result.lastInsertRowid);
    return Response.json({ ok: true, item }, { status: 201 });
  } catch (err) {
    return Response.json({ error: err instanceof Error ? err.message : String(err) }, { status: 500 });
  }
}
