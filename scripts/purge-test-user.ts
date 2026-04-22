// Delete a test user + cascade their sessions, accounts, passkeys,
// and bookings. Run: npx tsx --env-file=.env.local scripts/purge-test-user.ts <email>
//
// Safe to re-run (no-op if the user doesn't exist).

import { db } from "../src/lib/db";
import { user, rideBooking, rideSlot } from "../src/lib/db/schema";
import { eq, sql } from "drizzle-orm";

async function main() {
  const email = process.argv[2];
  if (!email) {
    console.error("Usage: tsx --env-file=.env.local scripts/purge-test-user.ts <email>");
    process.exit(1);
  }

  const [row] = await db.select().from(user).where(eq(user.email, email)).limit(1);
  if (!row) {
    console.log(`No user with email ${email} — nothing to do.`);
    process.exit(0);
  }

  console.log(`Found user: ${row.id}  ${row.email}  ${row.name}`);

  // Manually decrement seatsBooked for any bookings the user had (cascade
  // deletes the bookings themselves, but that leaves seatsBooked inflated).
  const bookings = await db
    .select()
    .from(rideBooking)
    .where(eq(rideBooking.userId, row.id));

  if (bookings.length) {
    console.log(`  Has ${bookings.length} booking(s) — freeing seats first.`);
    for (const b of bookings) {
      await db
        .update(rideSlot)
        .set({
          seatsBooked: sql`GREATEST(${rideSlot.seatsBooked} - ${b.riderCount}, 0)`,
        })
        .where(eq(rideSlot.id, b.slotId));
      console.log(`    freed ${b.riderCount} seat(s) on slot ${b.slotId}`);
    }
  }

  // Cascade via FK onDelete: cascade takes care of sessions/accounts/passkeys/bookings.
  const deleted = await db.delete(user).where(eq(user.id, row.id)).returning();
  console.log(`Deleted ${deleted.length} user row.`);
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
