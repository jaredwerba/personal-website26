import { headers } from "next/headers";
import { NextResponse } from "next/server";
import { Resend } from "resend";
import { auth } from "@/lib/auth";
import { isAdmin, getAdminEmail } from "@/lib/admin";

export const dynamic = "force-dynamic";
export const runtime = "nodejs";

// GET /api/admin/test-email
// Sends a test email to ADMIN_EMAIL so you can verify Resend + DNS + inbox
// filtering are all actually working end-to-end.
//
// Gated by the admin session, so non-admins and unauthenticated visitors
// can't use this to trigger arbitrary sends.

export async function GET() {
  const session = await auth.api.getSession({ headers: await headers() });

  // Diagnostic endpoint — we give back *why* it's forbidden, not just a bare
  // "forbidden", so you can tell whether the session is missing entirely or
  // whether you're signed in as the wrong account.
  if (!session?.user) {
    return NextResponse.json(
      {
        ok: false,
        reason: "not_signed_in",
        hint: "Sign in at /ride first, then reload this URL in the same browser.",
        expectedAdminEmail: getAdminEmail(),
      },
      { status: 401 },
    );
  }
  if (!isAdmin(session.user.email)) {
    return NextResponse.json(
      {
        ok: false,
        reason: "not_admin",
        signedInAs: session.user.email ?? null,
        expectedAdminEmail: getAdminEmail(),
        hint: "Your session's email doesn't match ADMIN_EMAIL. Either sign in as the admin account, or set ADMIN_EMAIL on Vercel to match the email above.",
      },
      { status: 403 },
    );
  }

  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.FROM_EMAIL || "rides@jwerba.com";
  const to = getAdminEmail();

  if (!apiKey) {
    return NextResponse.json(
      { ok: false, error: "RESEND_API_KEY not set on this deployment" },
      { status: 500 },
    );
  }

  const resend = new Resend(apiKey);
  try {
    const result = await resend.emails.send({
      from,
      to,
      subject: "[test] admin email smoke test",
      text: `If you're reading this at ${to}, your Resend + DNS setup works.

From: ${from}
Sent at: ${new Date().toISOString()}
Env: ${process.env.VERCEL_ENV || process.env.NODE_ENV}

If you DIDN'T get this but the request returned ok, check:
1. Spam / junk folder
2. Resend dashboard → Logs (filter by "to: ${to}")
3. DNS records for jwerba.com (SPF, DKIM, DMARC)
`,
    });
    return NextResponse.json({
      ok: true,
      from,
      to,
      resendId: result.data?.id ?? null,
      error: result.error ?? null,
    });
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    console.error("[admin/test-email] send failed:", err);
    return NextResponse.json({ ok: false, from, to, error: msg }, { status: 500 });
  }
}
