import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/src/db/supabase-client";

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const source = searchParams.get("source");
  const category = searchParams.get("category");
  const tag = searchParams.get("tag");
  const q = searchParams.get("q");
  const is_read = searchParams.get("is_read");
  const is_pinned = searchParams.get("is_pinned");
  const limit = Math.min(parseInt(searchParams.get("limit") || "50"), 200);
  const offset = Math.max(parseInt(searchParams.get("offset") || "0"), 0);

  let query = supabase
    .from("feed_items")
    .select("*", { count: "exact" })
    .neq("source", "manual");

  if (source && source !== "manual") query = query.eq("source", source);
  if (category) query = query.eq("category", category);
  if (tag) query = query.ilike("tags", `%${tag}%`);
  if (q) query = query.ilike("title", `%${q}%`);
  if (is_read === "0" || is_read === "1") query = query.eq("is_read", parseInt(is_read));
  if (is_pinned === "0" || is_pinned === "1") query = query.eq("is_pinned", parseInt(is_pinned));

  query = query
    .order("is_pinned", { ascending: false })
    .order("published_at", { ascending: false })
    .order("fetched_at", { ascending: false })
    .range(offset, offset + limit - 1);

  const { data: items, count: total } = await query;

  return NextResponse.json({ items, total, limit, offset });
}

export async function POST(req: NextRequest) {
  const body = await req.json();
  const { title, url, category, source, summary, tags, score } = body;

  if (!title || !url) {
    return NextResponse.json({ error: "title and url are required" }, { status: 400 });
  }

  const { data, error } = await supabase.from("feed_items").insert({
    source: source || "feed",
    category: category || "general",
    title,
    url,
    summary: summary || null,
    tags: tags || null,
    score: score || null,
    published_at: new Date().toISOString(),
    fetched_at: new Date().toISOString(),
  }).select("id").single();

  if (error) {
    if (error.code === "23505") {
      return NextResponse.json({ error: "Duplicate entry (source + url already exists)" }, { status: 409 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true, id: data.id }, { status: 201 });
}
