import { supabase } from "@/src/db/supabase-client";

export const dynamic = "force-dynamic";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    const { data: item } = await supabase
      .from("repo_radar_items")
      .select("*")
      .eq("id", Number(id))
      .single();

    if (!item) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    const allowed = ["notes", "is_active"];
    const updates: Record<string, string | number | null> = {};

    for (const field of allowed) {
      if (body[field] !== undefined) {
        updates[field] = body[field] as string | number;
      }
    }

    if (Object.keys(updates).length === 0) {
      return Response.json({ error: "No valid fields provided" }, { status: 400 });
    }

    updates.updated_at = new Date().toISOString();
    await supabase.from("repo_radar_items").update(updates).eq("id", Number(id));

    const { data: updated } = await supabase
      .from("repo_radar_items")
      .select("*")
      .eq("id", Number(id))
      .single();

    return Response.json({ ok: true, item: updated });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}

export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;

    const { data: item } = await supabase
      .from("repo_radar_items")
      .select("id")
      .eq("id", Number(id))
      .single();

    if (!item) {
      return Response.json({ error: "Not found" }, { status: 404 });
    }

    await supabase.from("repo_radar_items").delete().eq("id", Number(id));
    return Response.json({ ok: true });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
