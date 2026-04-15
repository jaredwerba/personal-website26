import { NextResponse } from "next/server";
import { readdir } from "fs/promises";
import { join } from "path";

const PHOTO_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"]);

export async function GET() {
  const photosDir = join(process.cwd(), "public", "photos");

  try {
    const files = await readdir(photosDir);
    const photos = files
      .filter((f) => {
        const ext = f.slice(f.lastIndexOf(".")).toLowerCase();
        return PHOTO_EXTENSIONS.has(ext) && !f.startsWith(".");
      })
      .sort()
      .map((f) => `/photos/${f}`);

    return NextResponse.json({ photos });
  } catch {
    return NextResponse.json({ photos: [] });
  }
}
