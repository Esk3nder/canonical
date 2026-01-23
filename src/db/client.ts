import Database from 'better-sqlite3'
import { drizzle } from 'drizzle-orm/better-sqlite3'
import * as schema from './schema'
import path from 'path'
import fs from 'fs'

// Database file path
const DB_PATH = process.env.DATABASE_URL || path.join(process.cwd(), 'data', 'staking.db')

// Ensure data directory exists
const dataDir = path.dirname(DB_PATH)
if (!fs.existsSync(dataDir)) {
  fs.mkdirSync(dataDir, { recursive: true })
}

// Create SQLite database connection
const sqlite = new Database(DB_PATH)

// Enable foreign keys
sqlite.pragma('foreign_keys = ON')

// Create Drizzle ORM instance with schema
export const db = drizzle(sqlite, { schema })

// Export raw sqlite connection for migrations
export const rawDb = sqlite

// Helper to close connection (useful for tests)
export function closeDb() {
  sqlite.close()
}

// Helper to get a fresh in-memory database for tests
export function createTestDb() {
  const testSqlite = new Database(':memory:')
  testSqlite.pragma('foreign_keys = ON')
  return drizzle(testSqlite, { schema })
}
