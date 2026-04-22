import { db } from "../src/lib/db";
import { sql } from "drizzle-orm";

async function main() {
  const rows = await db.execute(
    sql`SELECT tablename FROM pg_tables WHERE schemaname='public' ORDER BY tablename`,
  );
  console.log("tables:", rows.rows.map((r) => r.tablename).join(", "));
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
