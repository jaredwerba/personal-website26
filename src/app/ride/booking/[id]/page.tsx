import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { headers } from "next/headers";
import { and, eq } from "drizzle-orm";
import { auth } from "@/lib/auth";
import { db } from "@/lib/db";
import { rideSlot, rideBooking } from "@/lib/db/schema";
import { Badge, Divider } from "@mdrbx/nerv-ui";
import { formatSlotRange } from "@/lib/tz";

export const dynamic = "force-dynamic";

type Params = Promise<{ id: string }>;

export default async function BookingConfirmPage({ params }: { params: Params }) {
  const { id } = await params;
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) redirect("/ride");

  const rows = await db
    .select({
      bookingId: rideBooking.id,
      status: rideBooking.status,
      riderCount: rideBooking.riderCount,
      foodBeverage: rideBooking.foodBeverage,
      notes: rideBooking.notes,
      userId: rideBooking.userId,
      startsAt: rideSlot.startsAt,
      endsAt: rideSlot.endsAt,
      title: rideSlot.title,
      startLocation: rideSlot.startLocation,
      routeName: rideSlot.routeName,
      distanceKm: rideSlot.distanceKm,
      elevationGainM: rideSlot.elevationGainM,
      pace: rideSlot.pace,
    })
    .from(rideBooking)
    .innerJoin(rideSlot, eq(rideBooking.slotId, rideSlot.id))
    .where(and(eq(rideBooking.id, id), eq(rideBooking.userId, session.user.id)))
    .limit(1);
  const b = rows[0];
  if (!b) notFound();

  const pending = b.status === "pending";

  return (
    <div className="space-y-6">
      <nav className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-mid-gray flex items-center gap-2">
        <Link href="/ride" className="hover:text-nerv-orange transition-colors">
          RIDE
        </Link>
        <span>/</span>
        <span className="text-nerv-cyan">BOOKING</span>
      </nav>

      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
          {pending ? "REQUEST.SUBMITTED" : "RIDE.CONFIRMED"}
        </h2>
        <Badge
          label={b.status.toUpperCase()}
          variant={pending ? "warning" : "success"}
          size="sm"
        />
      </div>

      <p className="font-nerv-mono text-xs text-nerv-mid-gray tracking-wider">
        {pending
          ? "// JARED.WILL.REVIEW.AND.EMAIL.CONFIRMATION"
          : "// YOU&apos;RE.ON.THE.LIST &mdash; CHECK.EMAIL.FOR.CALENDAR.INVITE"}
      </p>

      <Divider color="cyan" variant="dashed" />

      <div className="border border-nerv-cyan/30 bg-nerv-black/50 p-5 md:p-6 space-y-3">
        <h3 className="font-nerv-display text-lg md:text-xl tracking-[0.14em] text-nerv-white uppercase">
          {b.title}
        </h3>
        <dl className="font-nerv-mono text-[12px] tracking-wider text-nerv-mid-gray space-y-1.5">
          <div className="flex">
            <dt className="text-nerv-cyan/70 w-28 shrink-0">WHEN</dt>
            <dd className="text-nerv-white/90">
              {formatSlotRange(new Date(b.startsAt), new Date(b.endsAt))} ET
            </dd>
          </div>
          <div className="flex">
            <dt className="text-nerv-cyan/70 w-28 shrink-0">MEET</dt>
            <dd className="text-nerv-white/90">{b.startLocation}</dd>
          </div>
          {b.routeName && (
            <div className="flex">
              <dt className="text-nerv-cyan/70 w-28 shrink-0">ROUTE</dt>
              <dd className="text-nerv-white/90">{b.routeName}</dd>
            </div>
          )}
          <div className="flex">
            <dt className="text-nerv-cyan/70 w-28 shrink-0">PARTY.SIZE</dt>
            <dd className="text-nerv-white/90">
              {b.riderCount} rider{b.riderCount === 1 ? "" : "s"}
            </dd>
          </div>
          <div className="flex">
            <dt className="text-nerv-cyan/70 w-28 shrink-0">FOOD+BEV</dt>
            <dd className={b.foodBeverage ? "text-nerv-green" : "text-nerv-white/60"}>
              {b.foodBeverage ? "INCLUDED" : "not included"}
            </dd>
          </div>
          {(b.distanceKm || b.elevationGainM) && (
            <div className="flex">
              <dt className="text-nerv-cyan/70 w-28 shrink-0">PROFILE</dt>
              <dd className="text-nerv-white/90">
                {b.distanceKm ? `${b.distanceKm} km` : "—"}
                {b.elevationGainM ? ` · ${b.elevationGainM} m gain` : ""}
                {` · ${b.pace}`}
              </dd>
            </div>
          )}
          {b.notes && (
            <div className="flex">
              <dt className="text-nerv-cyan/70 w-28 shrink-0">NOTES</dt>
              <dd className="text-nerv-white/90 italic">&ldquo;{b.notes}&rdquo;</dd>
            </div>
          )}
        </dl>
      </div>

      <div className="pt-2">
        <Link
          href="/ride"
          className="font-nerv-mono text-[11px] tracking-[0.2em] text-nerv-cyan hover:text-nerv-orange transition-colors"
        >
          &larr; BACK.TO.RIDES
        </Link>
      </div>
    </div>
  );
}
