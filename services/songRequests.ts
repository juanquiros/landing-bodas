export type PublicSong = { title: string; artist: string };
export type SongRequestInput = {
  guestName: string;
  artist: string;
  title: string;
  link?: string;
  turnstileToken: string;
  honeypot: string;
};

export const songRequests = {
  async all(): Promise<PublicSong[]> {
    const response = await fetch("/api/song-requests/public", { cache: "no-store" });
    if (!response.ok) return [];
    const result = await response.json() as { songs?: PublicSong[] };
    return result.songs ?? [];
  },
  async add(input: SongRequestInput) {
    const response = await fetch("/api/song-requests", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(input),
    });
    const result = await response.json() as { ok: boolean; message?: string };
    if (!response.ok) throw new Error(result.message || "No pudimos registrar tu canción. Intentá nuevamente.");
    return result;
  },
};
