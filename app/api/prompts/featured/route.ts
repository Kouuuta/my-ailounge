import { getDb } from "@/src/db/client";

export const dynamic = "force-dynamic";

export async function GET() {
  const db = getDb();

  const dayOfYear = Math.floor(
    (Date.now() - new Date(Date.now()).getTime()) / 86400000 +
      (Date.UTC(new Date().getFullYear(), 0, 0) - 0) / 86400000,
  );

  const count = db.prepare("SELECT COUNT(*) as count FROM prompts WHERE is_featured = 1 AND source = 'curated'").get() as { count: number };

  if (count.count === 0) {
    const anyPrompt = db.prepare("SELECT * FROM prompts WHERE source = 'curated' ORDER BY usage_count DESC LIMIT 1").get();
    return Response.json({ item: anyPrompt ?? null });
  }

  const offset = dayOfYear % count.count;
  const item = db.prepare("SELECT * FROM prompts WHERE is_featured = 1 AND source = 'curated' ORDER BY id LIMIT 1 OFFSET ?").get(offset);
  return Response.json({ item: item ?? null });
}
