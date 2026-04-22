// Hand-seed weekend ride slots.
// Usage: npm run db:seed:rides
//
// Edit RIDES below, then run. Re-running is idempotent per (startsAt, title):
// existing slots with the same start time + title are skipped.

import { db } from "../src/lib/db";
import { rideSlot } from "../src/lib/db/schema";
import { and, eq } from "drizzle-orm";

type RideSeed = {
  startsAt: Date;
  endsAt: Date;
  title: string;
  startLocation: string;
  routeName?: string;
  distanceKm?: number;
  elevationGainM?: number;
  pace?: "casual" | "moderate" | "fast";
  capacity?: number;
};

// Helper: build a Date in America/New_York at the given Y-M-D H:M.
// Avoids local-system-timezone drift when seeding from any machine.
function etDate(y: number, m: number, d: number, h: number, min = 0): Date {
  // Construct as UTC then subtract the ET offset for that date.
  // America/New_York is UTC-5 in EST, UTC-4 in EDT — let Intl figure it out.
  const asUtc = new Date(Date.UTC(y, m - 1, d, h, min));
  const fmt = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "shortOffset",
  });
  const parts = fmt.formatToParts(asUtc);
  const off = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT-5";
  // off looks like "GMT-4" or "GMT-5"
  const sign = off.includes("-") ? -1 : 1;
  const hours = parseInt(off.replace(/[^\d]/g, ""), 10) || 0;
  return new Date(asUtc.getTime() - sign * hours * 3600 * 1000);
}

// Edit this list. Each ride becomes a ride_slot row.
const RIDES: RideSeed[] = [
  {
    startsAt: etDate(2026, 5, 2, 9, 0), // Saturday May 2, 9:00 AM ET
    endsAt: etDate(2026, 5, 2, 12, 0),
    title: "Saturday Morning — Charles River Loop",
    startLocation: "Boston Common, Charles St gate",
    routeName: "Charles River → Watertown → Cambridge",
    distanceKm: 40,
    elevationGainM: 180,
    pace: "moderate",
    capacity: 6,
  },
  {
    startsAt: etDate(2026, 5, 3, 8, 30), // Sunday May 3, 8:30 AM ET
    endsAt: etDate(2026, 5, 3, 12, 30),
    title: "Sunday Long — Blue Hills",
    startLocation: "Forest Hills T",
    routeName: "Blue Hills Reservation loop",
    distanceKm: 60,
    elevationGainM: 450,
    pace: "moderate",
    capacity: 5,
  },
];

async function main() {
  let inserted = 0;
  let skipped = 0;

  for (const r of RIDES) {
    const existing = await db
      .select({ id: rideSlot.id })
      .from(rideSlot)
      .where(and(eq(rideSlot.startsAt, r.startsAt), eq(rideSlot.title, r.title)))
      .limit(1);

    if (existing.length > 0) {
      skipped++;
      console.log("· skipped (exists):", r.title, "@", r.startsAt.toISOString());
      continue;
    }

    await db.insert(rideSlot).values({
      startsAt: r.startsAt,
      endsAt: r.endsAt,
      title: r.title,
      startLocation: r.startLocation,
      routeName: r.routeName,
      distanceKm: r.distanceKm,
      elevationGainM: r.elevationGainM,
      pace: r.pace ?? "moderate",
      capacity: r.capacity ?? 6,
    });
    inserted++;
    console.log("+ seeded:", r.title, "@", r.startsAt.toISOString());
  }

  console.log(`\ndone — inserted ${inserted}, skipped ${skipped}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
