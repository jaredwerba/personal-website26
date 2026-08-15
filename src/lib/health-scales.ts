// ── /health display scales ──────────────────────────────────────────────────
// Every bar on /health is a POSITION on a declared axis, never a "score".
// Nothing here is a health assessment; these are display conventions for a
// trained adult male endurance cyclist, not clinical reference ranges.

import type { WhoopSnapshot } from "@/lib/storage";

/**
 * Direction is documentation + a config invariant, NOT geometry. Marker
 * position is always (value - min) / (max - min), so the inverted-fill class of
 * bug — where RESTING.HR 45 is drawn 78% full under a left-to-right "35 … 80"
 * axis — cannot occur.
 */
export type MetricDirection = "higher-better" | "lower-better" | "band-better";

/** Inclusive [lo, hi]. `good` must be a subset of `fair` (asserted at load). */
export type Band = readonly [number, number];

export type MetricStatus = "good" | "fair" | "out" | "unknown";

/** The numeric fields of WhoopSnapshot, listed so a typo is a compile error. */
export type MetricKey =
  | "recovery_pct_avg"
  | "hrv_rmssd_avg"
  | "resting_hr_avg"
  | "spo2_pct_avg"
  | "skin_temp_c_avg"
  | "day_strain_avg"
  | "sleep_performance_pct_avg"
  | "sleep_efficiency_pct_avg"
  | "sleep_consistency_pct_avg"
  | "sleep_debt_min_avg"
  | "respiratory_rate_avg";

type _AssertKeys = MetricKey extends keyof WhoopSnapshot ? true : never;
const _assertKeys: _AssertKeys = true;
void _assertKeys;

export type MetricScale = {
  readonly key: MetricKey;
  readonly label: string;
  /** Suffix appended verbatim, matching the page's existing fmt() strings. */
  readonly unit: string;
  readonly min: number;
  readonly max: number;
  readonly direction: MetricDirection;
  readonly good: Band;
  readonly fair: Band;
  /** true = WHOOP publishes this axis and/or these bands. */
  readonly whoopDefined: boolean;
  /**
   * false = render a value readout with NO track. Reserved for metrics where a
   * position on any axis would imply a score the number cannot support.
   */
  readonly track: boolean;
  /** Why this axis exists. Surfaced in the tooltip and the aria description. */
  readonly basis: string;
};

export type MetricReading = {
  readonly hasValue: boolean;
  /** Marker position across the track, 0-100, clamped to the axis. */
  readonly positionPct: number;
  readonly status: MetricStatus;
  readonly clampedAt: "min" | "max" | null;
};

function inBand(value: number, band: Band): boolean {
  return value >= band[0] && value <= band[1];
}

/**
 * Overshooting the BETTER end of a one-sided metric is not a defect — HRV
 * 200 ms is elite, an RHR under the 35 bpm axis floor is elite, and WHOOP sleep
 * performance legitimately exceeds 100%. So grading saturates on the good side
 * only. Overshooting the bad end still grades "out". Band-optimal metrics grade
 * raw, because for them both directions genuinely carry meaning.
 */
function gradingValue(value: number, scale: MetricScale): number {
  switch (scale.direction) {
    case "higher-better":
      return Math.min(value, scale.max);
    case "lower-better":
      return Math.max(value, scale.min);
    case "band-better":
      return value;
  }
}

/**
 * Grades the RAW value, never the position-clamped one. Clamping is a drawing
 * concern; if it fed the grade, an out-of-range reading could be pinned to an
 * edge that sits inside a band and be reported as healthy.
 */
export function gradeMetric(value: number, scale: MetricScale): MetricStatus {
  const v = gradingValue(value, scale);
  if (inBand(v, scale.good)) return "good";
  if (inBand(v, scale.fair)) return "fair";
  return "out";
}

