import { and, desc, eq } from "drizzle-orm";
import { wedding } from "@/config/wedding";
import { getDb, WeddingDatabase } from "@/db";
import { rsvps, songRequests } from "@/db/schema";

export type NewRsvp = {
  fullName: string;
  attending: "yes" | "no";
  guestCount: number;
  dietary?: string;
  message?: string;
};

export type NewSongRequest = {
  guestName: string;
  artist: string;
  title: string;
  link?: string;
};

export function insertRsvp(input: NewRsvp, database: WeddingDatabase = getDb()) {
  const item = { id: crypto.randomUUID(), weddingSlug: wedding.slug, ...input, createdAt: new Date() };
  database.insert(rsvps).values(item).run();
  return item;
}

export function insertSongRequest(input: NewSongRequest, database: WeddingDatabase = getDb()) {
  const item = { id: crypto.randomUUID(), weddingSlug: wedding.slug, ...input, createdAt: new Date() };
  database.insert(songRequests).values(item).run();
  return item;
}

export function listRsvps(database: WeddingDatabase = getDb(), slug = wedding.slug) {
  return database.select().from(rsvps).where(eq(rsvps.weddingSlug, slug)).orderBy(desc(rsvps.createdAt)).all();
}

export function listSongRequests(database: WeddingDatabase = getDb(), slug = wedding.slug) {
  return database.select().from(songRequests).where(eq(songRequests.weddingSlug, slug)).orderBy(desc(songRequests.createdAt)).all();
}

export function listPublicSongs(database: WeddingDatabase = getDb(), slug = wedding.slug) {
  return database.select({ title: songRequests.title, artist: songRequests.artist })
    .from(songRequests)
    .where(eq(songRequests.weddingSlug, slug))
    .orderBy(desc(songRequests.createdAt))
    .limit(5)
    .all();
}

export function getWeddingSummary(database: WeddingDatabase = getDb(), slug = wedding.slug) {
  const responses = database.select({ attending: rsvps.attending, guestCount: rsvps.guestCount })
    .from(rsvps).where(eq(rsvps.weddingSlug, slug)).all();
  const songCount = database.select({ id: songRequests.id }).from(songRequests)
    .where(eq(songRequests.weddingSlug, slug)).all().length;
  return {
    yes: responses.filter((item) => item.attending === "yes").length,
    no: responses.filter((item) => item.attending === "no").length,
    guests: responses.filter((item) => item.attending === "yes").reduce((total, item) => total + item.guestCount, 0),
    songs: songCount,
  };
}

export function findRsvps(attending: "yes" | "no" | undefined, search: string, database: WeddingDatabase = getDb()) {
  const rows = attending
    ? database.select().from(rsvps).where(and(eq(rsvps.weddingSlug, wedding.slug), eq(rsvps.attending, attending))).orderBy(desc(rsvps.createdAt)).all()
    : listRsvps(database);
  const needle = search.trim().toLocaleLowerCase("es-AR");
  return needle ? rows.filter((item) => item.fullName.toLocaleLowerCase("es-AR").includes(needle)) : rows;
}

export function findSongRequests(search: string, database: WeddingDatabase = getDb()) {
  const rows = listSongRequests(database);
  const needle = search.trim().toLocaleLowerCase("es-AR");
  return needle ? rows.filter((item) => [item.guestName, item.title, item.artist].some((value) => value.toLocaleLowerCase("es-AR").includes(needle))) : rows;
}
