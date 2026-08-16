"use client";

import type { WhoopSnapshot } from "@/lib/storage";
import {
  STAGGER_MS,
  sweepFraction,
  useSweepElapsed,
} from "@/lib/instrument-sweep";
import {
  bandRect,
  describeMetric,
  formatMetric,
  readMetric,
  targetText,
  type MetricScale,
  type MetricStatus,
} from "@/lib/health-scales";

type MetricStackProps = {
  title: string;
  color?: "orange" | "green" | "cyan";
  /** Scales in render order. Values are pulled from the snapshot by key. */
  scales: readonly MetricScale[];
  snapshot: WhoopSnapshot | null;
  /** Where this stack starts in the cluster, so the stagger runs unbroken
   *  through both stacks instead of restarting at the second one. */
  sweepOffset?: number;
};

// Lifted from nerv-ui's PhaseStatusStack so the two read as one component.
const titleColorMap: Record<string, string> = {
  orange: "text-nerv-orange",
  green: "text-nerv-green",
  cyan: "text-nerv-cyan",
};

const MARKER_COLOR: Record<MetricStatus, string> = {
  good: "bg-nerv-green",
  fair: "bg-nerv-amber",
  out: "bg-nerv-red",
  unknown: "bg-nerv-mid-gray",
};

const MARKER_BORDER: Record<MetricStatus, string> = {
  good: "border-nerv-green",
  fair: "border-nerv-amber",
  out: "border-nerv-red",
  unknown: "border-nerv-mid-gray",
};

/**
 * "good" is white, not green. Most rows grade good, and colouring all of them
 * defeats the point — the amber rows must be the thing that pops. This also
 * replaces nerv-ui's statusTextMap, which paints this column text-nerv-black
 * (#000) on a bg-black/70 row over a #000 body: contrast 1:1, i.e. every value
 * on the live page was invisible.
 */
const VALUE_COLOR: Record<MetricStatus, string> = {
  good: "text-nerv-white",
  fair: "text-nerv-amber",
  out: "text-nerv-red",
  unknown: "text-nerv-mid-gray",
};

const SCANLINE =
  "repeating-linear-gradient(90deg, transparent, transparent 6px, rgba(0,0,0,0.38) 6px, rgba(0,0,0,0.38) 7px)";

const ROW =
  "grid grid-cols-[76px_minmax(0,1fr)_52px] items-center gap-2 border border-white/10 bg-black/70 px-2 py-1";
const ROW_BORDER = { borderColor: "rgba(224,224,224,0.08)" } as const;
const MONO = { fontFamily: "var(--font-nerv-mono)" } as const;

/**
 * One metric row. The bar draws WHERE THE VALUE SITS on the metric's own axis —
 * never how full a tank is. A left-anchored fill semantically asserts
 * "more is better", which is true for only five of these eleven metrics, so a
 * fill would be wrong for RESTING.HR and DEBT and meaningless for STRAIN,
 * EFFICIENCY and RESP.RATE. Position is computed identically for every metric
 * and is never inverted; direction is carried by the SHAPE of the drawn target
 * band instead — flush left = lower-better, flush right = higher-better,
 * floating = band-optimal.
 *
 * There is deliberately no tooltip. The prose disclosure lives in the
 * SCALE.NOTES block below the stack, which is reachable by touch — nerv-ui's
 * Tooltip binds mouse and focus only, and its whitespace-nowrap body rendered
 * these 200+ character strings wider than the viewport, clipped at both ends.
 */