export function readMetric(
  value: number | null | undefined,
  scale: MetricScale,
): MetricReading {
  // Null is a THIRD state, never zero. Coercing a missing metric to 0 would
  // draw a real reading of zero, which on this page reads as a health claim.
  if (value === null || value === undefined || !Number.isFinite(value)) {
    return { hasValue: false, positionPct: 0, status: "unknown", clampedAt: null };
  }

  const span = Math.max(Number.EPSILON, scale.max - scale.min);
  const clampedAt = value < scale.min ? "min" : value > scale.max ? "max" : null;
  const bounded = Math.min(scale.max, Math.max(scale.min, value));

  return {
    hasValue: true,
    positionPct: ((bounded - scale.min) / span) * 100,
    status: gradeMetric(value, scale),
    clampedAt,
  };
}

/** Band -> {leftPct, widthPct}. Mirrors GradientStatusBar's own toPercent. */
export function bandRect(
  band: Band,
  scale: MetricScale,
): { leftPct: number; widthPct: number } {
  const span = Math.max(Number.EPSILON, scale.max - scale.min);
  const toPct = (v: number) =>
    Math.max(0, Math.min(100, ((v - scale.min) / span) * 100));
  const left = toPct(band[0]);
  return { leftPct: left, widthPct: Math.max(0, toPct(band[1]) - left) };
}

/**
 * Matches the page's existing fmt(): em-dash for null. Rounded to one decimal
 * so the value column can never be widened by a long float arriving from the
 * API — the column width must not depend on an invariant held in another file.
 */
export function formatMetric(
  value: number | null | undefined,
  scale: MetricScale,
): string {
  if (value === null || value === undefined || !Number.isFinite(value)) return "—";
  return `${Math.round(value * 10) / 10}${scale.unit}`;
}

const DIRECTION_TEXT: Record<MetricDirection, string> = {
  "higher-better": "higher is better",
  "lower-better": "lower is better",
  "band-better": "target band, both directions matter",
};

/**
 * The target as the grader actually applies it. One-sided metrics saturate on
 * their good end — HRV 200 ms grades good even though the axis stops at 120 —
 * so printing a closed "65–120" would describe behaviour the code does not
 * have. Only band-optimal metrics get a closed interval, because for them both
 * edges are real.
 */
export function targetText(scale: MetricScale): string {
  switch (scale.direction) {
    case "higher-better":
      return `target ≥${scale.good[0]}${scale.unit}`;
    case "lower-better":
      return `target ≤${scale.good[1]}${scale.unit}`;
    case "band-better":
      return `target ${scale.good[0]}–${scale.good[1]}${scale.unit}`;
  }
}

export const STATUS_TEXT: Record<MetricStatus, string> = {
  good: "in target",
  fair: "near target",
  out: "outside target",
  unknown: "no reading",
};

/** Short, spoken form for the meter. The long prose lives in SCALE.NOTES. */
export function describeMetric(
  value: number | null | undefined,
  scale: MetricScale,
): string {
  const reading = readMetric(value, scale);
  const head = formatMetric(value, scale);
  if (!scale.track) return `${head}, not scored`;
  // No em-dash join here: formatMetric already returns "—" when the value is
  // missing, and joining with another one printed a double em-dash.
  return `${head}, ${STATUS_TEXT[reading.status]}, scale ${scale.min}–${scale.max}${scale.unit}, ${targetText(scale)}`;
}

// ── The table ───────────────────────────────────────────────────────────────
// whoopDefined:true  = range and/or bands published by WHOOP.
// whoopDefined:false = display axis chosen here. NOT a clinical reference range.

