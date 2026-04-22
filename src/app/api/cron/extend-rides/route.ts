import { NextResponse, type NextRequest } from "next/server";
import { seedUpcomingWeekends } from "@/lib/ride-seed";

export const runtime = "nodejs";
export const maxDuration = 30;

// Keeps a 13-week horizon of weekend ride slots live.
// Scheduled in vercel.json (monthly, 1st of the month at 3 AM UTC).
// Idempotent — re-running just skips days that already exist.

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  try {
    const { inserted, skipped } = await seedUpcomingWeekends(13);
    console.log(
      `[cron/extend-rides] inserted=${inserted.length} skipped=${skipped.length}`,
    );
    return NextResponse.json({
      ok: true,
      inserted: inserted.length,
      skipped: skipped.length,
      insertedDates: inserted,
    });
  } catch (err) {
    console.error("[cron/extend-rides] failed:", err);
    return NextResponse.json(
      {
        ok: false,
        error: err instanceof Error ? err.message : String(err),
      },
      { status: 500 },
    );
  }
}
