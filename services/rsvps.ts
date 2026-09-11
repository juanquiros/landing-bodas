export type Rsvp = { fullName: string; attending: "yes" | "no"; guestCount: number; dietary: string; message: string; createdAt: string };
const KEY = "km-rsvps";
export const rsvps = { add(rsvp: Omit<Rsvp, "createdAt">) { const item = { ...rsvp, createdAt: new Date().toISOString() }; const saved: Rsvp[] = JSON.parse(localStorage.getItem(KEY) || "[]"); localStorage.setItem(KEY, JSON.stringify([item, ...saved])); return item; } };
