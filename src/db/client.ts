import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Database connection string from environment
const connectionString = process.env.DATABASE_URL

if (!connectionString) {
  throw new Error('DATABASE_URL environment variable is required')
}

// Create postgres client for queries
const queryClient = postgres(connectionString)

// Create Drizzle ORM instance with schema
export const db = drizzle(queryClient, { schema })

// Export postgres client for migrations (uses single connection)
export function createMigrationClient() {
  return postgres(connectionString!, { max: 1 })
}

// Helper to create a test database connection
export function createTestDb(testConnectionString: string) {
  const client = postgres(testConnectionString)
  return drizzle(client, { schema })
}

// Helper to close all connections (useful for tests/cleanup)
export async function closeDb() {
  await queryClient.end()
}
