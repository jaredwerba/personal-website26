import { headers } from "next/headers";
import { and, asc, desc, eq, gt, lt } from "drizzle-orm";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rideSlot, rideBooking } from "@/lib/db/schema";
import { Badge, Divider } from "@mdrbx/nerv-ui";
import SignupGate from "@/components/ride/SignupGate";
import SlotCalendar, { type RideSlotRow } from "@/components/ride/SlotCalendar";
import UserPanel from "@/components/ride/UserPanel";
import RecoveryBanner from "@/components/ride/RecoveryBanner";
import type { BookingRow } from "@/components/ride/MyBookingsList";

export const metadata: Metadata = {
  title: "Ride — book a weekend bike tour",
  description:
    "Book a weekend ride. Passkey sign-in, no passwords. Limited group size per ride.",
};

// Bookings mutate via server actions + revalidatePath; force dynamic so
// the user sees fresh state immediately after booking or canceling.
export const dynamic = "force-dynamic";

async function getOpenSlots(): Promise<RideSlotRow[]> {
  try {
    const rows = await db
      .select()
      .from(rideSlot)
      .where(and(eq(rideSlot.status, "open"), gt(rideSlot.startsAt, new Date())))
      .orderBy(asc(rideSlot.startsAt));
    return rows.map((r) => ({
      id: r.id,
      startsAt: r.startsAt.toISOString(),
      endsAt: r.endsAt.toISOString(),
      title: r.title,
      startLocation: r.startLocation,
      routeName: r.routeName,
      distanceKm: r.distanceKm,
      elevationGainM: r.elevationGainM,
      pace: r.pace,
      capacity: r.capacity,
      seatsBooked: r.seatsBooked,
      status: r.status,
    }));
  } catch (err) {
    console.error("[/ride] getOpenSlots failed:", err);
    return [];
  }
}

async function getUserBookings(
  userId: string,
): Promise<{ upcoming: BookingRow[]; past: BookingRow[] }> {
  const now = new Date();
  try {
    const [upcoming, past] = await Promise.all([
      db
        .select({
          bookingId: rideBooking.id,
          slotId: rideSlot.id,
          startsAt: rideSlot.startsAt,
          endsAt: rideSlot.endsAt,
          title: rideSlot.title,
          startLocation: rideSlot.startLocation,
          riderCount: rideBooking.riderCount,
          notes: rideBooking.notes,
          status: rideBooking.status,
        })
        .from(rideBooking)
        .innerJoin(rideSlot, eq(rideBooking.slotId, rideSlot.id))
        .where(and(eq(rideBooking.userId, userId), gt(rideSlot.startsAt, now)))
        .orderBy(asc(rideSlot.startsAt)),
      db
        .select({
          bookingId: rideBooking.id,
          slotId: rideSlot.id,
          startsAt: rideSlot.startsAt,
          endsAt: rideSlot.endsAt,
          title: rideSlot.title,
          startLocation: rideSlot.startLocation,
          riderCount: rideBooking.riderCount,
          notes: rideBooking.notes,
          status: rideBooking.status,
        })
        .from(rideBooking)
        .innerJoin(rideSlot, eq(rideBooking.slotId, rideSlot.id))
        .where(and(eq(rideBooking.userId, userId), lt(rideSlot.startsAt, now)))
        .orderBy(desc(rideSlot.startsAt))
        .limit(10),
    ]);

    const toRow = (r: (typeof upcoming)[number]): BookingRow => ({
      bookingId: r.bookingId,
      slotId: r.slotId,
      startsAt: r.startsAt.toISOString(),
      endsAt: r.endsAt.toISOString(),
      title: r.title,
      startLocation: r.startLocation,
      riderCount: r.riderCount,
      notes: r.notes,
      status: r.status,
    });

    return { upcoming: upcoming.map(toRow), past: past.map(toRow) };
  } catch (err) {
    console.error("[/ride] getUserBookings failed:", err);
    return { upcoming: [], past: [] };
  }
}

export default async function RidePage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}) {
  const session = await auth.api.getSession({ headers: await headers() });
  const isSignedIn = !!session?.user;
  const params = await searchParams;

  const recoveryMode =
    typeof params.error === "string" && params.error.length > 0
      ? ("error" as const)
      : params.recovered === "1" && isSignedIn
        ? ("recovered" as const)
        : null;

  const openSlots = isSignedIn ? await getOpenSlots() : [];
  const { upcoming, past } = isSignedIn
    ? await getUserBookings(session.user.id)
    : { upcoming: [], past: [] };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
          RIDE
        </h2>
        <Badge label="WEEKEND.TOURS" variant="info" size="sm" />
      </div>

      <p className="font-nerv-mono text-xs text-nerv-mid-gray tracking-wider">
        // BOOK.A.WEEKEND.BIKE.TOUR &mdash; PASSKEY.AUTH &mdash; LIMITED.GROUP.SIZE
      </p>

      <Divider color="cyan" variant="dashed" />

      {recoveryMode && <RecoveryBanner mode={recoveryMode} />}

      <section className="space-y-4">
        <div className="space-y-1.5">
          <p className="font-nerv-body text-sm md:text-base text-nerv-white/90 leading-relaxed max-w-prose">
            Small group weekend rides out of Boston. Moderate pace, scenic routes,
            coffee stop at the end. Sign up with a passkey (Face ID / Touch ID) —
            no passwords — pick a weekend, and I&apos;ll confirm over email.
          </p>
        </div>
      </section>

      {isSignedIn ? (
        <>
          <UserPanel
            userName={session.user.name || session.user.email || "Rider"}
            userEmail={session.user.email || ""}
            upcoming={upcoming}
            past={past}
          />

          <Divider color="cyan" variant="dashed" />

          <section className="space-y-4">
            <div className="flex items-baseline justify-between gap-4 flex-wrap">
              <h3 className="font-nerv-display text-lg md:text-xl tracking-[0.16em] text-nerv-cyan">
                OPEN.RIDES
              </h3>
              <p className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-mid-gray">
                EASTERN.TIME
              </p>
            </div>
            <SlotCalendar openSlots={openSlots} />
          </section>
        </>
      ) : (
        <section>
          <SignupGate />
        </section>
      )}
    </div>
  );
}
