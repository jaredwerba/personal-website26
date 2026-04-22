import "server-only";
import { Resend } from "resend";
import { signAction } from "@/lib/admin-tokens";

// All fns are no-ops when RESEND_API_KEY is missing (dev without creds).

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.FROM_EMAIL || "rides@jwerba.com";
const adminEmail = process.env.ADMIN_EMAIL || "0@jwerba.com";

const resend = apiKey ? new Resend(apiKey) : null;

function siteHost(): string {
  return process.env.NEXT_PUBLIC_SITE_HOST || "jwerba.com";
}

// Send an email and loudly log the outcome so failures are visible in
// Vercel logs (the booking flow catches throws and keeps going, so without
// this log line a broken admin send would be completely silent).
async function sendAndLog(
  label: string,
  params: Parameters<Resend["emails"]["send"]>[0],
) {
  if (!resend) {
    console.warn(`[email/${label}] RESEND_API_KEY not set — skipping`);
    return;
  }
  try {
    const result = await resend.emails.send(params);
    if (result.error) {
      console.error(`[email/${label}] resend error:`, result.error);
    } else {
      console.log(
        `[email/${label}] sent id=${result.data?.id} to=${Array.isArray(params.to) ? params.to.join(",") : params.to}`,
      );
    }
  } catch (err) {
    console.error(`[email/${label}] threw:`, err);
  }
}

export async function sendMagicLinkEmail(email: string, url: string): Promise<void> {
  if (!resend) {
    console.warn("[email/magic-link] RESEND_API_KEY not set — skipping to", email);
    console.warn("[email/magic-link] link would have been:", url);
    return;
  }
  await sendAndLog("magic-link", {
    from,
    to: email,
    subject: `Sign in to ${siteHost()}`,
    text: `Tap this link to sign in. Expires in 10 minutes.\n\n${url}\n\nIf you didn't request this, ignore this email.`,
  });
}

export type BookingRequestEmailInput = {
  bookingId: string;
  userName: string;
  userEmail: string;
  startsAt: Date;
  endsAt: Date;
  title: string;
  startLocation: string;
  riderCount: number;
  notes: string | null;
};

export async function sendBookingRequestEmails(
  input: BookingRequestEmailInput,
): Promise<void> {
  if (!resend) {
    console.warn(
      "[email/booking-request] RESEND_API_KEY not set — skipping for",
      input.bookingId,
    );
    return;
  }
  const when = input.startsAt.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "short",
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  const summary = `${input.title} — ${when} ET · ${input.startLocation} · ${input.riderCount} rider${input.riderCount === 1 ? "" : "s"}`;

  // One-click approval URLs — HMAC-signed, no login required.
  const host = siteHost();
  const acceptUrl = `https://${host}/api/admin/action?booking=${input.bookingId}&action=accept&sig=${signAction(input.bookingId, "accept")}`;
  const rejectUrl = `https://${host}/api/admin/action?booking=${input.bookingId}&action=reject&sig=${signAction(input.bookingId, "reject")}`;

  // Rider confirmation — sent in parallel with admin notification so a
  // broken admin send doesn't block the rider's ack (and vice versa).
  const riderSend = sendAndLog("booking-request/rider", {
    from,
    to: input.userEmail,
    subject: "Ride request received",
    text: `Hey ${input.userName},

${summary}

Your request is pending review — you'll get another email when it's confirmed.

— Jared`,
  });

  // Admin notification with inline accept/reject links. Plain-text fallback
  // lists the URLs explicitly so it works even when HTML is stripped.
  const adminText = `${input.userName} (${input.userEmail}) requested:

${summary}
${input.notes ? `\nNotes: ${input.notes}\n` : ""}
ACCEPT:  ${acceptUrl}
REJECT:  ${rejectUrl}

Dashboard: https://${host}/admin
Booking ID: ${input.bookingId}`;

  const adminHtml = `<!DOCTYPE html><html><body style="background:#0a0a0a;color:#e4e4e4;font-family:ui-monospace,Menlo,monospace;padding:24px;margin:0">
<div style="max-width:560px;margin:0 auto;border:1px solid #ff6b0044;padding:24px;background:#ff6b0008">
<h2 style="color:#ff6b00;letter-spacing:0.14em;text-transform:uppercase;font-size:16px;margin:0 0 16px">// New.Ride.Request</h2>
<p style="color:#e4e4e4;font-size:14px;line-height:1.6;margin:0 0 6px"><strong style="color:#00d4ff">${input.userName}</strong> <span style="color:#a0a0a0">&lt;${input.userEmail}&gt;</span></p>
<p style="color:#a0a0a0;font-size:13px;line-height:1.6;margin:0 0 4px">${input.title}</p>
<p style="color:#a0a0a0;font-size:13px;line-height:1.6;margin:0 0 4px">${when} ET · ${input.startLocation}</p>
<p style="color:#a0a0a0;font-size:13px;line-height:1.6;margin:0 0 16px">${input.riderCount} rider${input.riderCount === 1 ? "" : "s"}</p>
${input.notes ? `<p style="color:#e4e4e4;font-style:italic;font-size:13px;line-height:1.6;border-left:2px solid #00d4ff66;padding-left:12px;margin:16px 0">&ldquo;${input.notes.replace(/</g, "&lt;")}&rdquo;</p>` : ""}
<div style="margin:24px 0;display:flex;gap:12px;flex-wrap:wrap">
<a href="${acceptUrl}" style="display:inline-block;background:#34d399;color:#0a0a0a;padding:10px 20px;text-decoration:none;letter-spacing:0.16em;font-size:12px;text-transform:uppercase;font-weight:600">Accept</a>
<a href="${rejectUrl}" style="display:inline-block;background:transparent;color:#ff3b30;border:1px solid #ff3b30;padding:9px 20px;text-decoration:none;letter-spacing:0.16em;font-size:12px;text-transform:uppercase">Reject</a>
</div>
<p style="color:#666;font-size:11px;letter-spacing:0.12em;margin:24px 0 0"><a href="https://${host}/admin" style="color:#00d4ff;text-decoration:none">&rarr; ADMIN.CONSOLE</a></p>
<p style="color:#444;font-size:10px;letter-spacing:0.1em;margin:16px 0 0;font-family:monospace">Booking ID: ${input.bookingId}</p>
</div></body></html>`;

  const adminSend = sendAndLog("booking-request/admin", {
    from,
    to: adminEmail,
    subject: `New ride request — ${input.userName}`,
    text: adminText,
    html: adminHtml,
  });

  await Promise.allSettled([riderSend, adminSend]);
}

export type BookingAcceptedEmailInput = {
  bookingId: string;
  userName: string;
  userEmail: string;
  startsAt: Date;
  endsAt: Date;
  title: string;
  startLocation: string;
  riderCount: number;
};

export async function sendBookingAcceptedEmail(
  input: BookingAcceptedEmailInput,
): Promise<void> {
  if (!resend) {
    console.warn(
      "[email/accepted] RESEND_API_KEY not set — skipping for",
      input.bookingId,
    );
    return;
  }
  const when = input.startsAt.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  await sendAndLog("accepted", {
    from,
    to: input.userEmail,
    subject: "Ride confirmed — see you out there",
    text: `Hey ${input.userName},\n\n${input.title}\n${when} ET\nMeet at: ${input.startLocation}\nParty of: ${input.riderCount}\n\nSee you then.\n\n— Jared`,
  });
}
