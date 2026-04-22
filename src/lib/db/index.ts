import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import * as schema from "./schema";

const connectionString =
  process.env.DATABASE_URL || process.env.POSTGRES_URL || "";

if (!connectionString && process.env.NODE_ENV !== "development") {
  console.warn("[db] DATABASE_URL not set — DB queries will fail");
}

// Pool caching across Next.js dev reloads avoids leaking connections.
declare global {
  // eslint-disable-next-line no-var
  var __pg_pool: Pool | undefined;
}

const pool =
  global.__pg_pool ??
  new Pool({
    connectionString,
    ssl: connectionString.includes("sslmode=require")
      ? { rejectUnauthorized: false }
      : undefined,
  });

if (process.env.NODE_ENV !== "production") global.__pg_pool = pool;

export const db = drizzle(pool, { schema });
export { schema };
