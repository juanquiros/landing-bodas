export type RsvpInput = {
  fullName: string;
  attending: "yes" | "no";
  guestCount: number;
  dietary: string;
  message: string;
  turnstileToken: string;
  honeypot: string;
};

export const rsvps = {
  async add(input: RsvpInput) {
    const response = await fetch("/api/rsvp", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const result = await response.json() as { ok: boolean; message?: string };
    if (!response.ok) throw new Error(result.message || "No pudimos registrar tu respuesta. Intentá nuevamente.");
    return result;
  },
};
