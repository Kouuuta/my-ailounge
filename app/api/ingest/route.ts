import { NextResponse } from "next/server";
import { runAll } from "@/src/ingesters/run-all";

export async function POST() {
  try {
    const result = await runAll({ closeDb: false });
    return NextResponse.json(result);
  } catch (err) {
    return NextResponse.json(
      { error: String(err) },
      { status: 500 },
    );
  }
}
