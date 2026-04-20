"use client";

import Link from "next/link";
import { Badge, Divider, Button } from "@mdrbx/nerv-ui";
import HeroVideo from "@/components/HeroVideo";
import { LIAP_DOCS } from "@/lib/liap-docs";

const GITHUB_URL = "https://github.com/jaredwerba";

const DEMO_VIDEO =
  "https://objectstorage.us-ashburn-1.oraclecloud.com/p/inAHbFQ2G95YVR8zDx7CjyEloe1ZKeloh6R1LP6hhTa9nsxqe6CZVoVnLhijJWNe/n/id5xzxcsl39s/b/bucket-20210429-2143/o/lip4LIPFeb27.mp4";

export default function SoftwarePage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
          SOFTWARE
        </h2>
        <Badge label="GITHUB" variant="default" size="sm" />
      </div>

      <p className="font-nerv-mono text-xs text-nerv-mid-gray tracking-wider">
        // CODE.REPOSITORY
      </p>

      <Divider color="green" variant="dashed" />

      <section className="space-y-4">
        <div className="flex items-baseline gap-3 flex-wrap">
          <h3 className="font-nerv-display text-lg md:text-xl tracking-[0.16em] text-nerv-cyan">
            PROJECT.01 &mdash; LIAP
          </h3>
          <Badge label="PYTHON + PLAYWRIGHT" variant="info" size="sm" />
          <Badge label="LOCAL LLM" variant="success" size="sm" />
        </div>

        <HeroVideo src={DEMO_VIDEO} />

        <p className="font-nerv-body text-sm md:text-base text-nerv-white/90 leading-relaxed">
          Locally running LLM &amp; browser orchestration to automate sales prospecting.
          Reuses a persistent Chrome session so LinkedIn sees a normal user, not automation.
          Ollama generates personalized connection notes, first messages, and follow-ups;
          reply detection reads message-thread DOM classes to decide when to stop.
          No third-party SaaS, no API fees, nothing leaves the machine.
        </p>

        <dl className="font-nerv-mono text-[11px] tracking-wider text-nerv-mid-gray space-y-1">
          <div className="flex">
            <dt className="text-nerv-cyan/70 w-24 shrink-0">STACK</dt>
            <dd>Python &middot; FastAPI &middot; Playwright &middot; Ollama / Gemini &middot; WebSockets &middot; Vanilla JS UI</dd>
          </div>
          <div className="flex">
            <dt className="text-nerv-cyan/70 w-24 shrink-0">STATUS</dt>
            <dd className="text-nerv-green">LIVE &middot; CONNECT + MESSAGE + FOLLOW-UP + REPLY DETECTION</dd>
          </div>
          <div className="flex">
            <dt className="text-nerv-cyan/70 w-24 shrink-0">PRIVACY</dt>
            <dd>Data stays local &middot; CSVs only &middot; no telemetry</dd>
          </div>
        </dl>
      </section>

      <Divider color="cyan" variant="dashed" />

      <section className="space-y-3">
        <div className="flex items-center gap-3">
          <h3 className="font-nerv-display text-lg tracking-[0.16em] text-nerv-orange">
            DOCUMENTATION
          </h3>
          <Badge label={`${LIAP_DOCS.length} DOCS`} variant="warning" size="sm" />
        </div>
        <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider">
          // CLICK ANY ENTRY &mdash; FULL SPEC OF WHAT WAS BUILT
        </p>

        <ul className="divide-y divide-nerv-mid-gray/30 border-y border-nerv-mid-gray/30">
          {LIAP_DOCS.map((doc) => (
            <li key={doc.slug}>
              <Link
                href={`/software/liap/${doc.slug}`}
                className="flex items-center gap-3 py-3 group hover:bg-nerv-cyan/5 transition-colors"
              >
                <span className="font-nerv-mono text-[11px] text-nerv-mid-gray tracking-wider w-7 shrink-0 text-right">
                  {doc.number}
                </span>
                <span className="text-nerv-cyan/60 group-hover:text-nerv-orange transition-colors">
                  {doc.icon}
                </span>
                <div className="min-w-0 flex-1">
                  <div className="font-nerv-display text-sm tracking-[0.14em] text-nerv-white group-hover:text-nerv-orange transition-colors uppercase truncate">
                    {doc.title}
                  </div>
                  <div className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider truncate">
                    {doc.blurb}
                  </div>
                </div>
                <span className="font-nerv-mono text-[11px] text-nerv-mid-gray group-hover:text-nerv-orange transition-colors shrink-0">
                  &rarr;
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <Divider color="green" variant="dashed" />

      <a href={GITHUB_URL} target="_blank" rel="noopener noreferrer">
        <Button variant="terminal" fullWidth>
          VIEW.GITHUB.PROFILE &rarr;
        </Button>
      </a>
    </div>
  );
}
