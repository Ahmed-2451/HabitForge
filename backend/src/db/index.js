import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import * as schema from "./schema.js";

// Initialize the SQLite database
const sqlite = new Database("db.sqlite");
export const db = drizzle(sqlite, { schema });

// Helper function to initialize the database
export async function initializeDatabase() {
  // Create tables if they don't exist
  sqlite.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      email TEXT NOT NULL UNIQUE,
      password TEXT NOT NULL,
      name TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS habits (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT,
      importance INTEGER NOT NULL DEFAULT 5,
      user_id TEXT NOT NULL,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      current_streak INTEGER NOT NULL DEFAULT 0,
      longest_streak INTEGER NOT NULL DEFAULT 0,
      FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS habit_entries (
      id TEXT PRIMARY KEY,
      habit_id TEXT NOT NULL,
      date TEXT NOT NULL,
      completed INTEGER NOT NULL DEFAULT 0,
      created_at INTEGER NOT NULL DEFAULT (unixepoch()),
      FOREIGN KEY (habit_id) REFERENCES habits (id) ON DELETE CASCADE,
      UNIQUE (habit_id, date)
    );
  `);

  // Migrate existing habits table: add missing columns if necessary
  try {
    const tableInfo = sqlite.prepare("PRAGMA table_info('habits')").all();
    const hasDescription = tableInfo.some(col => col.name === 'description');
    if (!hasDescription) {
      console.log('Migrating: adding description column to habits table');
      sqlite.exec("ALTER TABLE habits ADD COLUMN description TEXT");
    }
    const hasImportance = tableInfo.some(col => col.name === 'importance');
    if (!hasImportance) {
      console.log('Migrating: adding importance column to habits table');
      sqlite.exec("ALTER TABLE habits ADD COLUMN importance INTEGER NOT NULL DEFAULT 5");
    }
  } catch (error) {
    console.error('Migration error:', error);
  }

  console.log("Database initialized successfully");
} 