import { createHash, createHmac, timingSafeEqual } from "node:crypto";

export const ADMIN_COOKIE_NAME = "wedding_admin_session";
export const ADMIN_SESSION_SECONDS = 8 * 60 * 60;

export type AdminSession = { username: string; expiresAt: number };

function safeEqual(left: string, right: string) {
  const leftHash = createHash("sha256").update(left).digest();
  const rightHash = createHash("sha256").update(right).digest();
  return timingSafeEqual(leftHash, rightHash);
}

export function validateAdminCredentials(
  username: string,
  password: string,
  expectedUsername = process.env.ADMIN_USERNAME,
  expectedPassword = process.env.ADMIN_PASSWORD,
) {
  if (!expectedUsername || !expectedPassword) return false;
  return safeEqual(username, expectedUsername) && safeEqual(password, expectedPassword);
}

export function signAdminSession(
  username: string,
  secret: string,
  now = Date.now(),
  durationSeconds = ADMIN_SESSION_SECONDS,
) {
  const payload: AdminSession = { username, expiresAt: now + durationSeconds * 1000 };
  const encoded = Buffer.from(JSON.stringify(payload)).toString("base64url");
  const signature = createHmac("sha256", secret).update(encoded).digest("base64url");
  return `${encoded}.${signature}`;
}

export function verifyAdminSession(token: string | undefined, secret: string, now = Date.now()): AdminSession | null {
  if (!token || !secret) return null;
  const [encoded, signature, extra] = token.split(".");
  if (!encoded || !signature || extra) return null;

  const expected = createHmac("sha256", secret).update(encoded).digest("base64url");
  if (!safeEqual(signature, expected)) return null;

  try {
    const payload = JSON.parse(Buffer.from(encoded, "base64url").toString("utf8")) as AdminSession;
    if (typeof payload.username !== "string" || typeof payload.expiresAt !== "number" || payload.expiresAt <= now) return null;
    return payload;
  } catch {
    return null;
  }
}

export function adminCookieOptions() {
  return {
    httpOnly: true,
    sameSite: "strict" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: ADMIN_SESSION_SECONDS,
  };
}
