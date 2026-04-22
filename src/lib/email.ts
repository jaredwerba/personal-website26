import "server-only";
import { Resend } from "resend";

// Stubbed in Phase 1. Phase 3 fills in templates + ICS generation.
// All fns are no-ops when RESEND_API_KEY is missing (dev without creds).

const apiKey = process.env.RESEND_API_KEY;
const from = process.env.FROM_EMAIL || "rides@jwerba.com";
const adminEmail = process.env.ADMIN_EMAIL || "0@jwerba.com";

const resend = apiKey ? new Resend(apiKey) : null;

function siteHost(): string {
  return process.env.NEXT_PUBLIC_SITE_HOST || "jwerba.com";
}

export async function sendMagicLinkEmail(email: string, url: string): Promise<void> {
  if (!resend) {
    console.warn("[email] RESEND_API_KEY not set — skipping magic link to", email);
    console.warn("[email] link would have been:", url);
    return;
  }
  await resend.emails.send({
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
    console.warn("[email] RESEND_API_KEY not set — skipping request emails for", input.bookingId);
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

  // Rider confirmation
  await resend.emails.send({
    from,
    to: input.userEmail,
    subject: "Ride request received",
    text: `Hey ${input.userName},\n\n${summary}\n\nYour request is pending review — you'll get another email when it's confirmed.\n\n— Jared`,
  });

  // Admin notification
  await resend.emails.send({
    from,
    to: adminEmail,
    subject: `New ride request — ${input.userName}`,
    text: `${input.userName} (${input.userEmail}) requested:\n\n${summary}\n${input.notes ? `\nNotes: ${input.notes}\n` : ""}\nReview at https://${siteHost()}/admin\nBooking ID: ${input.bookingId}`,
  });
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
    console.warn("[email] RESEND_API_KEY not set — skipping acceptance email for", input.bookingId);
    return;
  }
  // TODO Phase 3: attach .ics calendar invite
  const when = input.startsAt.toLocaleString("en-US", {
    timeZone: "America/New_York",
    weekday: "long",
    month: "long",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });
  await resend.emails.send({
    from,
    to: input.userEmail,
    subject: "Ride confirmed — see you out there",
    text: `Hey ${input.userName},\n\n${input.title}\n${when} ET\nMeet at: ${input.startLocation}\nParty of: ${input.riderCount}\n\nSee you then.\n\n— Jared`,
  });
}
