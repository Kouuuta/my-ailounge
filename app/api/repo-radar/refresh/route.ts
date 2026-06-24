import { refreshAll } from "@/src/lib/repo-radar";

export const dynamic = "force-dynamic";

export async function POST() {
  try {
    const result = await refreshAll();
    return Response.json({ ok: true, ...result });
  } catch (err) {
    return Response.json({ error: String(err) }, { status: 500 });
  }
}
