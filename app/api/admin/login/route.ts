import { NextResponse } from "next/server";
import { ADMIN_COOKIE_NAME, adminCookieOptions, signAdminSession, validateAdminCredentials } from "@/lib/admin-auth";
import { adminLoginSchema } from "@/lib/validation";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const parsed = adminLoginSchema.safeParse(await request.json());
    if (!parsed.success || !validateAdminCredentials(parsed.data.username, parsed.data.password)) {
      return NextResponse.json({ ok: false, message: "Usuario o contraseña incorrectos." }, { status: 401 });
    }
    const secret = process.env.ADMIN_SESSION_SECRET;
    if (!secret) {
      console.error("ADMIN_SESSION_SECRET is not configured");
      return NextResponse.json({ ok: false, message: "El panel no está configurado." }, { status: 500 });
    }
    const response = NextResponse.json({ ok: true });
    response.cookies.set(ADMIN_COOKIE_NAME, signAdminSession(parsed.data.username, secret), adminCookieOptions());
    return response;
  } catch {
    return NextResponse.json({ ok: false, message: "Solicitud inválida." }, { status: 400 });
  }
}
