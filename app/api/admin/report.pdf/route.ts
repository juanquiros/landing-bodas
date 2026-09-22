import { NextResponse } from "next/server";
import { wedding } from "@/config/wedding";
import { getCurrentAdminSession } from "@/lib/admin-session";
import { generateWeddingReport } from "@/lib/report-pdf";
import { getWeddingSummary, listRsvps, listSongRequests } from "@/lib/wedding-data";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET() {
  if (!await getCurrentAdminSession()) return NextResponse.json({ ok: false, message: "No autorizado." }, { status: 401 });

  const generatedAt = new Date();
  const bytes = await generateWeddingReport({
    generatedAt,
    summary: getWeddingSummary(),
    rsvps: listRsvps(),
    songs: listSongRequests(),
  });
  const date = new Intl.DateTimeFormat("en-CA", { timeZone: "America/Argentina/Buenos_Aires" }).format(generatedAt);
  return new NextResponse(Buffer.from(bytes), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${wedding.slug}-reporte-${date}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
