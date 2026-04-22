"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { and, eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rideSlot, rideBooking } from "@/lib/db/schema";
import { sendBookingRequestEmails } from "@/lib/email";

async function requireUserId(): Promise<{ userId: string; userName: string; userEmail: string }> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) throw new Error("You must be signed in.");
  return {
    userId: session.user.id,
    userName: session.user.name || session.user.email || "Rider",
    userEmail: session.user.email || "",
  };
}

// Drizzle wraps pg errors as `DrizzleQueryError` where `err.message` is the
// SQL and `err.cause` is the real pg error with a `.code`. Without this
// mapping, we leak raw SQL into the UI (see the "Failed query: insert into
// ride_booking..." screenshot). Codes: https://www.postgresql.org/docs/current/errcodes-appendix.html
function friendlyDbError(err: unknown): string {
  const cause = (err as { cause?: unknown })?.cause;
  if (cause && typeof cause === "object" && "code" in cause) {
    const code = (cause as { code?: string }).code;
    if (code === "23505") return "You already have a booking on this ride. Cancel it first to rebook.";
    if (code === "23503") return "Your account is out of sync — try signing out and back in.";
    if (code === "23514") return "Booking didn't meet the ride's constraints.";
  }
  if (err instanceof Error) {
    // Strip Drizzle's "Failed query: ..." wrapper — we never want to show SQL.
    if (err.message.startsWith("Failed query")) return "Booking failed. Please try again.";
    return err.message;
  }
  return "Booking failed.";
}

export async function bookSlot(
  slotId: string,
  riderCount: number,
  notes?: string,
): Promise<{ ok: true; bookingId: string } | { ok: false; error: string }> {
  try {
    const { userId, userName, userEmail } = await requireUserId();

    if (!Number.isInteger(riderCount) || riderCount < 1 || riderCount > 20) {
      return { ok: false, error: "Rider count must be between 1 and 20." };
    }

    const { bookingId, slotInfo } = await db.transaction(async (tx) => {
      // Row-lock the slot to prevent concurrent overbooking.
      const locked = await tx
        .select({
          id: rideSlot.id,
          status: rideSlot.status,
          startsAt: rideSlot.startsAt,
          endsAt: rideSlot.endsAt,
          title: rideSlot.title,
          startLocation: rideSlot.startLocation,
          capacity: rideSlot.capacity,
          seatsBooked: rideSlot.seatsBooked,
        })
        .from(rideSlot)
        .where(eq(rideSlot.id, slotId))
        .for("update");
      const row = locked[0];
      if (!row) throw new Error("Ride not found.");
      if (row.status !== "open") throw new Error("This ride has been canceled.");
      if (row.seatsBooked + riderCount > row.capacity) {
        const remaining = row.capacity - row.seatsBooked;
        throw new Error(
          remaining === 0
            ? "This ride is full."
            : `Only ${remaining} seat${remaining === 1 ? "" : "s"} left.`,
        );
      }

      // Explicit existing-booking check before the insert so we return a
      // clean error instead of relying on the unique constraint firing.
      const existing = await tx
        .select({ id: rideBooking.id })
        .from(rideBooking)
        .where(
          and(eq(rideBooking.slotId, slotId), eq(rideBooking.userId, userId)),
        )
        .limit(1);
      if (existing[0]) {
        throw new Error(
          "You already have a booking on this ride. Cancel it first to rebook.",
        );
      }

      const [inserted] = await tx
        .insert(rideBooking)
        .values({
          slotId,
          userId,
          riderCount,
          notes: notes?.trim() || null,
          status: "pending",
        })
        .returning({ id: rideBooking.id });

      await tx
        .update(rideSlot)
        .set({ seatsBooked: sql`${rideSlot.seatsBooked} + ${riderCount}` })
        .where(eq(rideSlot.id, slotId));

      return {
        bookingId: inserted.id,
        slotInfo: {
          startsAt: row.startsAt,
          endsAt: row.endsAt,
          title: row.title,
          startLocation: row.startLocation,
        },
      };
    });

    if (userEmail) {
      try {
        await sendBookingRequestEmails({
          bookingId,
          userName,
          userEmail,
          startsAt: slotInfo.startsAt,
          endsAt: slotInfo.endsAt,
          title: slotInfo.title,
          startLocation: slotInfo.startLocation,
          riderCount,
          notes: notes?.trim() || null,
        });
      } catch (err) {
        console.error("[bookSlot] email dispatch failed:", err);
      }
    }

    revalidatePath("/ride");
    revalidatePath("/ride/booking/" + bookingId);
    return { ok: true, bookingId };
  } catch (err) {
    console.error("[bookSlot] failed:", err);
    return { ok: false, error: friendlyDbError(err) };
  }
}

export async function cancelBooking(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    const { userId } = await requireUserId();

    await db.transaction(async (tx) => {
      const [b] = await tx
        .select()
        .from(rideBooking)
        .where(and(eq(rideBooking.id, bookingId), eq(rideBooking.userId, userId)))
        .limit(1);
      if (!b) throw new Error("Booking not found.");

      await tx.delete(rideBooking).where(eq(rideBooking.id, bookingId));
      await tx
        .update(rideSlot)
        .set({
          seatsBooked: sql`GREATEST(${rideSlot.seatsBooked} - ${b.riderCount}, 0)`,
        })
        .where(eq(rideSlot.id, b.slotId));
    });

    revalidatePath("/ride");
    return { ok: true };
  } catch (err) {
    console.error("[cancelBooking] failed:", err);
    return { ok: false, error: friendlyDbError(err) };
  }
}

export async function signOutUser(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  revalidatePath("/ride");
}
