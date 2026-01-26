import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Database connection string from environment
const connectionString = process.env.DATABASE_URL

// Lazy-initialized clients (avoids build-time errors)
let queryClient: ReturnType<typeof postgres> | null = null
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null

function getConnectionString(): string {
  if (!connectionString) {
    throw new Error('DATABASE_URL environment variable is required')
  }
  return connectionString
}

// Create Drizzle ORM instance with schema (lazy initialization)
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    if (!dbInstance) {
      queryClient = postgres(getConnectionString())
      dbInstance = drizzle(queryClient, { schema })
    }
    return (dbInstance as any)[prop]
  },
})

// Export postgres client for migrations (uses single connection)
export function createMigrationClient() {
  return postgres(getConnectionString(), { max: 1 })
}

// Helper to create a test database connection
export function createTestDb(testConnectionString: string) {
  const client = postgres(testConnectionString)
  return drizzle(client, { schema })
}

// Helper to close all connections (useful for tests/cleanup)
export async function closeDb() {
  if (queryClient) {
    await queryClient.end()
    queryClient = null
    dbInstance = null
  }
}
