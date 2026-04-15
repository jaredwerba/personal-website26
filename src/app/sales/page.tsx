"use client";

import {
  Badge,
  Divider,
  TerminalDisplay,
  PieChart,
  PhaseStatusStack,
  SyncProgressBar,
} from "@mdrbx/nerv-ui";
import Section from "@/components/Section";
import { useIsMobile } from "@/hooks/useIsMobile";

export default function SalesPage() {
  const isMobile = useIsMobile();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
          SALES
        </h2>
        <Badge label="INTEL" variant="warning" size="sm" />
      </div>

      <p className="font-nerv-mono text-xs text-nerv-mid-gray tracking-wider">
        // REVENUE.OPS
      </p>

      <Divider color="orange" variant="dashed" />

      <TerminalDisplay
        lines={[
          "> SALES INTELLIGENCE MODULE v0.1",
          "> STATUS: AWAITING.CONTENT.UPLOAD",
          "> THIS SECTION WILL DISPLAY:",
          ">   - DEAL METRICS & PIPELINE DATA",
          ">   - CASE STUDIES & DECKS",
          ">   - PERFORMANCE ANALYTICS",
          "> UPLOAD CONTENT TO POPULATE THIS VIEW.",
        ]}
        typewriter
        typeSpeed={20}
        lineDelay={120}
        color="orange"
        title="SALES.SYS"
        showLineNumbers
        maxHeight="200px"
      />

      <Section label="PIPELINE.PREVIEW" color="orange">
        <div className="p-4 md:p-6 space-y-6 opacity-50">
          <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider text-center">
            // SAMPLE.LAYOUT &mdash; NO.LIVE.DATA
          </p>

          <TerminalDisplay
            lines={[
              "> PIPELINE.VALUE ... $0",
              "> CLOSED.WON ...... $0",
              "> WIN.RATE ......... —%",
              "> DEALS.ACTIVE ..... 0",
            ]}
            color="orange"
            title="PIPELINE.METRICS"
            maxHeight="120px"
          />

          <div className="flex justify-center overflow-x-auto">
            <PieChart
              slices={[
                { label: "PROSPECT", value: 30 },
                { label: "QUALIFIED", value: 25 },
                { label: "PROPOSAL", value: 20 },
                { label: "NEGOTIATE", value: 15 },
                { label: "CLOSED", value: 10 },
              ]}
              title="PIPELINE.STAGES"
              size={isMobile ? 110 : 160}
              donut
              color="mixed"
            />
          </div>

          <PhaseStatusStack
            title="DEAL.STAGES"
            color="orange"
            phases={[
              { label: "PROSPECTING", status: "inactive", value: "—" },
              { label: "QUALIFICATION", status: "inactive", value: "—" },
              { label: "PROPOSAL", status: "inactive", value: "—" },
              { label: "NEGOTIATION", status: "inactive", value: "—" },
              { label: "CLOSED.WON", status: "inactive", value: "—" },
            ]}
          />

          <SyncProgressBar value={0} label="QUOTA.ATTAINMENT" />
        </div>
      </Section>
    </div>
  );
}
