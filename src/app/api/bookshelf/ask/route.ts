import { Redis } from "@upstash/redis";
import { askGenie } from "@/lib/genie";

// Genie takes ~10-20s to plan and run the SQL; keep the function alive for it.
export const maxDuration = 60;

const PER_IP_PER_HOUR = 8;
const GLOBAL_PER_DAY = 300;
const MAX_QUESTION_CHARS = 200;

function redis(): Redis | null {
  const url = process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return new Redis({ url, token });
}

async function overLimit(ip: string): Promise<string | null> {
  const r = redis();
  if (!r) return null;
  const hour = Math.floor(Date.now() / 3_600_000);
  const day = Math.floor(Date.now() / 86_400_000);
  const [ipCount, dayCount] = await Promise.all([
    r.incr(`bookshelf:ip:${ip}:${hour}`),
    r.incr(`bookshelf:global:${day}`),
  ]);
  await Promise.all([
    r.expire(`bookshelf:ip:${ip}:${hour}`, 3700),
    r.expire(`bookshelf:global:${day}`, 90000),
  ]);
  if (dayCount > GLOBAL_PER_DAY) {
    return "The bookshelf has answered a lot of questions today. Try again tomorrow.";
  }
  if (ipCount > PER_IP_PER_HOUR) {
    return "Easy there — a few questions an hour is plenty. Try again soon.";
  }
  return null;
}

export async function POST(request: Request) {
  let question: unknown;
  try {
    ({ question } = await request.json());
  } catch {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  if (typeof question !== "string") {
    return Response.json({ error: "Bad request." }, { status: 400 });
  }
  const cleaned = question.replace(/[\u0000-\u001f\u007f]/g, " ").trim();
  if (cleaned.length < 3 || cleaned.length > MAX_QUESTION_CHARS) {
    return Response.json(
      { error: `Ask a question between 3 and ${MAX_QUESTION_CHARS} characters.` },
      { status: 400 },
    );
  }

  const ip =
    request.headers.get("x-forwarded-for")?.split(",")[0]?.trim() ?? "unknown";
  const limited = await overLimit(ip);
  if (limited) {
    return Response.json({ error: limited }, { status: 429 });
  }

  try {
    const result = await askGenie(cleaned);
    return Response.json(result);
  } catch (err) {
    const message =
      err instanceof Error && /Genie/.test(err.message)
        ? err.message
        : "The lakehouse didn't answer. Try again in a moment.";
    return Response.json({ error: message }, { status: 502 });
  }
}
