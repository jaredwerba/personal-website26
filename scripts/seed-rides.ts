// Seed every upcoming Saturday + Sunday for the next N weeks as open slots.
// Usage: npx tsx --env-file=.env.local scripts/seed-rides.ts [--weeks=13] [--wipe]
//
// Core logic lives in src/lib/ride-seed.ts and is shared with the cron
// route /api/cron/extend-rides so both paths stay consistent. This script
// adds CLI-only concerns (the --wipe flag + human-readable logs).

import { db } from "../src/lib/db";
import { rideSlot } from "../src/lib/db/schema";
import { seedUpcomingWeekends } from "../src/lib/ride-seed";

async function main() {
  const args = process.argv.slice(2);
  const wipe = args.includes("--wipe");
  const weeksArg = args.find((a) => a.startsWith("--weeks="));
  const weeks = weeksArg ? Number(weeksArg.split("=")[1]) : 13;

  if (wipe) {
    const deleted = await db.delete(rideSlot).returning({ id: rideSlot.id });
    console.log(`- wiped ${deleted.length} existing slots (bookings cascaded)\n`);
  }

  console.log(`Seeding weekend slots over the next ${weeks} weeks...\n`);

  const { inserted, skipped } = await seedUpcomingWeekends(weeks);

  for (const day of inserted) console.log(`+ seeded  ${day}`);
  for (const day of skipped) console.log(`· skipped ${day} (exists)`);

  console.log(
    `\ndone — inserted ${inserted.length}, skipped ${skipped.length}`,
  );
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
