const VERIFY_URL = "https://challenges.cloudflare.com/turnstile/v0/siteverify";

type TurnstileResult = { success?: boolean };

export async function verifyTurnstile(token: string, remoteIp?: string) {
  if (process.env.NODE_ENV !== "production" && process.env.TURNSTILE_DEV_BYPASS === "true") return true;

  const secret = process.env.TURNSTILE_SECRET_KEY;
  if (!secret || !token) return false;

  const body = new URLSearchParams({ secret, response: token });
  if (remoteIp) body.set("remoteip", remoteIp);

  try {
    const response = await fetch(VERIFY_URL, {
      method: "POST",
      body,
      cache: "no-store",
    });
    if (!response.ok) return false;
    const result = await response.json() as TurnstileResult;
    return result.success === true;
  } catch (error) {
    console.error("Turnstile verification failed", error);
    return false;
  }
}
