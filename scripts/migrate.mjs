import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { existsSync, mkdirSync } from "node:fs";
import path from "node:path";
import { loadEnvFile } from "node:process";

if (!process.env.DATABASE_PATH) {
  for (const candidate of [".env.local", ".env"]) {
    if (existsSync(candidate)) {
      loadEnvFile(candidate);
      if (process.env.DATABASE_PATH) break;
    }
  }
}

const databasePath = path.resolve(process.env.DATABASE_PATH || "./data/wedding.db");
mkdirSync(path.dirname(databasePath), { recursive: true });

const sqlite = new Database(databasePath);
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
sqlite.pragma("busy_timeout = 5000");

try {
  migrate(drizzle(sqlite), { migrationsFolder: path.resolve("./drizzle") });
  console.log(`SQLite migrations applied to ${databasePath}`);
} finally {
  sqlite.close();
}