export const METRIC_SCALES: Record<MetricKey, MetricScale> = {
  recovery_pct_avg: {
    key: "recovery_pct_avg",
    label: "RECOVERY",
    unit: "%",
    min: 0,
    max: 100,
    direction: "higher-better",
    good: [67, 100],
    fair: [34, 100],
    whoopDefined: true,
    track: true,
    basis:
      "WHOOP defines recovery as a score from 0-100%, with published bands: green 67-100, yellow 34-66, red 0-33. The one metric where a 0-100 axis is correct rather than lazy — 0 is genuinely attainable.",
  },
  hrv_rmssd_avg: {
    key: "hrv_rmssd_avg",
    label: "HRV",
    unit: " MS",
    min: 20,
    max: 120,
    direction: "higher-better",
    good: [65, 120],
    fair: [40, 120],
    whoopDefined: false,
    track: true,
    basis:
      "Display axis. WHOOP reports nocturnal RMSSD in ms but publishes no bounded scale; 65 ms is its stated male member average and its 26-35 age band runs roughly 50-90 ms. 120 sits above that band while staying under elite-endurance outliers.",
  },
  resting_hr_avg: {
    key: "resting_hr_avg",
    label: "RESTING.HR",
    unit: " BPM",
    min: 35,
    max: 80,
    direction: "lower-better",
    good: [35, 55],
    fair: [35, 70],
    whoopDefined: false,
    track: true,
    basis:
      "Display axis. 35 bpm is a practical floor for a trained endurance athlete; 55 is WHOOP's stated male member average; 80 is the upper part of the conventional 60-100 band. A 0-based axis would be meaningless — 0 bpm is death, not an axis floor.",
  },
  spo2_pct_avg: {
    key: "spo2_pct_avg",
    label: "SPO2",
    unit: "%",
    min: 90,
    max: 100,
    direction: "higher-better",
    good: [95, 100],
    fair: [93, 100],
    whoopDefined: false,
    track: true,
    basis:
      "Truncated display axis on WHOOP-cited bounds (normal 95-100%). On a 0-100 axis a reading of 90 would still draw a 90%-full bar, which is the misleading case this avoids.",
  },
  skin_temp_c_avg: {
    key: "skin_temp_c_avg",
    label: "SKIN.TEMP",
    unit: "°C",
    min: 31,
    max: 37,
    direction: "band-better",
    good: [33, 36],
    fair: [32, 36.5],
    whoopDefined: false,
    track: false,
    basis:
      "Readout only, no track — deliberately. WHOOP does not score skin temperature as a level; it reports deviation from a 90-night personal baseline, because absolute nocturnal wrist temperature depends on room temp and bedding. A 30-day mean makes deviation zero by construction, so no position on any axis would be meaningful.",
  },
  day_strain_avg: {
    key: "day_strain_avg",
    label: "STRAIN",
    unit: "",
    min: 0,
    max: 21,
    direction: "band-better",
    // Bands are WHOOP's own zone edges, not rounder numbers near them: the
    // target is moderate+high (10-17), and out begins at all-out (18+). A band
    // that split a published zone would contradict the zones printed alongside.
    good: [10, 17],
    fair: [5, 19],
    whoopDefined: true,
    track: true,
    basis:
      "WHOOP defines strain 0-21 (light 0-9, moderate 10-13, high 14-17, all-out 18-21). The target here is moderate-to-high; sustained all-out is overreaching, not achievement. Band-optimal, not higher-is-better — WHOOP's thesis is matching strain to recovery. The scale is logarithmic; this track is linear, as WHOOP's own dial is.",
  },
  sleep_performance_pct_avg: {
    key: "sleep_performance_pct_avg",
    label: "PERFORMANCE",
    unit: "%",
    min: 0,
    max: 100,
    direction: "higher-better",
    good: [85, 100],
    fair: [70, 100],
    whoopDefined: true,
    track: true,
    basis:
      "WHOOP sleep performance is 0-100% (time asleep over sleep need). Bands are WHOOP's own Sleep Coach targets: get-by 70, perform 85, peak 100. Axis deliberately not truncated — this is WHOOP's own presentation of a WHOOP-branded number.",
  },
  sleep_efficiency_pct_avg: {
    key: "sleep_efficiency_pct_avg",
    label: "EFFICIENCY",
    unit: "%",
    min: 70,
    max: 100,
    direction: "band-better",
    // fair stops at 98, not at the axis max: pinning it to 100 meant the
    // top-end concern this basis string raises could never actually render.
    good: [88, 96],
    fair: [80, 98],
    whoopDefined: false,
    track: true,
    basis:
      "Display axis. Sleep-medicine convention treats 85% or higher as normal. Band-optimal because WHOOP notes that consistently exceeding roughly 96% can indicate sleep deprivation, so the top of the axis is not the best place to be.",
  },
  sleep_consistency_pct_avg: {
    key: "sleep_consistency_pct_avg",
    label: "CONSISTENCY",
    unit: "%",
    min: 0,
    max: 100,
    direction: "higher-better",
    good: [80, 100],
    fair: [60, 100],
    whoopDefined: true,
    track: true,
    basis:
      "WHOOP scores sleep consistency 0-100% by comparing last night's timing against the previous four days. 80% is a commonly cited circadian-alignment target.",
  },
  sleep_debt_min_avg: {
    key: "sleep_debt_min_avg",
    label: "DEBT",
    unit: " MIN",
    min: 0,
    max: 120,
    direction: "lower-better",
    good: [0, 30],
    fair: [0, 60],
    whoopDefined: false,
    track: true,
    basis:
      "Display axis; unlike RHR or SpO2, zero is a genuine attainable floor here. WHOOP publishes no maximum, so 120 min is an editorial ceiling for a substantial deficit.",
  },
  respiratory_rate_avg: {
    key: "respiratory_rate_avg",
    label: "RESP.RATE",
    unit: " RPM",
    // Axis runs past the normal band on both sides so the whole cited range
    // (12-20) can sit inside the target. The earlier 10-20 axis graded 19 rpm
    // red while the basis printed beside it called 12-20 normal.
    min: 8,
    max: 24,
    direction: "band-better",
    good: [12, 20],
    fair: [10, 22],
    whoopDefined: false,
    track: true,
    basis:
      "Display axis on WHOOP-cited norms: 12-20 rpm is the normal resting adult range, and the whole of it is target. WHOOP's framing rests on change from a personal baseline rather than the absolute number, so position here is context, not a verdict.",
  },
};

