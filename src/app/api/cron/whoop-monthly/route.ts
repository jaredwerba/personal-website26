import { NextResponse, type NextRequest } from "next/server";
import { getToken, setSnapshot } from "@/lib/storage";
import { pullMonthlySnapshot, refreshAndPersist } from "@/lib/whoop";

export const runtime = "nodejs";
export const maxDuration = 60;

export async function GET(req: NextRequest) {
  const auth = req.headers.get("authorization");
  const secret = process.env.CRON_SECRET;
  if (!secret || auth !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }

  const current = await getToken();
  if (!current) {
    return NextResponse.json(
      { error: "whoop not connected; visit /api/whoop/connect first" },
      { status: 409 },
    );
  }

  const fresh = await refreshAndPersist(current);
  const snapshot = await pullMonthlySnapshot(fresh.access_token);
  await setSnapshot(snapshot);

  return NextResponse.json({ ok: true, snapshot });
}