function MetricRow({
  scale,
  value,
  sweepIndex,
}: {
  scale: MetricScale;
  value: number | null;
  /** Position in the cluster, for the startup stagger. */
  sweepIndex: number;
}) {
  const reading = readMetric(value, scale);
  const status = reading.status;
  const readout = formatMetric(value, scale);
  const description = describeMetric(value, scale);

  // The marker travels the full track and settles on the reading, in step with
  // the dials above. Only the marker moves: the value readout, the status
  // colour and the target band all describe the real number and would be lying
  // if they animated with it.
  const elapsed = useSweepElapsed();
  const drawnPct =
    sweepFraction(elapsed, sweepIndex * STAGGER_MS, reading.positionPct / 100) *
    100;

  // Metrics whose absolute value cannot support a position on any axis get a
  // readout and an explicit note instead of a bar. Showing that we know which
  // number does not deserve geometry is worth more than one more bar.
  if (!scale.track) {
    return (
      <div className={ROW} style={ROW_BORDER}>
        <span
          className="truncate text-[9px] uppercase tracking-[0.14em] text-nerv-white/62"
          style={MONO}
        >
          {scale.label}
        </span>
        <span
          className="block truncate text-[8px] uppercase tracking-[0.1em] text-nerv-mid-gray"
          style={MONO}
        >
          {"// NO.SCALE"}
        </span>
        {/* No band lookup ran, so no status colour: an unscored metric must not
            borrow the palette that means "graded". */}
        <span
          className={`text-right text-[9px] font-bold uppercase ${
            reading.hasValue ? "text-nerv-white" : "text-nerv-mid-gray"
          }`}
          style={MONO}
        >
          <span className="sr-only">{`${scale.label}: `}</span>
          {readout}
        </span>
      </div>
    );
  }

  const fair = bandRect(scale.fair, scale);
  const good = bandRect(scale.good, scale);

  // aria-valuenow must stay inside [valuemin, valuemax] to be valid, so it
  // carries the clamped position while aria-valuetext carries the real reading.
  const ariaNow = Math.min(scale.max, Math.max(scale.min, value ?? scale.min));

  const track = (
    <div className="relative h-[18px] border border-white/10 bg-black/60">
      {/* Bands + axis numerals, clipped. The marker layer sits outside this so
          a pegged marker is not sliced in half by overflow-hidden. */}
      <div className="absolute inset-0 overflow-hidden">
        <div
          className="absolute inset-y-0 bg-nerv-white/[0.06]"
          style={{ left: `${fair.leftPct}%`, width: `${fair.widthPct}%` }}
        />
        {/* border-x is deliberate non-colour redundancy: the extent of the
            target band stays readable without relying on green/amber/red. */}
        <div
          className="absolute inset-y-0 border-x border-nerv-green/30 bg-nerv-green/[0.14]"
          style={{ left: `${good.leftPct}%`, width: `${good.widthPct}%` }}
        />
        <div className="absolute inset-0" style={{ backgroundImage: SCANLINE }} />
        {/* The axis is printed on its own ends. Five of these axes are
            truncated, and an unlabelled truncated axis is the thing a technical
            reader is right to call misleading — so the endpoints are never
            conditionally dropped. Hiding them when the marker gets close would
            remove the label exactly at the best and worst readings. The marker
            is a later sibling, so it draws over them. */}
        <span
          className="absolute left-1 top-1/2 -translate-y-1/2 text-[8px] leading-none text-nerv-white/40"
          style={MONO}
        >
          {scale.min}
        </span>
        <span
          className="absolute right-1 top-1/2 -translate-y-1/2 text-[8px] leading-none text-nerv-white/40"
          style={MONO}
        >
          {scale.max}
        </span>
      </div>

      {/* Same coordinate box as the bands (inset-0), so a marker can never land
          on the wrong side of a band edge it should coincide with. */}
      {reading.hasValue && (
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-y-0" style={{ left: `${drawnPct}%` }}>
            {/* nerv-ui's own marker idiom, lifted from GradientStatusBar: a
                hairline plus a flag tab. Reads as an instrument pointer rather
                than a stray 2px line. */}
            <div
              className={`absolute inset-y-0 w-[2px] -translate-x-1/2 ${MARKER_COLOR[status]}`}
            />
            <div
              className={`absolute -top-px h-[5px] w-[8px] -translate-x-1/2 border-x border-t ${MARKER_BORDER[status]}`}
            />
          </div>
        </div>
      )}

      {/* The axis ran out. A plain edge bar was indistinguishable from a value
          legitimately sitting on the endpoint, so the peg is drawn as a
          chevron gutter. Takes the STATUS colour, not a fixed red — pinning at
          the good end (HRV 200 ms) is not an error. */}
      {reading.clampedAt !== null && (
        <div
          className={`pointer-events-none absolute inset-y-0 flex w-[9px] items-center justify-center text-[8px] font-bold leading-none text-nerv-black ${
            MARKER_COLOR[status]
          } ${reading.clampedAt === "max" ? "right-0" : "left-0"}`}
          style={MONO}
        >
          {reading.clampedAt === "max" ? "»" : "«"}
        </div>
      )}
    </div>
  );

  return (
    <div className={ROW} style={ROW_BORDER}>
      <span
        className="truncate text-[9px] uppercase tracking-[0.14em] text-nerv-white/62"
        style={MONO}
      >
        {scale.label}
      </span>

      {reading.hasValue ? (
        <div
          role="meter"
          aria-label={scale.label}
          aria-valuenow={ariaNow}
          aria-valuemin={scale.min}
          aria-valuemax={scale.max}
          aria-valuetext={description}
        >
          {track}
        </div>
      ) : (
        // role="meter" without a value is invalid, so the empty track is just
        // a picture and the absence is announced as text.
        <div>
          <span className="sr-only">{`${scale.label}: no reading`}</span>
          <div aria-hidden="true">{track}</div>
        </div>
      )}

      <span
        className={`text-right text-[9px] font-bold uppercase ${VALUE_COLOR[status]}`}
        style={MONO}
        aria-hidden="true"
      >
        {readout}
      </span>
    </div>
  );
}

