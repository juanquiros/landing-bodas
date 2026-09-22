import { NextResponse } from "next/server";
import { listPublicSongs } from "@/lib/wedding-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  try {
    return NextResponse.json({ ok: true, songs: listPublicSongs() }, { headers: { "Cache-Control": "no-store" } });
  } catch (error) {
    console.error("Unable to load public songs", error);
    return NextResponse.json({ ok: false, songs: [] }, { status: 500 });
  }
}
