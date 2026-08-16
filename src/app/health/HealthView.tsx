"use client";

import Link from "next/link";
import { Badge, Divider, TerminalDisplay, Gauge } from "@mdrbx/nerv-ui";
import Section from "@/components/Section";
import MetricStack from "@/components/MetricStack";
import type { WhoopSnapshot } from "@/lib/storage";
import {
  STAGGER_MS,
  sweepFraction,
  useSweepElapsed,
  useSweepTrigger,
} from "@/lib/instrument-sweep";
import {
  METRIC_SCALES,
  RECOVERY_VITALS,
  SLEEP_VITALS,
  type MetricKey,
} from "@/lib/health-scales";

type Props = {
  snapshot: WhoopSnapshot | null;
};

/**
 * Gauges read their axis from the same table as the bars, so the two can never
 * disagree about the same number, and null is a third state rather than a
 * needle pinned at zero printing "0%" for a metric that is merely missing.
 */
function MetricGauge({
  metricKey,
  value,
  color,
  threshold,
  sweepIndex = 0,
}: {
  metricKey: MetricKey;
  value: number | null;
  color?: "cyan" | "green" | "orange" | "red" | "magenta";
  threshold?: number;
  /** Position in the cluster, for the startup stagger. */
  sweepIndex?: number;
}) {
  const scale = METRIC_SCALES[metricKey];

  // Gauge derives the needle straight from `value` and tweens nothing, so the
  // sweep has to be driven through the value itself. A happy side effect: the
  // gauge's own readout counts up and back down with the needle, which is
  // exactly what an instrument doing a self-test looks like.
  const elapsed = useSweepElapsed();
  const span = scale.max - scale.min;
  const target = span > 0 ? ((value ?? scale.min) - scale.min) / span : 0;
  const drawn =
    scale.min + sweepFraction(elapsed, sweepIndex * STAGGER_MS, target) * span;

  if (value === null) {
    // Reproduces Gauge's own header so the placeholder reads as an instrument
    // with no reading, rather than as a gap in the layout.
    return (
      <div className="inline-flex flex-col items-center font-mono">
        <div
          className="mb-1 w-[112px] border-b border-current/25 pb-1 text-[10px] uppercase tracking-[0.22em] font-bold text-nerv-mid-gray"
          style={{ fontFamily: "var(--font-nerv-display)" }}
        >
          {scale.label}
        </div>
        <div className="flex h-[94px] w-[120px] items-center justify-center border border-dashed border-nerv-mid-gray/30">
          <span className="font-nerv-mono text-[10px] tracking-[0.16em] text-nerv-mid-gray">
            NO.DATA
          </span>
        </div>
      </div>
    );
  }
  return (
    <Gauge
      value={drawn}
      min={scale.min}
      max={scale.max}
      label={scale.label}
      unit={scale.unit}
      color={color}
      threshold={threshold}
      size={120}
      variant="needle"
    />
  );
}

function daysAgo(iso: string): string {
  const delta = Date.now() - new Date(iso).getTime();
  const hours = Math.round(delta / (1000 * 60 * 60));
  if (hours < 24) return `${hours}H AGO`;
  const days = Math.round(hours / 24);
  return `${days}D AGO`;
}

