"use client";

import {
  Badge,
  Divider,
  TerminalDisplay,
  Gauge,
  SyncProgressBar,
  PhaseStatusStack,
  CountdownTimer,
} from "@mdrbx/nerv-ui";
import Section from "@/components/Section";

export default function HealthPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
          HEALTH
        </h2>
        <Badge label="COMING SOON" variant="info" size="sm" />
      </div>

      <p className="font-nerv-mono text-xs text-nerv-mid-gray tracking-wider">
        // BIOMETRIC.TELEMETRY
      </p>

      <Divider color="cyan" variant="dashed" />

      <TerminalDisplay
        lines={[
          "> HEALTH MONITORING MODULE v0.1",
          "> INTEGRATION TARGETS:",
          ">   - APPLE.HEALTH.KIT",
          ">   - WHOOP.RECOVERY.API",
          "> STATUS: AWAITING.CONNECTION",
          "> THIS MODULE IS UNDER DEVELOPMENT.",
          "> CHECK BACK SOON FOR LIVE BIOMETRIC DATA.",
        ]}
        typewriter
        typeSpeed={20}
        lineDelay={120}
        color="cyan"
        title="HEALTH.SYS"
        showLineNumbers
        maxHeight="200px"
      />

      <Section label="BIOMETRIC.PREVIEW" color="cyan">
        <div className="p-4 md:p-6 space-y-6 opacity-50">
          <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider text-center">
            // SAMPLE.LAYOUT &mdash; NO.LIVE.DATA
          </p>

          <div className="flex flex-wrap justify-center gap-4 md:gap-6">
            <Gauge
              value={72}
              label="HEART.RATE"
              unit=" BPM"
              color="red"
              size={120}
              variant="needle"
              max={200}
            />
            <Gauge
              value={97}
              label="SPO2"
              unit="%"
              color="cyan"
              size={120}
              variant="ring"
            />
            <Gauge
              value={68}
              label="RECOVERY"
              unit="%"
              color="green"
              size={120}
              variant="needle"
            />
          </div>

          <SyncProgressBar value={0} label="DATA.SYNC" />

          <PhaseStatusStack
            title="VITALS.STATUS"
            color="cyan"
            phases={[
              { label: "HEART.RATE", status: "inactive", value: "—" },
              { label: "HRV", status: "inactive", value: "—" },
              { label: "SLEEP.SCORE", status: "inactive", value: "—" },
              { label: "RECOVERY", status: "inactive", value: "—" },
              { label: "STRAIN", status: "inactive", value: "—" },
            ]}
          />
        </div>
      </Section>

      <Section label="NEXT.MILESTONE" color="cyan">
        <div className="p-4 flex items-center justify-between">
          <span className="font-nerv-mono text-xs text-nerv-mid-gray">
            INTEGRATION.DEADLINE
          </span>
          <CountdownTimer initialSeconds={2592000} />
        </div>
      </Section>
    </div>
  );
}
