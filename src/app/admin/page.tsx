import { headers } from "next/headers";
import { notFound } from "next/navigation";
import Link from "next/link";
import { and, asc, desc, eq, gt, sql } from "drizzle-orm";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { isAdmin } from "@/lib/admin";
import { db } from "@/lib/db";
import { user, passkey, rideBooking, rideSlot } from "@/lib/db/schema";
import { Badge, Divider } from "@mdrbx/nerv-ui";
import { formatSlotRange } from "@/lib/tz";
import AdminBookingActions from "./AdminBookingActions";

export const metadata: Metadata = {
  title: "Admin",
  robots: { index: false, follow: false },
};

export const dynamic = "force-dynamic";

function fmtDate(d: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    timeZone: "America/New_York",
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(d);
}

export default async function AdminPage() {
  const session = await auth.api.getSession({ headers: await headers() });
  // Hide the route from non-admins rather than 403ing — less information leak.
  if (!isAdmin(session?.user?.email)) notFound();

  // Registered users + cheap subquery counts (passkeys, bookings).
  const users = await db
    .select({
      id: user.id,
      name: user.name,
      email: user.email,
      createdAt: user.createdAt,
      passkeyCount: sql<number>`(select count(*)::int from ${passkey} where ${passkey.userId} = ${user.id})`,
      bookingCount: sql<number>`(select count(*)::int from ${rideBooking} where ${rideBooking.userId} = ${user.id})`,
    })
    .from(user)
    .orderBy(desc(user.createdAt));

  const now = new Date();

  const pendingBookings = await db
    .select({
      bookingId: rideBooking.id,
      riderCount: rideBooking.riderCount,
      foodBeverage: rideBooking.foodBeverage,
      notes: rideBooking.notes,
      createdAt: rideBooking.createdAt,
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
    .where(eq(rideBooking.status, "pending"))
    .orderBy(asc(rideSlot.startsAt));

  const upcomingAccepted = await db
    .select({
      bookingId: rideBooking.id,
      riderCount: rideBooking.riderCount,
      foodBeverage: rideBooking.foodBeverage,
      notes: rideBooking.notes,
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
    .where(and(eq(rideBooking.status, "accepted"), gt(rideSlot.startsAt, now)))
    .orderBy(asc(rideSlot.startsAt));

  return (
    <div className="space-y-6">
      <nav className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-mid-gray flex items-center gap-2">
        <Link href="/ride" className="hover:text-nerv-orange transition-colors">
          RIDE
        </Link>
        <span>/</span>
        <span className="text-nerv-orange">ADMIN</span>
      </nav>

      <div className="flex items-center gap-3 flex-wrap">
        <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
          ADMIN.CONSOLE
        </h2>
        <Badge label="RESTRICTED" variant="warning" size="sm" />
      </div>

      <p className="font-nerv-mono text-xs text-nerv-mid-gray tracking-wider">
        // SIGNED.IN.AS {session!.user.email?.toUpperCase()}
      </p>

      <Divider color="orange" variant="dashed" />

      {/* STATS */}
      <div className="grid grid-cols-3 gap-3">
        <StatCard label="USERS" value={users.length} color="cyan" />
        <StatCard label="PENDING" value={pendingBookings.length} color="orange" />
        <StatCard label="UPCOMING" value={upcomingAccepted.length} color="green" />
      </div>

      {/* PENDING REQUESTS */}
      <section className="space-y-3">
        <h3 className="font-nerv-display text-lg md:text-xl tracking-[0.14em] text-nerv-orange">
          PENDING.REQUESTS
        </h3>
        {pendingBookings.length === 0 ? (
          <p className="font-nerv-mono text-[11px] text-nerv-mid-gray tracking-wider">
            // NO.PENDING.REQUESTS
          </p>
        ) : (
          <ul className="space-y-3">
            {pendingBookings.map((b) => (
              <li
                key={b.bookingId}
                className="border border-nerv-orange/30 bg-nerv-orange/[0.03] p-3 md:p-4"
              >
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="min-w-0 flex-1 space-y-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-nerv-display text-sm md:text-base tracking-[0.12em] text-nerv-white uppercase">
                        {b.userName}
                      </p>
                      <a
                        href={`mailto:${b.userEmail}`}
                        className="font-nerv-mono text-[11px] text-nerv-cyan hover:text-nerv-orange tracking-wider"
                      >
                        {b.userEmail}
                      </a>
                    </div>
                    <p className="font-nerv-mono text-[11px] text-nerv-mid-gray tracking-wider">
                      {b.title} — {formatSlotRange(new Date(b.startsAt), new Date(b.endsAt))} ET
                    </p>
                    <p className="font-nerv-mono text-[11px] text-nerv-mid-gray tracking-wider">
                      {b.startLocation} · {b.riderCount} rider{b.riderCount === 1 ? "" : "s"}
                    </p>
                    <p
                      className={`font-nerv-mono text-[10px] tracking-[0.18em] uppercase ${b.foodBeverage ? "text-nerv-green" : "text-nerv-mid-gray/70"}`}
                    >
                      {b.foodBeverage ? "+ FOOD.BEVERAGE" : "// NO.F&B"}
                    </p>
                    {b.notes && (
                      <p className="font-nerv-body text-[12px] text-nerv-white/80 italic mt-1">
                        &ldquo;{b.notes}&rdquo;
                      </p>
                    )}
                  </div>
                  <AdminBookingActions bookingId={b.bookingId} status="pending" />
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      <Divider color="cyan" variant="dashed" />

      {/* UPCOMING ACCEPTED */}
      <section className="space-y-3">
        <h3 className="font-nerv-display text-lg md:text-xl tracking-[0.14em] text-nerv-cyan">
          UPCOMING.CONFIRMED
        </h3>
        {upcomingAccepted.length === 0 ? (
          <p className="font-nerv-mono text-[11px] text-nerv-mid-gray tracking-wider">
            // NO.UPCOMING.RIDES
          </p>
        ) : (
          <ul className="space-y-2">
            {upcomingAccepted.map((b) => (
              <li
                key={b.bookingId}
                className="border border-nerv-cyan/30 bg-nerv-black/40 p-3 flex items-start justify-between gap-3 flex-wrap"
              >
                <div className="min-w-0 flex-1 space-y-0.5">
                  <p className="font-nerv-mono text-[11px] text-nerv-cyan tracking-wider">
                    {formatSlotRange(new Date(b.startsAt), new Date(b.endsAt))} ET
                  </p>
                  <p className="font-nerv-mono text-[12px] text-nerv-white/90">
                    {b.userName} ({b.userEmail}) · {b.riderCount} rider
                    {b.riderCount === 1 ? "" : "s"}
                    {b.foodBeverage && (
                      <span className="text-nerv-green"> · +F&amp;B</span>
                    )}
                  </p>
                  <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider">
                    {b.title}
                  </p>
                </div>
                <AdminBookingActions bookingId={b.bookingId} status="accepted" />
              </li>
            ))}
          </ul>
        )}
      </section>

      <Divider color="green" variant="dashed" />

      {/* REGISTERED USERS */}
      <section className="space-y-3">
        <div className="flex items-baseline justify-between flex-wrap gap-2">
          <h3 className="font-nerv-display text-lg md:text-xl tracking-[0.14em] text-nerv-green">
            REGISTERED.USERS
          </h3>
          <p className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-mid-gray">
            {users.length} TOTAL
          </p>
        </div>
        {users.length === 0 ? (
          <p className="font-nerv-mono text-[11px] text-nerv-mid-gray tracking-wider">
            // NO.USERS.YET
          </p>
        ) : (
          <>
            {/* Desktop table */}
            <div className="hidden md:block border border-nerv-green/30 bg-nerv-black/40 overflow-x-auto">
              <table className="w-full font-nerv-mono text-[11px] tracking-wider">
                <thead>
                  <tr className="border-b border-nerv-green/20 text-nerv-green/70 text-left">
                    <th className="px-3 py-2 font-normal">NAME</th>
                    <th className="px-3 py-2 font-normal">EMAIL</th>
                    <th className="px-3 py-2 font-normal">JOINED</th>
                    <th className="px-3 py-2 font-normal text-right">PASSKEYS</th>
                    <th className="px-3 py-2 font-normal text-right">BOOKINGS</th>
                  </tr>
                </thead>
                <tbody>
                  {users.map((u) => (
                    <tr
                      key={u.id}
                      className="border-b border-nerv-green/10 last:border-0 hover:bg-nerv-green/[0.03]"
                    >
                      <td className="px-3 py-2 text-nerv-white/90">{u.name}</td>
                      <td className="px-3 py-2 text-nerv-cyan">
                        <a href={`mailto:${u.email}`} className="hover:text-nerv-orange">
                          {u.email}
                        </a>
                      </td>
                      <td className="px-3 py-2 text-nerv-mid-gray">
                        {fmtDate(new Date(u.createdAt))}
                      </td>
                      <td className="px-3 py-2 text-nerv-white/80 text-right">
                        {u.passkeyCount}
                      </td>
                      <td className="px-3 py-2 text-nerv-white/80 text-right">
                        {u.bookingCount}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Mobile list */}
            <ul className="md:hidden space-y-2">
              {users.map((u) => (
                <li
                  key={u.id}
                  className="border border-nerv-green/30 bg-nerv-black/40 p-3 space-y-1"
                >
                  <div className="flex items-baseline justify-between gap-2 flex-wrap">
                    <p className="font-nerv-display text-sm tracking-[0.12em] text-nerv-white uppercase">
                      {u.name}
                    </p>
                    <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider">
                      {fmtDate(new Date(u.createdAt))}
                    </p>
                  </div>
                  <a
                    href={`mailto:${u.email}`}
                    className="block font-nerv-mono text-[11px] text-nerv-cyan tracking-wider hover:text-nerv-orange"
                  >
                    {u.email}
                  </a>
                  <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-[0.15em]">
                    {u.passkeyCount} PASSKEY{u.passkeyCount === 1 ? "" : "S"} ·{" "}
                    {u.bookingCount} BOOKING{u.bookingCount === 1 ? "" : "S"}
                  </p>
                </li>
              ))}
            </ul>
          </>
        )}
      </section>
    </div>
  );
}

function StatCard({
  label,
  value,
  color,
}: {
  label: string;
  value: number;
  color: "cyan" | "orange" | "green";
}) {
  const border = {
    cyan: "border-nerv-cyan/40",
    orange: "border-nerv-orange/40",
    green: "border-nerv-green/40",
  }[color];
  const text = {
    cyan: "text-nerv-cyan",
    orange: "text-nerv-orange",
    green: "text-nerv-green",
  }[color];
  return (
    <div className={`border ${border} bg-nerv-black/50 p-3 text-center`}>
      <p className="font-nerv-mono text-[9px] md:text-[10px] tracking-[0.2em] text-nerv-mid-gray">
        {label}
      </p>
      <p className={`font-nerv-display text-2xl md:text-3xl ${text} mt-0.5`}>{value}</p>
    </div>
  );
}
