import "server-only";
import crypto from "node:crypto";

// HMAC-signed tokens let the admin accept/reject bookings by clicking a link
// in their email — no session required. The signing secret is the same one
// better-auth uses, so no separate env var to manage.

const SECRET = process.env.BETTER_AUTH_SECRET || "";

type Action = "accept" | "reject";

export function signAction(bookingId: string, action: Action): string {
  if (!SECRET) throw new Error("BETTER_AUTH_SECRET not configured");
  return crypto
    .createHmac("sha256", SECRET)
    .update(`${bookingId}:${action}`)
    .digest("base64url");
}

export function verifyAction(
  bookingId: string,
  action: string,
  sig: string,
): action is Action {
  if (!SECRET) return false;
  if (action !== "accept" && action !== "reject") return false;
  try {
    const expected = signAction(bookingId, action);
    const a = Buffer.from(sig);
    const b = Buffer.from(expected);
    return a.length === b.length && crypto.timingSafeEqual(a, b);
  } catch {
    return false;
  }
}
