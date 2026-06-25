import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/src/db/supabase-client";

export async function GET(
  _req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  const { data: rows } = await supabase
    .from("log_patterns")
    .select("*")
    .eq("analysis_id", Number(id))
    .order("count", { ascending: false });

  return NextResponse.json({ patterns: rows ?? [] });
}
