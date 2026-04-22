"use server";

import { headers } from "next/headers";
import { revalidatePath } from "next/cache";
import { eq, sql } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { rideBooking, rideSlot, user } from "@/lib/db/schema";
import { sendBookingAcceptedEmail } from "@/lib/email";

async function requireAdmin(): Promise<void> {
  const session = await auth.api.getSession({ headers: await headers() });
  if (!isAdmin(session?.user?.email)) {
    throw new Error("Not authorized.");
  }
}

export async function acceptBooking(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();

    // Load full context (rider + slot) BEFORE updating so we can email after.
    const [ctx] = await db
      .select({
        riderCount: rideBooking.riderCount,
        status: rideBooking.status,
        startsAt: rideSlot.startsAt,
        endsAt: rideSlot.endsAt,
        title: rideSlot.title,
        startLocation: rideSlot.startLocation,
        userName: user.name,
        userEmail: user.email,
      })
      .from(rideBooking)
      .innerJoin(rideSlot, eq(rideBooking.slotId, rideSlot.id))
      .innerJoin(user, eq(rideBooking.userId, user.id))
      .where(eq(rideBooking.id, bookingId))
      .limit(1);

    if (!ctx) return { ok: false, error: "Booking not found." };
    if (ctx.status === "accepted") return { ok: true }; // idempotent

    await db
      .update(rideBooking)
      .set({ status: "accepted" })
      .where(eq(rideBooking.id, bookingId));

    try {
      await sendBookingAcceptedEmail({
        bookingId,
        userName: ctx.userName,
        userEmail: ctx.userEmail,
        startsAt: ctx.startsAt,
        endsAt: ctx.endsAt,
        title: ctx.title,
        startLocation: ctx.startLocation,
        riderCount: ctx.riderCount,
      });
    } catch (err) {
      console.error("[acceptBooking] email dispatch failed:", err);
    }

    revalidatePath("/admin");
    revalidatePath("/ride");
    revalidatePath(`/ride/booking/${bookingId}`);
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Accept failed.";
    return { ok: false, error: msg };
  }
}

export async function rejectBooking(
  bookingId: string,
): Promise<{ ok: true } | { ok: false; error: string }> {
  try {
    await requireAdmin();

    await db.transaction(async (tx) => {
      const [b] = await tx
        .select()
        .from(rideBooking)
        .where(eq(rideBooking.id, bookingId))
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

    revalidatePath("/admin");
    revalidatePath("/ride");
    return { ok: true };
  } catch (err) {
    const msg = err instanceof Error ? err.message : "Reject failed.";
    return { ok: false, error: msg };
  }
}
