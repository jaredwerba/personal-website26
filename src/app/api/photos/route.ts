import { NextResponse } from "next/server";
import { listPhotos } from "@/lib/photos";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    const photos = await listPhotos();
    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json({ photos: [] });
  }
}
