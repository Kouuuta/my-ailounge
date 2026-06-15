import { NextRequest, NextResponse } from "next/server";
import { getDb } from "@/src/db/client";

export async function GET(req: NextRequest) {
  const db = getDb();
  const { searchParams } = new URL(req.url);

  const source = searchParams.get("source");
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const q = searchParams.get("q");
  const is_read = searchParams.get("is_read");
  const is_pinned = searchParams.get("is_pinned");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

  const conditions: string[] = [];
  const params: Record<string, string | number> = {};

  if (source) {
    conditions.push("source = @source");
    params.source = source;
  }
  if (category) {
    conditions.push("category = @category");
    params.category = category;
  }
  if (tag) {
    conditions.push("tags LIKE @tag");
    params.tag = `%${tag}%`;
  }
  if (q) {
    conditions.push("title LIKE @q");
    params.q = `%${q}%`;
  }
  if (is_read === "0" || is_read === "1") {
    conditions.push("is_read = @is_read");
    params.is_read = parseInt(is_read);
  }
  if (is_pinned === "0" || is_pinned === "1") {
    conditions.push("is_pinned = @is_pinned");
    params.is_pinned = parseInt(is_pinned);
  }

  const where = conditions.length ? "WHERE " + conditions.join(" AND ") : "";

  const countStmt = db.prepare(`SELECT COUNT(*) as total FROM feed_items ${where}`);
  const { total } = countStmt.get(params) as { total: number };

  const stmt = db.prepare(
    `SELECT * FROM feed_items ${where} ORDER BY is_pinned DESC, published_at DESC, fetched_at DESC LIMIT @limit OFFSET @offset`
  );
  const items = stmt.all({ ...params, limit, offset });

  return NextResponse.json({ items, total, limit, offset });
}

export async function POST(req: NextRequest) {
  const db = getDb();
  const body = await req.json();

  const { title, url, category, source, summary, tags, score } = body;

  if (!title || !url) {
    return NextResponse.json({ error: "title and url are required" }, { status: 400 });
  }

  const stmt = db.prepare(`
    INSERT INTO feed_items (source, category, title, url, summary, tags, score, published_at)
    VALUES (@source, @category, @title, @url, @summary, @tags, @score, datetime('now'))
  `);

  try {
    const result = stmt.run({
      source: source || "manual",
      category: category || "general",
      title,
      url,
      summary: summary || null,
      tags: tags || null,
      score: score || null,
    });
    return NextResponse.json({ ok: true, id: Number(result.lastInsertRowid) }, { status: 201 });
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : "Unknown error";
    if (msg.includes("UNIQUE constraint")) {
      return NextResponse.json({ error: "Duplicate entry (source + url already exists)" }, { status: 409 });
    }
    return NextResponse.json({ error: msg }, { status: 500 });
  }
}
