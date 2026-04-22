// Seed every upcoming Saturday + Sunday for the next N weeks as open slots.
// Usage: npx tsx --env-file=.env.local scripts/seed-rides.ts [--weeks=13] [--wipe]
//
// All slots share the same template: 10:00 AM – 4:00 PM ET, Castle Island /
// JFK UMass loop, meet at 891 East 4th St, Boston MA 02127. Re-running is
// idempotent — existing slots with the same start time are skipped.
//
// Pass --wipe to delete all existing slots (and any bookings via cascade)
// before seeding. Use when you change the template and want a clean slate.

import { db } from "../src/lib/db";
import { rideSlot } from "../src/lib/db/schema";
import { eq } from "drizzle-orm";

const TITLE = "Weekend Ride — Castle Island / JFK UMass";
const START_LOCATION = "891 East 4th St, Boston, MA 02127";
const ROUTE_NAME = "Castle Island → JFK/UMass loop";
const DISTANCE_KM = 20;
const ELEVATION_M = 40;
const PACE = "casual" as const;
const CAPACITY = 6;
const START_HOUR = 10; // 10:00 AM ET
const END_HOUR = 16; // 4:00 PM ET

// Build a Date in America/New_York at the given Y-M-D H:M. Lets the seeder
// run correctly from any machine regardless of its local TZ.
function etDate(y: number, m: number, d: number, h: number, min = 0): Date {
  const asUtc = new Date(Date.UTC(y, m - 1, d, h, min));
  const parts = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    timeZoneName: "shortOffset",
  }).formatToParts(asUtc);
  const off = parts.find((p) => p.type === "timeZoneName")?.value ?? "GMT-5";
  const sign = off.includes("-") ? -1 : 1;
  const hours = parseInt(off.replace(/[^\d]/g, ""), 10) || 0;
  return new Date(asUtc.getTime() - sign * hours * 3600 * 1000);
}

// Next N weeks of Saturdays + Sundays (today's weekend included if still upcoming).
function upcomingWeekendDates(weeks: number): Array<{ y: number; m: number; d: number }> {
  const today = new Date();
  const days: Array<{ y: number; m: number; d: number }> = [];

  // Start from today in ET, walk forward day by day, keep Sat (6) + Sun (0).
  // Stop after `weeks` weekend-pairs accumulated.
  const etParts = (dt: Date) => {
    const p = new Intl.DateTimeFormat("en-US", {
      timeZone: "America/New_York",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      weekday: "short",
    }).formatToParts(dt);
    return {
      y: Number(p.find((x) => x.type === "year")?.value),
      m: Number(p.find((x) => x.type === "month")?.value),
      d: Number(p.find((x) => x.type === "day")?.value),
      wd: p.find((x) => x.type === "weekday")?.value || "",
    };
  };

  for (let i = 0; i < weeks * 7 + 7 && days.length < weeks * 2; i++) {
    const dt = new Date(today.getTime() + i * 24 * 3600 * 1000);
    const p = etParts(dt);
    if (p.wd === "Sat" || p.wd === "Sun") {
      // Only include if the 10am ET start is still in the future.
      const startsAt = etDate(p.y, p.m, p.d, START_HOUR);
      if (startsAt.getTime() > Date.now()) {
        days.push({ y: p.y, m: p.m, d: p.d });
      }
    }
  }

  return days;
}

async function main() {
  const args = process.argv.slice(2);
  const wipe = args.includes("--wipe");
  const weeksArg = args.find((a) => a.startsWith("--weeks="));
  const weeks = weeksArg ? Number(weeksArg.split("=")[1]) : 13;

  if (wipe) {
    const deleted = await db.delete(rideSlot).returning({ id: rideSlot.id });
    console.log(`- wiped ${deleted.length} existing slots (bookings cascaded)\n`);
  }

  const dates = upcomingWeekendDates(weeks);
  console.log(`Seeding ${dates.length} weekend slots over the next ${weeks} weeks...\n`);

  let inserted = 0;
  let skipped = 0;

  for (const { y, m, d } of dates) {
    const startsAt = etDate(y, m, d, START_HOUR);
    const endsAt = etDate(y, m, d, END_HOUR);

    const existing = await db
      .select({ id: rideSlot.id })
      .from(rideSlot)
      .where(eq(rideSlot.startsAt, startsAt))
      .limit(1);

    if (existing.length) {
      skipped++;
      console.log(`· skipped ${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")} (exists)`);
      continue;
    }

    await db.insert(rideSlot).values({
      startsAt,
      endsAt,
      title: TITLE,
      startLocation: START_LOCATION,
      routeName: ROUTE_NAME,
      distanceKm: DISTANCE_KM,
      elevationGainM: ELEVATION_M,
      pace: PACE,
      capacity: CAPACITY,
    });
    inserted++;
    console.log(`+ seeded  ${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`);
  }

  console.log(`\ndone — inserted ${inserted}, skipped ${skipped}`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
