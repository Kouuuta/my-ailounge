import { DatabaseSync } from "node:sqlite";
import path from "path";

const DB_PATH = path.join(process.cwd(), "data", "dashboard.db");

let db: DatabaseSync | null = null;

export function getDb(): DatabaseSync {
  if (!db) {
    db = new DatabaseSync(DB_PATH);
    db.exec("PRAGMA journal_mode = WAL");
    db.exec("PRAGMA foreign_keys = ON");
  }
  return db;
}

export function closeDb(): void {
  if (db) {
    db.close();
    db = null;
  }
}
