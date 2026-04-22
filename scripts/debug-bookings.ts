// Read-only diagnostic — prints users, slots, and bookings so we can see
// why an insert is failing without having to guess.
// Run: npx tsx --env-file=.env.local scripts/debug-bookings.ts

import { db } from "../src/lib/db";
import { user, rideSlot, rideBooking } from "../src/lib/db/schema";
import { desc, eq } from "drizzle-orm";

async function main() {
  console.log("\n========== USERS ==========");
  const users = await db
    .select({
      id: user.id,
      email: user.email,
      name: user.name,
      createdAt: user.createdAt,
    })
    .from(user)
    .orderBy(desc(user.createdAt));
  for (const u of users) {
    console.log(
      `  ${u.id}  ${u.email.padEnd(32)}  ${u.name.padEnd(20)}  ${u.createdAt.toISOString()}`,
    );
  }
  console.log(`  (${users.length} total)\n`);

  console.log("========== RIDE SLOTS ==========");
  const slots = await db
    .select()
    .from(rideSlot)
    .orderBy(rideSlot.startsAt);
  for (const s of slots) {
    console.log(
      `  ${s.id}  ${s.title.padEnd(40)}  seats=${s.seatsBooked}/${s.capacity}  status=${s.status}`,
    );
  }
  console.log(`  (${slots.length} total)\n`);

  console.log("========== BOOKINGS ==========");
  const bookings = await db
    .select({
      id: rideBooking.id,
      slotId: rideBooking.slotId,
      userId: rideBooking.userId,
      userEmail: user.email,
      riderCount: rideBooking.riderCount,
      status: rideBooking.status,
      notes: rideBooking.notes,
      createdAt: rideBooking.createdAt,
    })
    .from(rideBooking)
    .innerJoin(user, eq(rideBooking.userId, user.id))
    .orderBy(desc(rideBooking.createdAt));
  for (const b of bookings) {
    console.log(
      `  ${b.id}`,
      `\n    slot=${b.slotId}`,
      `\n    user=${b.userEmail} (${b.userId})`,
      `\n    riders=${b.riderCount}  status=${b.status}  notes=${b.notes ?? ""}`,
      `\n    at=${b.createdAt.toISOString()}\n`,
    );
  }
  console.log(`  (${bookings.length} total)\n`);

  // Reconcile seatsBooked vs actual bookings
  console.log("========== SEATS.RECONCILIATION ==========");
  for (const s of slots) {
    const actual = bookings
      .filter((b) => b.slotId === s.id)
      .reduce((sum, b) => sum + b.riderCount, 0);
    const diff = s.seatsBooked - actual;
    const tag = diff === 0 ? "OK" : `DRIFT=${diff}`;
    console.log(
      `  ${s.title.padEnd(40)}  stored=${s.seatsBooked} actual=${actual}  [${tag}]`,
    );
  }

  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
