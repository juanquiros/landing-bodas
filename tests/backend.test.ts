import assert from "node:assert/strict";
import { mkdirSync, mkdtempSync, rmSync, writeFileSync } from "node:fs";
import os from "node:os";
import path from "node:path";
import { after, before, describe, it } from "node:test";
import { PDFDocument } from "pdf-lib";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { createDatabase, WeddingDatabase } from "../db/index";
import { generateWeddingReport } from "../lib/report-pdf";
import { signAdminSession, validateAdminCredentials, verifyAdminSession } from "../lib/admin-auth";
import { rsvpPayloadSchema, songRequestPayloadSchema } from "../lib/validation";
import { getWeddingSummary, insertRsvp, insertSongRequest, listPublicSongs, listRsvps, listSongRequests } from "../lib/wedding-data";

describe("backend wedding", () => {
  const directory = mkdtempSync(path.join(os.tmpdir(), "wedding-backend-"));
  const connection = createDatabase(path.join(directory, "test.db"));
  let database: WeddingDatabase;

  before(() => {
    database = connection.db;
    migrate(database, { migrationsFolder: path.resolve("drizzle") });
  });

  after(() => {
    connection.sqlite.close();
    rmSync(directory, { recursive: true, force: true });
  });

  it("validates RSVP and song payloads", () => {
    assert.equal(rsvpPayloadSchema.safeParse({ fullName: "Ana Pérez", attending: "yes", guestCount: 2, dietary: "", message: "", turnstileToken: "test", honeypot: "" }).success, true);
    assert.equal(rsvpPayloadSchema.safeParse({ fullName: "A", attending: "maybe", guestCount: 99, turnstileToken: "" }).success, false);
    assert.equal(songRequestPayloadSchema.safeParse({ guestName: "Juan", artist: "Soda Stereo", title: "Persiana americana", link: "https://example.com/song", turnstileToken: "test", honeypot: "" }).success, true);
    assert.equal(songRequestPayloadSchema.safeParse({ guestName: "J", artist: "", title: "", link: "invalid", turnstileToken: "" }).success, false);
  });

  it("signs, verifies and expires admin sessions safely", () => {
    const secret = "a-secret-value-long-enough-for-testing";
    const token = signAdminSession("admin", secret, 1_000, 60);
    assert.equal(verifyAdminSession(token, secret, 2_000)?.username, "admin");
    assert.equal(verifyAdminSession(token, secret, 62_000), null);
    assert.equal(verifyAdminSession(`${token}x`, secret, 2_000), null);
    assert.equal(validateAdminCredentials("admin", "correct", "admin", "correct"), true);
    assert.equal(validateAdminCredentials("admin", "wrong", "admin", "correct"), false);
  });

  it("persists RSVP and calculates the correct guest summary", () => {
    insertRsvp({ fullName: "Ana Pérez", attending: "yes", guestCount: 3, dietary: "Sin gluten", message: "Allí estaremos" }, database);
    insertRsvp({ fullName: "Luis Gómez", attending: "no", guestCount: 1 }, database);
    const rows = listRsvps(database);
    const summary = getWeddingSummary(database);
    assert.equal(rows.length, 2);
    assert.deepEqual(summary, { yes: 1, no: 1, guests: 3, songs: 0 });
  });

  it("persists songs and keeps the public response sanitized", () => {
    insertSongRequest({ guestName: "Invitado privado", title: "De música ligera", artist: "Soda Stereo", link: "https://example.com" }, database);
    const adminRows = listSongRequests(database);
    const publicRows = listPublicSongs(database);
    assert.equal(adminRows[0].guestName, "Invitado privado");
    assert.deepEqual(publicRows[0], { title: "De música ligera", artist: "Soda Stereo" });
    assert.equal("guestName" in publicRows[0], false);
  });

  it("generates a paginated PDF with multiple records", async () => {
    const baseRsvp = listRsvps(database)[0];
    const baseSong = listSongRequests(database)[0];
    const bytes = await generateWeddingReport({
      generatedAt: new Date("2026-09-21T15:00:00Z"),
      summary: { yes: 28, no: 4, guests: 54, songs: 24 },
      rsvps: Array.from({ length: 32 }, (_, index) => ({ ...baseRsvp, id: `r-${index}`, fullName: `Invitado ${index}`, message: `Mensaje de prueba ${index} con texto suficiente para verificar el ajuste de línea.` })),
      songs: Array.from({ length: 24 }, (_, index) => ({ ...baseSong, id: `s-${index}`, guestName: `Invitado ${index}`, title: `Tema ${index}` })),
    });
    assert.equal(Buffer.from(bytes).subarray(0, 4).toString(), "%PDF");
    assert.ok(bytes.length > 1_000);
    const document = await PDFDocument.load(bytes);
    assert.ok(document.getPageCount() > 1);
    if (process.env.PDF_SAMPLE_PATH) {
      const outputPath = path.resolve(process.env.PDF_SAMPLE_PATH);
      mkdirSync(path.dirname(outputPath), { recursive: true });
      writeFileSync(outputPath, bytes);
    }
  });
});
