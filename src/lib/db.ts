import { supabase } from "../db/supabase-client";

export interface IngestEntry {
  source:       string;
  category:     string;
  title:        string;
  url:          string;
  summary?:     string;
  tags?:        string;
  score?:       number;
  published_at: string;
}

export async function upsertEntry(entry: IngestEntry): Promise<"inserted" | "skipped"> {
  const { data: existing } = await supabase
    .from("feed_items")
    .select("id")
    .eq("source", entry.source)
    .eq("url", entry.url)
    .maybeSingle();

  if (existing) return "skipped";

  const { error } = await supabase.from("feed_items").insert({
    source: entry.source,
    category: entry.category,
    title: entry.title,
    url: entry.url,
    summary: entry.summary ?? null,
    tags: entry.tags ?? null,
    score: entry.score ?? null,
    published_at: entry.published_at,
    fetched_at: new Date().toISOString(),
  });

  if (error && error.code === "23505") return "skipped"; // unique violation
  return error ? "skipped" : "inserted";
}
