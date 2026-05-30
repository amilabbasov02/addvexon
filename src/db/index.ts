import "dotenv/config";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

if (!process.env.DATABASE_URL) {
  throw new Error("DATABASE_URL is not set");
}

/**
 * Singleton Postgres connection pool. Survives Next.js hot reloads in dev.
 */
declare global {
  // eslint-disable-next-line no-var
  var __addvoxen_pg_pool: Pool | undefined;
}

const pool =
  globalThis.__addvoxen_pg_pool ??
  new Pool({
    connectionString: process.env.DATABASE_URL,
    max: 10,
    idleTimeoutMillis: 30_000,
  });

if (process.env.NODE_ENV !== "production") {
  globalThis.__addvoxen_pg_pool = pool;
}

export const db = drizzle(pool, { schema });
export { schema };
