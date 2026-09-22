import Database from "better-sqlite3";
import { mkdirSync } from "node:fs";
import path from "node:path";
import { drizzle } from "drizzle-orm/better-sqlite3";
import * as schema from "./schema";

export function resolveDatabasePath() {
  const configuredPath = process.env.DATABASE_PATH ?? "./data/wedding.db";
  if (path.isAbsolute(configuredPath)) return configuredPath;
  return path.join(/* turbopackIgnore: true */ process.cwd(), configuredPath);
}

export function createDatabase(databasePath = resolveDatabasePath()) {
  if (databasePath !== ":memory:") mkdirSync(path.dirname(databasePath), { recursive: true });
  const sqlite = new Database(databasePath);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  sqlite.pragma("busy_timeout = 5000");
  return { sqlite, db: drizzle(sqlite, { schema }) };
}

export type WeddingDatabase = ReturnType<typeof createDatabase>["db"];
type DatabaseConnection = ReturnType<typeof createDatabase>;

const globalDatabase = globalThis as typeof globalThis & {
  __weddingDatabase?: DatabaseConnection;
};

export function getDatabase() {
  if (!globalDatabase.__weddingDatabase) globalDatabase.__weddingDatabase = createDatabase();
  return globalDatabase.__weddingDatabase;
}

export function getDb() {
  return getDatabase().db;
}
