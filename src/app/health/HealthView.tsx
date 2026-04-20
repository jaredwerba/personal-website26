"use client";

import {
  Badge,
  Divider,
  TerminalDisplay,
  Gauge,
  SyncProgressBar,
  PhaseStatusStack,
} from "@mdrbx/nerv-ui";
import Section from "@/components/Section";
import type { WhoopSnapshot } from "@/lib/storage";

type Props = {
  snapshot: WhoopSnapshot | null;
};

function fmt(value: number | null, suffix = ""): string {
  if (value === null) return "—";
  return `${value}${suffix}`;
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
  const rhr = snapshot?.resting_hr_avg ?? null;
  const spo2 = snapshot?.spo2_pct_avg ?? null;
  const skinTemp = snapshot?.skin_temp_c_avg ?? null;
  const respRate = snapshot?.respiratory_rate_avg ?? null;
  const sleepEff = snapshot?.sleep_efficiency_pct_avg ?? null;
  const sleepCons = snapshot?.sleep_consistency_pct_avg ?? null;
  const sleepDebt = snapshot?.sleep_debt_min_avg ?? null;

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

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Gauge
              value={recovery ?? 0}
              label="RECOVERY"
              unit="%"
              color="green"
              size={120}
              variant="needle"
            />
            <Gauge
              value={hrv ?? 0}
              label="HRV"
              unit=" MS"
              color="cyan"
              size={120}
              variant="ring"
              max={120}
            />
            <Gauge
              value={sleep ?? 0}
              label="SLEEP"
              unit="%"
              color="cyan"
              size={120}
              variant="needle"
            />
            <Gauge
              value={strain ?? 0}
              label="STRAIN"
              unit=""
              color="red"
              size={120}
              variant="needle"
              max={21}
            />
          </div>

          <SyncProgressBar value={connected ? 100 : 0} label="DATA.SYNC" />

          <PhaseStatusStack
            title="RECOVERY.VITALS"
            color="cyan"
            phases={[
              {
                label: "RECOVERY",
                status: recovery !== null ? "ok" : "inactive",
                value: fmt(recovery, "%"),
              },
              {
                label: "HRV",
                status: hrv !== null ? "ok" : "inactive",
                value: fmt(hrv, " MS"),
              },
              {
                label: "RESTING.HR",
                status: rhr !== null ? "ok" : "inactive",
                value: fmt(rhr, " BPM"),
              },
              {
                label: "SPO2",
                status: spo2 !== null ? "ok" : "inactive",
                value: fmt(spo2, "%"),
              },
              {
                label: "SKIN.TEMP",
                status: skinTemp !== null ? "ok" : "inactive",
                value: fmt(skinTemp, "°C"),
              },
              {
                label: "STRAIN",
                status: strain !== null ? "ok" : "inactive",
                value: fmt(strain),
              },
            ]}
          />

          <PhaseStatusStack
            title="SLEEP.VITALS"
            color="cyan"
            phases={[
              {
                label: "PERFORMANCE",
                status: sleep !== null ? "ok" : "inactive",
                value: fmt(sleep, "%"),
              },
              {
                label: "EFFICIENCY",
                status: sleepEff !== null ? "ok" : "inactive",
                value: fmt(sleepEff, "%"),
              },
              {
                label: "CONSISTENCY",
                status: sleepCons !== null ? "ok" : "inactive",
                value: fmt(sleepCons, "%"),
              },
              {
                label: "DEBT",
                status: sleepDebt !== null ? "ok" : "inactive",
                value: fmt(sleepDebt, " MIN"),
              },
              {
                label: "RESP.RATE",
                status: respRate !== null ? "ok" : "inactive",
                value: fmt(respRate, " BPM"),
              },
            ]}
          />
        </div>
      </Section>
    </div>
  );
}
