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
    const msg = err instanceof Error ? err.message : "Booking failed.";
    return { ok: false, error: msg };
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
    const msg = err instanceof Error ? err.message : "Cancel failed.";
    return { ok: false, error: msg };
  }
}

export async function signOutUser(): Promise<void> {
  await auth.api.signOut({ headers: await headers() });
  revalidatePath("/ride");
}
