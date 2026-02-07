import { drizzle } from 'drizzle-orm/postgres-js'
import postgres from 'postgres'
import * as schema from './schema'

// Lazy-initialized clients (avoids build-time errors when POSTGRES_URL is not set)
let queryClient: ReturnType<typeof postgres> | null = null
let dbInstance: ReturnType<typeof drizzle<typeof schema>> | null = null

function getConnectionString(): string {
  const url = process.env.POSTGRES_URL
  if (!url) {
    throw new Error('POSTGRES_URL environment variable is required')
  }
  return url
}

// Create Drizzle ORM instance with schema (lazy initialization)
export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_, prop) {
    if (!dbInstance) {
      queryClient = postgres(getConnectionString())
      dbInstance = drizzle(queryClient, { schema })
    }

    if (typeof prop === 'symbol') {
      return Reflect.get(dbInstance as object, prop)
    }

    return dbInstance[prop as keyof typeof dbInstance]
  },
})

// Helper to close all connections (useful for tests/cleanup)
export async function closeDb() {
  if (queryClient) {
    await queryClient.end()
    queryClient = null
    dbInstance = null
  }
}