export default function HealthView({ snapshot }: Props) {
  const connected = snapshot !== null;
  const recovery = snapshot?.recovery_pct_avg ?? null;
  const hrv = snapshot?.hrv_rmssd_avg ?? null;
  const sleep = snapshot?.sleep_performance_pct_avg ?? null;
  const strain = snapshot?.day_strain_avg ?? null;
  // The remaining seven metrics are read inside MetricStack, keyed off the
  // scale table — so a value can no longer be wired to the wrong label.

  const sweepRef = useSweepTrigger<HTMLDivElement>();

  const terminalLines = connected
    ? [
        "> HEALTH MONITORING MODULE v1.0",
        "> SOURCE: WHOOP.DEVELOPER.API",
        `> WINDOW: LAST ${snapshot!.window_days} DAYS`,
        `> LAST.SYNC: ${daysAgo(snapshot!.generated_at)}`,
        `> SAMPLES: RECOVERY=${snapshot!.samples.recovery} SLEEP=${snapshot!.samples.sleep} CYCLE=${snapshot!.samples.cycle}`,
        "> REFRESH.CADENCE: MONTHLY",
      ]
    : [
        "> HEALTH MONITORING MODULE v1.0",
        "> SOURCE: WHOOP.DEVELOPER.API",
        "> STATUS: AWAITING.INITIAL.SYNC",
        "> DATA WILL APPEAR AFTER FIRST CRON RUN.",
      ];

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
          HEALTH
        </h2>
        <Badge
          label={connected ? "LIVE" : "STANDBY"}
          variant={connected ? "success" : "info"}
          size="sm"
        />
      </div>

      <p className="font-nerv-mono text-xs text-nerv-mid-gray tracking-wider">
        // BIOMETRIC.TELEMETRY
      </p>

      <Divider color="cyan" variant="dashed" />

      <TerminalDisplay
        lines={terminalLines}
        typewriter
        typeSpeed={18}
        lineDelay={100}
        color="cyan"
        title="HEALTH.SYS"
        showLineNumbers
        maxHeight="200px"
      />

      <Section label="30D.AVERAGES" color="cyan">
        <div className={`p-4 md:p-6 space-y-6 ${connected ? "" : "opacity-50"}`}>
          {!connected && (
            <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider text-center">
              // SAMPLE.LAYOUT &mdash; NO.LIVE.DATA
            </p>
          )}

          {/* The whole cluster sweeps off one clock when this scrolls into
              view, so the dials and the bars below read as one instrument
              panel coming up rather than as separate widgets. */}
          <div
            ref={sweepRef}
            className="flex flex-wrap justify-center gap-4 md:gap-6"
          >
            <MetricGauge
              metricKey="recovery_pct_avg"
              value={recovery}
              color="green"
              sweepIndex={0}
            />
            <MetricGauge
              metricKey="hrv_rmssd_avg"
              value={hrv}
              color="cyan"
              sweepIndex={1}
            />
            <MetricGauge
              metricKey="sleep_performance_pct_avg"
              value={sleep}
              color="cyan"
              sweepIndex={2}
            />
            {/* Band-optimal: orange base with WHOOP's All Out floor as the
                threshold, so red is earned above 18 rather than permanent. */}
            <MetricGauge
              metricKey="day_strain_avg"
              value={strain}
              color="orange"
              threshold={18}
              sweepIndex={3}
            />
          </div>

          <MetricStack
            title="RECOVERY.VITALS"
            color="cyan"
            scales={RECOVERY_VITALS}
            snapshot={snapshot}
            sweepOffset={4}
          />

          <MetricStack
            title="SLEEP.VITALS"
            color="cyan"
            scales={SLEEP_VITALS}
            snapshot={snapshot}
            sweepOffset={10}
          />

          <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider">
            // SCALE.NOTE &mdash; BARS SHOW POSITION ON THE PRINTED AXIS, NOT A
            SCORE. RANGES ARE DISPLAY SCALES DERIVED FROM WHOOP&rsquo;S PUBLISHED
            DOCUMENTATION &mdash; NOT CLINICAL REFERENCE RANGES.
          </p>
        </div>
      </Section>

      <Divider color="green" variant="dashed" />

      <Link
        href="/ride"
        className="block border border-nerv-orange/40 bg-nerv-orange/[0.04] p-4 md:p-5 hover:border-nerv-orange hover:bg-nerv-orange/[0.08] transition-colors group"
      >
        <div className="flex items-start gap-4">
          <div className="min-w-0 flex-1">
            <p className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-orange uppercase">
              // TRAIN.WITH.ME
            </p>
            <h3 className="font-nerv-display text-lg md:text-xl tracking-[0.14em] text-nerv-white uppercase mt-1 group-hover:text-nerv-orange transition-colors">
              BOOK.A.WEEKEND.RIDE
            </h3>
            <p className="font-nerv-body text-sm text-nerv-white/80 mt-1.5">
              Small-group weekend bike tours out of Boston. Passkey sign-up, pick a
              weekend, I confirm over email.
            </p>
          </div>
          <span className="font-nerv-mono text-base text-nerv-orange shrink-0 group-hover:translate-x-0.5 transition-transform">
            &rarr;
          </span>
        </div>
      </Link>
    </div>
  );
}