/**
 * The disclosure. Every axis on this page is a choice, and five of them are
 * truncated — so how each one was drawn has to be readable, not hidden behind
 * a hover. A native <details> opens on touch, on keyboard and in a screen
 * reader, and collapses to one line when nobody asks.
 */
function ScaleNotes({ scales }: { scales: readonly MetricScale[] }) {
  return (
    <details className="mt-1 border border-white/10 bg-black/70 px-2 py-1">
      <summary
        className="cursor-pointer list-none text-[9px] uppercase tracking-[0.14em] text-nerv-cyan/70 hover:text-nerv-cyan"
        style={MONO}
      >
        {"// SCALE.NOTES"}
      </summary>
      <dl className="mt-2 space-y-2">
        {scales.map((scale) => (
          <div key={scale.key}>
            <dt
              className="text-[9px] uppercase tracking-[0.14em] text-nerv-white/70"
              style={MONO}
            >
              {scale.label}
              {" — "}
              {scale.track
                ? `${scale.min}–${scale.max}${scale.unit}, ${targetText(scale)}`
                : "no scale"}
              {/* Which axes are WHOOP's and which are ours is the single most
                  load-bearing distinction on the page. It is stated per row,
                  not buried in a footer. */}
              <span className="ml-1 text-nerv-mid-gray">
                {scale.whoopDefined ? "[WHOOP]" : "[DISPLAY AXIS]"}
              </span>
            </dt>
            <dd
              className="mt-0.5 font-nerv-body text-[11px] leading-relaxed text-nerv-white/55"
            >
              {scale.basis}
            </dd>
          </div>
        ))}
      </dl>
    </details>
  );
}

export default function MetricStack({
  title,
  color = "cyan",
  scales,
  snapshot,
  sweepOffset = 0,
}: MetricStackProps) {
  return (
    <div className="flex flex-col">
      <div
        className={`mb-1 border-b border-current/25 pb-1 text-[10px] uppercase tracking-[0.22em] font-bold ${titleColorMap[color]}`}
        style={{ fontFamily: "var(--font-nerv-display)" }}
      >
        {title}
      </div>
      <div className="flex flex-col gap-[3px]">
        {scales.map((scale, i) => (
          <MetricRow
            key={scale.key}
            scale={scale}
            value={snapshot?.[scale.key] ?? null}
            sweepIndex={sweepOffset + i}
          />
        ))}
      </div>
      <ScaleNotes scales={scales} />
    </div>
  );
}