/** Render order. Split matches the page's two existing stacks. */
export const RECOVERY_VITALS: readonly MetricScale[] = [
  METRIC_SCALES.recovery_pct_avg,
  METRIC_SCALES.hrv_rmssd_avg,
  METRIC_SCALES.resting_hr_avg,
  METRIC_SCALES.spo2_pct_avg,
  METRIC_SCALES.day_strain_avg,
  METRIC_SCALES.skin_temp_c_avg,
];

export const SLEEP_VITALS: readonly MetricScale[] = [
  METRIC_SCALES.sleep_performance_pct_avg,
  METRIC_SCALES.sleep_efficiency_pct_avg,
  METRIC_SCALES.sleep_consistency_pct_avg,
  METRIC_SCALES.sleep_debt_min_avg,
  METRIC_SCALES.respiratory_rate_avg,
];

// ── Config invariants (dev only) ────────────────────────────────────────────
// A malformed scale must fail loudly, not render a plausible-looking picture.
// Direction must match band SHAPE, because band shape is what the reader sees:
// left-anchored = lower-better, right-anchored = higher-better, floating = band.
if (process.env.NODE_ENV !== "production") {
  for (const [key, s] of Object.entries(METRIC_SCALES)) {
    const fail = (msg: string) => {
      throw new Error(`METRIC_SCALES.${key}: ${msg}`);
    };
    if (s.max <= s.min) fail("max must exceed min");
    if (s.good[0] > s.good[1]) fail("good band is inverted");
    if (s.fair[0] > s.fair[1]) fail("fair band is inverted");
    if (s.good[0] < s.fair[0] || s.good[1] > s.fair[1])
      fail("good must be a subset of fair");
    if (s.fair[0] < s.min || s.fair[1] > s.max) fail("fair band escapes the axis");
    if (s.direction === "higher-better" && s.good[1] !== s.max)
      fail("higher-better requires a right-anchored good band");
    if (s.direction === "lower-better" && s.good[0] !== s.min)
      fail("lower-better requires a left-anchored good band");
    if (s.direction === "band-better" && (s.good[0] <= s.min || s.good[1] >= s.max))
      fail("band-better requires a good band strictly inside the axis");
    // A good band covering the whole axis grades every possible reading "good".
    // That is the eleven-identical-bars bug reinstated in the config, so it has
    // to fail here rather than render as a confident, meaningless picture.
    if (s.good[0] <= s.min && s.good[1] >= s.max)
      fail("good band spans the entire axis — every value would grade good");
  }
}
