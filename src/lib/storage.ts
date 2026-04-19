import { Redis } from "@upstash/redis";

export type WhoopToken = {
  access_token: string;
  refresh_token: string;
  expires_at: number;
};

export type WhoopSnapshot = {
  generated_at: string;
  window_days: number;
  recovery_pct_avg: number | null;
  hrv_rmssd_avg: number | null;
  sleep_performance_pct_avg: number | null;
  day_strain_avg: number | null;
  samples: {
    recovery: number;
    sleep: number;
    cycle: number;
  };
};

const TOKEN_KEY = "whoop:token";
const SNAPSHOT_KEY = "whoop:snapshot";

let cached: Redis | null = null;

function redisCreds(): { url: string; token: string } | null {
  const url =
    process.env.UPSTASH_REDIS_REST_URL ?? process.env.KV_REST_API_URL;
  const token =
    process.env.UPSTASH_REDIS_REST_TOKEN ?? process.env.KV_REST_API_TOKEN;
  if (!url || !token) return null;
  return { url, token };
}

function redis(): Redis {
  if (cached) return cached;
  const creds = redisCreds();
  if (!creds) {
    throw new Error(
      "Upstash Redis not configured. Set UPSTASH_REDIS_REST_URL / UPSTASH_REDIS_REST_TOKEN or the Vercel-integrated KV_REST_API_URL / KV_REST_API_TOKEN.",
    );
  }
  cached = new Redis(creds);
  return cached;
}

export async function getToken(): Promise<WhoopToken | null> {
  return (await redis().get<WhoopToken>(TOKEN_KEY)) ?? null;
}

export async function setToken(token: WhoopToken): Promise<void> {
  await redis().set(TOKEN_KEY, token);
}

export async function getSnapshot(): Promise<WhoopSnapshot | null> {
  return (await redis().get<WhoopSnapshot>(SNAPSHOT_KEY)) ?? null;
}

export async function setSnapshot(snapshot: WhoopSnapshot): Promise<void> {
  await redis().set(SNAPSHOT_KEY, snapshot);
}

export function isStorageConfigured(): boolean {
  return redisCreds() !== null;
}
