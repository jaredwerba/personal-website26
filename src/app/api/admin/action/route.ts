import { type NextRequest, NextResponse } from "next/server";
import { eq, sql } from "drizzle-orm";
import { verifyAction } from "@/lib/admin-tokens";
import { db } from "@/lib/db";
import { rideBooking, rideSlot, user } from "@/lib/db/schema";
import { sendBookingAcceptedEmail } from "@/lib/email";
import { revalidatePath } from "next/cache";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// One-click approve/reject from the admin notification email.
// No session — the HMAC signature IS the authorization. Links are safe to
// open on any device; the signing secret never leaves the server.

function page(status: number, title: string, body: string, color = "#ff6b00") {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8"/>
<meta name="viewport" content="width=device-width,initial-scale=1"/>
<meta name="robots" content="noindex,nofollow"/>
<title>${title}</title>
<style>
  body{background:#0a0a0a;color:#e4e4e4;font-family:ui-monospace,SFMono-Regular,Menlo,monospace;padding:48px 24px;margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center}
  .card{max-width:480px;width:100%;border:1px solid ${color}66;padding:28px 24px;background:${color}08;text-align:center}
  h1{color:${color};letter-spacing:0.16em;text-transform:uppercase;font-size:18px;margin:0 0 16px}
  p{color:#a0a0a0;letter-spacing:0.06em;line-height:1.6;font-size:13px;margin:12px 0}
  a{color:#00d4ff;text-decoration:none;letter-spacing:0.16em;font-size:11px;text-transform:uppercase}
  a:hover{color:#ff6b00}
  .sep{border-top:1px dashed #00d4ff33;margin:20px 0}
</style>
</head>
<body><div class="card">
<h1>${title}</h1>
<p>${body}</p>
<div class="sep"></div>
<p><a href="/admin">&larr; ADMIN.CONSOLE</a></p>
</div></body></html>`;
  return new NextResponse(html, {
    status,
    headers: { "content-type": "text/html; charset=utf-8", "cache-control": "no-store" },
  });
}

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const bookingId = url.searchParams.get("booking") || "";
  const action = url.searchParams.get("action") || "";
  const sig = url.searchParams.get("sig") || "";

  if (!bookingId || !action || !sig) {
    return page(400, "INVALID.LINK", "Missing parameters.", "#ff3b30");
  }
  if (!verifyAction(bookingId, action, sig)) {
    return page(
      403,
      "INVALID.SIGNATURE",
      "This link is expired or has been tampered with.",
      "#ff3b30",
    );
  }

  if (action === "accept") {
    // Look up full context for the acceptance email.
    const [ctx] = await db
      .select({
        riderCount: rideBooking.riderCount,
        foodBeverage: rideBooking.foodBeverage,
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

    if (!ctx) {
      return page(404, "NOT.FOUND", "This booking no longer exists.", "#ff3b30");
    }
    if (ctx.status === "accepted") {
      return page(
        200,
        "ALREADY.ACCEPTED",
        `${ctx.userName}'s ride is already confirmed. No action taken.`,
        "#34d399",
      );
    }

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
        foodBeverage: ctx.foodBeverage,
      });
    } catch (err) {
      console.error("[admin/action accept] rider email failed:", err);
    }

    revalidatePath("/admin");
    revalidatePath("/ride");
    return page(
      200,
      "ACCEPTED",
      `${ctx.userName} has been emailed a confirmation. See you on the ride.`,
      "#34d399",
    );
  }

  // reject
  let riderCount = 0;
  let slotId: string | null = null;
  await db.transaction(async (tx) => {
    const [b] = await tx
      .select()
      .from(rideBooking)
      .where(eq(rideBooking.id, bookingId))
      .limit(1);
    if (!b) return;
    riderCount = b.riderCount;
    slotId = b.slotId;

    await tx.delete(rideBooking).where(eq(rideBooking.id, bookingId));
    await tx
      .update(rideSlot)
      .set({
        seatsBooked: sql`GREATEST(${rideSlot.seatsBooked} - ${b.riderCount}, 0)`,
      })
      .where(eq(rideSlot.id, b.slotId));
  });

  if (!slotId) {
    return page(
      200,
      "ALREADY.HANDLED",
      "This booking was already canceled.",
      "#a0a0a0",
    );
  }

  revalidatePath("/admin");
  revalidatePath("/ride");
  return page(
    200,
    "REJECTED",
    `Booking removed and ${riderCount} seat${riderCount === 1 ? "" : "s"} freed. The rider was NOT emailed.`,
    "#ff3b30",
  );
}
