import { NextRequest, NextResponse } from "next/server";
import { insertSongRequest } from "@/lib/wedding-data";
import { verifyTurnstile } from "@/lib/turnstile";
import { songRequestPayloadSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: NextRequest) {
  try {
    const parsed = songRequestPayloadSchema.safeParse(await request.json());
    if (!parsed.success) return NextResponse.json({ ok: false, message: "Revisá los datos ingresados." }, { status: 400 });
    if (parsed.data.honeypot) return NextResponse.json({ ok: false, message: "No pudimos procesar la solicitud." }, { status: 400 });
    const validCaptcha = await verifyTurnstile(parsed.data.turnstileToken, request.headers.get("x-forwarded-for")?.split(",")[0]?.trim());
    if (!validCaptcha) return NextResponse.json({ ok: false, message: "Completá la verificación de seguridad." }, { status: 403 });

    const { turnstileToken: _, honeypot: __, ...input } = parsed.data;
    void _; void __;
    insertSongRequest(input);
    return NextResponse.json({ ok: true }, { status: 201 });
  } catch (error) {
    console.error("Unable to save song request", error);
    return NextResponse.json({ ok: false, message: "No pudimos registrar tu canción. Intentá nuevamente." }, { status: 500 });
  }
}
