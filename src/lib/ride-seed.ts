import "server-only";
import { eq } from "drizzle-orm";
import { db } from "./db";
import { rideSlot } from "./db/schema";

// Shared core for seeding weekend ride slots. Used by both the CLI seeder
// (`scripts/seed-rides.ts`) and the monthly cron (`/api/cron/extend-rides`).
// Edit the template constants here to change every future weekend at once.

export const RIDE_TEMPLATE = {
  title: "Weekend Ride — Castle Island / JFK UMass",
  startLocation: "891 East 4th St, Boston, MA 02127",
  routeName: "Castle Island → JFK/UMass loop",
  distanceKm: 20,
  elevationGainM: 40,
  pace: "casual" as const,
  capacity: 6,
  startHour: 10, // 10:00 AM ET
  endHour: 16, // 4:00 PM ET
};

// Build a Date in America/New_York at Y-M-D H:M regardless of system TZ.
export function etDate(
  y: number,
  m: number,
  d: number,
  h: number,
  min = 0,
): Date {
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

function etParts(dt: Date): { y: number; m: number; d: number; wd: string } {
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
}

// All future Saturdays + Sundays within `weeks` weeks of today (ET),
// skipping any whose 10am start is already in the past.
export function upcomingWeekendDates(
  weeks: number,
): Array<{ y: number; m: number; d: number }> {
  const now = new Date();
  const days: Array<{ y: number; m: number; d: number }> = [];
  for (let i = 0; i < weeks * 7 + 7 && days.length < weeks * 2; i++) {
    const dt = new Date(now.getTime() + i * 24 * 3600 * 1000);
    const p = etParts(dt);
    if (p.wd === "Sat" || p.wd === "Sun") {
      const startsAt = etDate(p.y, p.m, p.d, RIDE_TEMPLATE.startHour);
      if (startsAt.getTime() > Date.now()) {
        days.push({ y: p.y, m: p.m, d: p.d });
      }
    }
  }
  return days;
}

// Insert any missing weekend slots within the next `weeks` weeks.
// Idempotent: a slot with the same startsAt is skipped, never duplicated.
export async function seedUpcomingWeekends(weeks = 13): Promise<{
  inserted: string[];
  skipped: string[];
}> {
  const dates = upcomingWeekendDates(weeks);
  const inserted: string[] = [];
  const skipped: string[] = [];

  for (const { y, m, d } of dates) {
    const startsAt = etDate(y, m, d, RIDE_TEMPLATE.startHour);
    const endsAt = etDate(y, m, d, RIDE_TEMPLATE.endHour);
    const isoDay = `${y}-${String(m).padStart(2, "0")}-${String(d).padStart(2, "0")}`;

    const existing = await db
      .select({ id: rideSlot.id })
      .from(rideSlot)
      .where(eq(rideSlot.startsAt, startsAt))
      .limit(1);

    if (existing.length) {
      skipped.push(isoDay);
      continue;
    }

    await db.insert(rideSlot).values({
      startsAt,
      endsAt,
      title: RIDE_TEMPLATE.title,
      startLocation: RIDE_TEMPLATE.startLocation,
      routeName: RIDE_TEMPLATE.routeName,
      distanceKm: RIDE_TEMPLATE.distanceKm,
      elevationGainM: RIDE_TEMPLATE.elevationGainM,
      pace: RIDE_TEMPLATE.pace,
      capacity: RIDE_TEMPLATE.capacity,
    });
    inserted.push(isoDay);
  }

  return { inserted, skipped };
}
