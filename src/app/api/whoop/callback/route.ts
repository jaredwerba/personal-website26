import { NextResponse, type NextRequest } from "next/server";
import { exchangeCodeForToken } from "@/lib/whoop";
import { setToken } from "@/lib/storage";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = new URL(req.url);
  const code = url.searchParams.get("code");
  const state = url.searchParams.get("state");
  const expected = req.cookies.get("whoop_oauth_state")?.value;

  if (!code) {
    return NextResponse.json({ error: "missing code" }, { status: 400 });
  }
  if (!state || state !== expected) {
    return NextResponse.json({ error: "state mismatch" }, { status: 400 });
  }

  const token = await exchangeCodeForToken(code);
  await setToken(token);

  const res = NextResponse.json({
    ok: true,
    message:
      "WHOOP connected. Refresh token stored. You can close this tab. Trigger /api/cron/whoop-monthly to populate the first snapshot.",
    expires_at: new Date(token.expires_at).toISOString(),
  });
  res.cookies.delete("whoop_oauth_state");
  return res;
}
