import { NextResponse } from "next/server";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const res = await db.execute(sql`
      SELECT url, title, company, location, remote, source, posted_at
      FROM jobs_central
      WHERE url IS NOT NULL AND title IS NOT NULL AND company IS NOT NULL
      ORDER BY posted_at DESC NULLS LAST
      LIMIT 3000
    `);
    const rows = Array.isArray(res) ? res : res.rows;
    return NextResponse.json(
      { count: rows.length, jobs: rows },
      { headers: { "cache-control": "no-store" } },
    );
  } catch (err) {
    console.error("[api/jobs] query failed", err);
    return NextResponse.json(
      { error: "jobs query failed" },
      { status: 500 },
    );
  }
}
