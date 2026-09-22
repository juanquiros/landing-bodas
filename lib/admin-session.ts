import { cookies } from "next/headers";
import { ADMIN_COOKIE_NAME, verifyAdminSession } from "./admin-auth";

export async function getCurrentAdminSession() {
  const secret = process.env.ADMIN_SESSION_SECRET;
  if (!secret) return null;
  const token = (await cookies()).get(ADMIN_COOKIE_NAME)?.value;
  return verifyAdminSession(token, secret);
}
