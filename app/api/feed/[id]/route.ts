import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/src/db/supabase-client";

export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const body = await req.json();

  const { data: item } = await supabase.from("feed_items").select("*").eq("id", Number(id)).single();
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  const updates: Record<string, string | number | boolean | null> = {};

  for (const field of ["title", "summary", "tags", "category", "score"] as const) {
    if (body[field] !== undefined) updates[field] = body[field];
  }

  if (body.is_read !== undefined) updates.is_read = body.is_read ? 1 : 0;
  if (body.is_pinned !== undefined) updates.is_pinned = body.is_pinned ? 1 : 0;

  if (Object.keys(updates).length === 0) {
    return NextResponse.json({ error: "No fields to update" }, { status: 400 });
  }

  await supabase.from("feed_items").update(updates).eq("id", Number(id));

  const { data: updated } = await supabase.from("feed_items").select("*").eq("id", Number(id)).single();
  return NextResponse.json({ ok: true, item: updated });
}

export async function DELETE(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const { data: item } = await supabase.from("feed_items").select("id").eq("id", Number(id)).single();
  if (!item) {
    return NextResponse.json({ error: "Item not found" }, { status: 404 });
  }

  await supabase.from("feed_items").delete().eq("id", Number(id));
  return NextResponse.json({ ok: true });
}
