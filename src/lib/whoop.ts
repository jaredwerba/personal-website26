import { setToken, type WhoopSnapshot, type WhoopToken } from "./storage";

const AUTH_URL = "https://api.prod.whoop.com/oauth/oauth2/auth";
const TOKEN_URL = "https://api.prod.whoop.com/oauth/oauth2/token";
const API_BASE = "https://api.prod.whoop.com/developer";

export const WHOOP_SCOPES = [
  "read:recovery",
  "read:sleep",
  "read:cycles",
  "read:workout",
  "read:profile",
  "offline",
] as const;

function requireEnv(name: string): string {
  const v = process.env[name];
  if (!v) throw new Error(`Missing required env var: ${name}`);
  return v;
}

export function buildAuthUrl(state: string): string {
  const params = new URLSearchParams({
    response_type: "code",
    client_id: requireEnv("WHOOP_CLIENT_ID"),
    redirect_uri: requireEnv("WHOOP_REDIRECT_URI"),
    scope: WHOOP_SCOPES.join(" "),
    state,
  });
  return `${AUTH_URL}?${params.toString()}`;
}

type TokenResponse = {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
};

export async function exchangeCodeForToken(code: string): Promise<WhoopToken> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "authorization_code",
      code,
      client_id: requireEnv("WHOOP_CLIENT_ID"),
      client_secret: requireEnv("WHOOP_CLIENT_SECRET"),
      redirect_uri: requireEnv("WHOOP_REDIRECT_URI"),
    }),
  });
  if (!res.ok) {
    throw new Error(`Whoop token exchange failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as TokenResponse;
  return {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
}

export async function refreshAndPersist(current: WhoopToken): Promise<WhoopToken> {
  const res = await fetch(TOKEN_URL, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({
      grant_type: "refresh_token",
      refresh_token: current.refresh_token,
      client_id: requireEnv("WHOOP_CLIENT_ID"),
      client_secret: requireEnv("WHOOP_CLIENT_SECRET"),
      scope: "offline",
    }),
  });
  if (!res.ok) {
    throw new Error(`Whoop refresh failed: ${res.status} ${await res.text()}`);
  }
  const data = (await res.json()) as TokenResponse;
  const next: WhoopToken = {
    access_token: data.access_token,
    refresh_token: data.refresh_token,
    expires_at: Date.now() + data.expires_in * 1000,
  };
  await setToken(next);
  return next;
}

type Paginated<T> = { records: T[]; next_token?: string | null };

async function fetchAll<T>(
  path: string,
  accessToken: string,
  start: Date,
  end: Date,
): Promise<T[]> {
  const out: T[] = [];
  let nextToken: string | null = null;
  do {
    const params = new URLSearchParams({
      limit: "25",
      start: start.toISOString(),
      end: end.toISOString(),
    });
    if (nextToken) params.set("nextToken", nextToken);
    const res = await fetch(`${API_BASE}${path}?${params.toString()}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      cache: "no-store",
    });
    if (!res.ok) {
      throw new Error(`Whoop GET ${path} failed: ${res.status} ${await res.text()}`);
    }
    const page = (await res.json()) as Paginated<T>;
    out.push(...page.records);
    nextToken = page.next_token ?? null;
  } while (nextToken);
  return out;
}

type RecoveryRecord = {
  score?: {
    recovery_score?: number;
    hrv_rmssd_milli?: number;
    resting_heart_rate?: number;
    spo2_percentage?: number;
    skin_temp_celsius?: number;
  };
};

type SleepRecord = {
  score?: {
    sleep_performance_percentage?: number;
    sleep_efficiency_percentage?: number;
    sleep_consistency_percentage?: number;
    respiratory_rate?: number;
    sleep_needed?: {
      need_from_sleep_debt_milli?: number;
    };
  };
};

type CycleRecord = {
  score?: {
    strain?: number;
  };
};

function numField<T>(records: T[], pick: (r: T) => number | undefined): number[] {
  return records
    .map(pick)
    .filter((n): n is number => typeof n === "number" && !isNaN(n));
}

export async function pullMonthlySnapshot(
  accessToken: string,
  windowDays = 30,
): Promise<WhoopSnapshot> {
  const end = new Date();
  const start = new Date(end.getTime() - windowDays * 24 * 60 * 60 * 1000);

  const [recoveries, sleeps, cycles] = await Promise.all([
    fetchAll<RecoveryRecord>("/v2/recovery", accessToken, start, end),
    fetchAll<SleepRecord>("/v2/activity/sleep", accessToken, start, end),
    fetchAll<CycleRecord>("/v2/cycle", accessToken, start, end),
  ]);

  const sleepDebtMinutes = numField(sleeps, (s) =>
    typeof s.score?.sleep_needed?.need_from_sleep_debt_milli === "number"
      ? s.score.sleep_needed.need_from_sleep_debt_milli / 60000
      : undefined,
  );

  return {
    generated_at: new Date().toISOString(),
    window_days: windowDays,
    recovery_pct_avg: avg(numField(recoveries, (r) => r.score?.recovery_score)),
    hrv_rmssd_avg: avg(numField(recoveries, (r) => r.score?.hrv_rmssd_milli)),
    sleep_performance_pct_avg: avg(numField(sleeps, (s) => s.score?.sleep_performance_percentage)),
    day_strain_avg: avg(numField(cycles, (c) => c.score?.strain), 1),
    resting_hr_avg: avg(numField(recoveries, (r) => r.score?.resting_heart_rate)),
    spo2_pct_avg: avg(numField(recoveries, (r) => r.score?.spo2_percentage), 1),
    skin_temp_c_avg: avg(numField(recoveries, (r) => r.score?.skin_temp_celsius), 1),
    respiratory_rate_avg: avg(numField(sleeps, (s) => s.score?.respiratory_rate), 1),
    sleep_efficiency_pct_avg: avg(numField(sleeps, (s) => s.score?.sleep_efficiency_percentage)),
    sleep_consistency_pct_avg: avg(numField(sleeps, (s) => s.score?.sleep_consistency_percentage)),
    sleep_debt_min_avg: avg(sleepDebtMinutes),
    samples: {
      recovery: recoveries.length,
      sleep: sleeps.length,
      cycle: cycles.length,
    },
  };
}

function avg(values: number[], decimals = 0): number | null {
  if (values.length === 0) return null;
  const m = values.reduce((a, b) => a + b, 0) / values.length;
  const f = Math.pow(10, decimals);
  return Math.round(m * f) / f;
}
