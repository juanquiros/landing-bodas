export type SongRequest = { id: string; guestName: string; artist: string; title: string; link?: string; createdAt: string };
const KEY = "km-song-requests";
export const songRequests = { all(): SongRequest[] { if (typeof window === "undefined") return []; try { return JSON.parse(localStorage.getItem(KEY) || "[]"); } catch { return []; } }, add(request: Omit<SongRequest, "id" | "createdAt">) { const item = { ...request, id: crypto.randomUUID(), createdAt: new Date().toISOString() }; localStorage.setItem(KEY, JSON.stringify([item, ...this.all()])); return item; } };
