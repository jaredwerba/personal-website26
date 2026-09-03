import { readdir } from "fs/promises";
import { join } from "path";

const PHOTO_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".gif", ".webp", ".avif"]);

export const PHOTO_LOCATIONS = [
  "ANDORRA",
  "BOSTON",
  "CALIFORNIA",
  "CAMBODIA",
  "CHINA",
  "COLOMBIA",
  "COLORADO",
  "COSTA RICA",
  "DOMINICAN REPUBLIC",
  "DUBAI",
  "EL SALVADOR",
  "GUATEMALA",
  "HONDURAS",
  "ICELAND",
  "ITALY",
  "JAPAN",
  "MAINE",
  "MEXICO",
  "MOROCCO",
  "NICARAGUA",
  "PERU",
  "PUERTO RICO",
  "SPAIN",
  "THAILAND",
  "VERMONT",
] as const;

function shuffle<T>(items: T[]): T[] {
  const arr = [...items];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

export async function listPhotos(): Promise<string[]> {
  const photosDir = join(process.cwd(), "public", "photos");
  const files = await readdir(photosDir);
  const photos = files
    .filter((f) => {
      const ext = f.slice(f.lastIndexOf(".")).toLowerCase();
      return PHOTO_EXTENSIONS.has(ext) && !f.startsWith(".");
    })
    .sort()
    .map((f) => `/photos/${f}`);
  return shuffle(photos);
}
