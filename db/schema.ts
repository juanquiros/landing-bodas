import { index, integer, sqliteTable, text } from "drizzle-orm/sqlite-core";

export const rsvps = sqliteTable("rsvps", {
  id: text("id").primaryKey(),
  weddingSlug: text("wedding_slug").notNull(),
  fullName: text("full_name").notNull(),
  attending: text("attending", { enum: ["yes", "no"] }).notNull(),
  guestCount: integer("guest_count").notNull(),
  dietary: text("dietary"),
  message: text("message"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  index("rsvps_wedding_slug_idx").on(table.weddingSlug),
  index("rsvps_attending_idx").on(table.attending),
  index("rsvps_created_at_idx").on(table.createdAt),
]);

export const songRequests = sqliteTable("song_requests", {
  id: text("id").primaryKey(),
  weddingSlug: text("wedding_slug").notNull(),
  guestName: text("guest_name").notNull(),
  artist: text("artist").notNull(),
  title: text("title").notNull(),
  link: text("link"),
  createdAt: integer("created_at", { mode: "timestamp_ms" }).notNull(),
}, (table) => [
  index("song_requests_wedding_slug_idx").on(table.weddingSlug),
  index("song_requests_created_at_idx").on(table.createdAt),
]);

export type RsvpRow = typeof rsvps.$inferSelect;
export type SongRequestRow = typeof songRequests.$inferSelect;
