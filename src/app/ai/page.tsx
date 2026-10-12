import type { Metadata } from "next";
import { Badge, Divider } from "@mdrbx/nerv-ui";
import log from "@/data/ai26-public.json";

export const metadata: Metadata = {
  title: "AI26 // JWERBA",
  description:
    "Building attempts from the AI26 log. Personal questions stay off this page.",
  alternates: { canonical: "https://www.jwerba.com/ai" },
};

type Attempt = {
  date: string;
  time: string;
  projects: string[];
  talked: string;
  learned: string;
  curious: string;
  outcome: string;
  why_ai: string;
  tags: string[];
};

const NOTE_FIELDS: { key: keyof Attempt; label: string }[] = [
  { key: "outcome", label: "OUTCOME" },
  { key: "learned", label: "LEARNED" },
  { key: "curious", label: "CURIOUS" },
  { key: "why_ai", label: "WHY AI" },
];

const MODELS = ["Grok 4.7", "GLM", "Qwen", "Nemotron Ultra"];

const STACK = [
  ["SERVER", "Lenovo T490"],
  ["OS", "Omarchy"],
  ["HARNESS", "Hermes"],
  ["PERSONAL AGENT", "Grokbot"],
];

type Bot = { name: string; purpose: string; group?: boolean; parked?: boolean };

const BOTS: Bot[] = [
  {
    name: "Neo",
    purpose: "Primary bot. Takes a task and routes it to the right bot. Can list the roster and set a new primary.",
  },
  {
    name: "Jobs",
    purpose: "CareerOps board and the LinkedIn hunt. Hands over apply links. Jared submits.",
  },
  {
    name: "Email",
    purpose: "Stops junk on Gmail and Proton. Does not archive. Keeps a separate unsubscribe log per inbox.",
  },
  {
    name: "Property",
    purpose: "No description on the roster.",
  },
  {
    name: "Travel Bot",
    purpose: "No description on the roster.",
  },
  {
    name: "Omarchy",
    purpose: "Watches Omarchy developments and saves a daily report. Priority watch: when Omarchy can run on an M3.",
  },
  {
    name: "got bot latest",
    purpose: "grokbot.dev weekday morning digest. Does not run a feed item's prompt on its own.",
  },
  {
    name: "thrift bot",
    purpose: "ShopGoodwill, Facebook Marketplace in Boston, and eBay value checks. Used clothing and electronics.",
  },
  {
    name: "Lumi",
    purpose: "Finds Luma tech events for a city and returns a short dated shortlist.",
  },
  {
    name: "Health",
    purpose: "No description on the roster.",
  },
  {
    name: "Karen",
    purpose: "Customer-advocacy dial bot. Confirms before it dials. Hangs up last.",
  },
  {
    name: "M3",
    purpose: "Operates the MacBook Air M3 remotely. Local shell and files on that machine only.",
  },
  {
    name: "Job Submitter",
    purpose: "Submits résumés through employer portals. Coordinates with Jobs and Resume Generator.",
  },
  {
    name: "Employment",
    group: true,
    purpose:
      "Group chat for the employment lane. Members: Resume Generator, Job Submitter, Jobs, and Proton.",
  },
  {
    name: "Resume Generator",
    purpose: "Dedicated résumé generator. Fresh context. No job-hunt noise in the thread.",
  },
  {
    name: "Proton",
    purpose: "Proton inbound hygiene. Footer-link unsubscribe only. Does not use the Newsletters UI.",
  },
  {
    name: "Amazon",
    purpose: "No description on the roster.",
  },
  {
    name: "email bot",
    purpose: "No description on the roster. Stub, separate from Email.",
  },
  {
    name: "T490",
    purpose: "No description on the roster.",
  },
  {
    name: "X Audit",
    purpose: "Audits an X account for reputational-risk posts. Deletes or edits only after an explicit approval of named posts.",
  },
  {
    name: "vercel",
    purpose: "Takes direction from other bots and ships small mobile-first pages on jwerba.com. Uses nerv-ui.",
  },
  {
    name: "Agent Zero",
    purpose: "People-search removal after consent. Files official removals and can watch weekly.",
  },
];

const PARKED: Bot[] = [
  {
    name: "Neo",
    parked: true,
    purpose: "Older Chief of Staff. Hidden. Talks only to the user and routes specialists. Not the current primary.",
  },
  {
    name: "Neo group",
    parked: true,
    purpose: "Hidden group chat whose only member is the older Neo.",
  },
  {
    name: "KirBot",
    parked: true,
    purpose: "Hidden. After a yes, takes a teammate bot's useful skills, then guides deletion of that bot.",
  },
  {
    name: "Design",
    parked: true,
    purpose: "Hidden. Launches Vercel projects and builds front-end apps.",
  },
  {
    name: "X",
    parked: true,
    purpose: "Hidden. No description on the roster.",
  },
];

function NoteField({ label, text }: { label: string; text: string }) {
  if (!text) return null;
  return (
    <div className="grid grid-cols-[5.5rem_1fr] gap-3">
      <div className="font-nerv-mono text-[10px] tracking-wider text-nerv-cyan/70 pt-1">
        {label}
      </div>
      <p className="font-nerv-body text-sm text-nerv-white/90 leading-relaxed whitespace-pre-wrap">
        {text}
      </p>
    </div>
  );
}

function byDate(attempts: Attempt[]) {
  const groups: { date: string; rows: Attempt[] }[] = [];
  for (const row of attempts) {
    const last = groups[groups.length - 1];
    if (!last || last.date !== row.date) groups.push({ date: row.date, rows: [row] });
    else last.rows.push(row);
  }
  return groups;
}

export default function AiPage() {
  const groups = byDate(log.attempts as Attempt[]);
  const { scanned_notes, published, held } = log.gate;

  return (
    <div className="space-y-8">
      <header className="space-y-3">
        <div className="flex items-center gap-3 flex-wrap">
          <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
            AI26
          </h2>
          <Badge label="GATED" variant="default" size="sm" />
        </div>
        <p className="font-nerv-mono text-xs text-nerv-mid-gray tracking-wider">
          // BUILDING.ATTEMPTS.ONLY
        </p>
        <p className="font-nerv-body text-sm md:text-base text-nerv-white/90 leading-relaxed">
          The daily log stays on the machine. This page is the part that clears the gate:
          a software artifact was built, fixed, or shipped. Questions do not.
        </p>
      </header>

      <section className="border border-nerv-orange/40 p-4 space-y-3">
        <div className="flex items-baseline justify-between gap-3">
          <h3 className="font-nerv-display text-lg tracking-[0.16em] text-nerv-orange">
            GATE
          </h3>
          <span className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider">
            HOLD BY DEFAULT
          </span>
        </div>
        <dl className="font-nerv-mono text-[11px] tracking-wider space-y-1">
          <div className="flex gap-3">
            <dt className="text-nerv-cyan/70 w-16 shrink-0">IN</dt>
            <dd className="text-nerv-white/90">building attempts</dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-nerv-cyan/70 w-16 shrink-0">OUT</dt>
            <dd className="text-nerv-white/90">questions, life, health, mail, money, career admin</dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-nerv-cyan/70 w-16 shrink-0">SCAN</dt>
            <dd className="text-nerv-white/90">{scanned_notes} notes</dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-nerv-green w-16 shrink-0">PASS</dt>
            <dd className="text-nerv-green">{published}</dd>
          </div>
          <div className="flex gap-3">
            <dt className="text-nerv-orange w-16 shrink-0">HOLD</dt>
            <dd className="text-nerv-orange">{held}</dd>
          </div>
        </dl>
        <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider">
          Held notes are not in this build. A sensitive pattern holds the whole note.
        </p>
      </section>

      <section className="space-y-4">
        <h3 className="font-nerv-display text-lg tracking-[0.16em] text-nerv-cyan">
          WORKFLOW
        </h3>
        <dl className="font-nerv-mono text-[11px] tracking-wider space-y-1">
          {STACK.map(([label, value]) => (
            <div key={label} className="flex gap-3">
              <dt className="text-nerv-cyan/70 w-36 shrink-0">{label}</dt>
              <dd className="text-nerv-white/90">{value}</dd>
            </div>
          ))}
        </dl>
        <div className="flex flex-wrap gap-2">
          {MODELS.map((model) => (
            <Badge key={model} label={model.toUpperCase()} variant="info" size="sm" />
          ))}
        </div>
        <p className="font-nerv-body text-sm text-nerv-white/80 leading-relaxed">
          Grok 4.7 is the interactive default. GLM is the grunt lane: cron, triage, overnight.
          Qwen and Nemotron Ultra are in the model set.
        </p>
      </section>

      <Divider color="cyan" variant="dashed" />

      <section className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h3 className="font-nerv-display text-lg tracking-[0.16em] text-nerv-orange">
            GROKBOTS
          </h3>
          <Badge label={String(BOTS.length)} variant="default" size="sm" />
        </div>
        <ul className="space-y-3">
          {BOTS.map((bot) => (
            <li key={bot.name} className="space-y-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="font-nerv-display text-sm tracking-[0.14em] text-nerv-cyan">
                  {bot.name.toUpperCase()}
                </span>
                {bot.group && <Badge label="GROUP CHAT" variant="success" size="sm" />}
              </div>
              <p className="font-nerv-body text-sm text-nerv-white/85 leading-relaxed">
                {bot.purpose}
              </p>
            </li>
          ))}
        </ul>
      </section>

      <section className="border border-nerv-green/30 p-4 space-y-2">
        <h3 className="font-nerv-display text-sm tracking-[0.16em] text-nerv-green">
          EMPLOYMENT GROUP CHAT
        </h3>
        <p className="font-nerv-body text-sm text-nerv-white/85 leading-relaxed">
          Employment is a group chat, not a single bot. The members are Resume Generator,
          Job Submitter, Jobs, and Proton.
        </p>
      </section>

      <section className="space-y-3">
        <h3 className="font-nerv-display text-sm tracking-[0.16em] text-nerv-mid-gray">
          PARKED
        </h3>
        <ul className="space-y-2">
          {PARKED.map((bot) => (
            <li key={bot.name} className="font-nerv-body text-sm text-nerv-white/70 leading-relaxed">
              <span className="font-nerv-mono text-[11px] text-nerv-mid-gray tracking-wider">
                {bot.name.toUpperCase()}
              </span>
              {" — "}
              {bot.purpose}
            </li>
          ))}
        </ul>
      </section>

      <Divider color="green" variant="dashed" />

      <section className="space-y-6">
        <h3 className="font-nerv-display text-lg tracking-[0.16em] text-nerv-orange">
          ATTEMPTS
        </h3>
        {groups.map((group) => (
          <div key={group.date} className="space-y-4">
            <h4 className="font-nerv-mono text-[11px] tracking-wider text-nerv-cyan">
              {group.date}
              <span className="text-nerv-mid-gray"> · {group.rows.length} NOTES</span>
            </h4>
            <ul className="space-y-6">
              {group.rows.map((row, i) => (
                <li key={`${row.date}-${row.time}-${i}`} className="space-y-3 border-t border-nerv-mid-gray/20 pt-3">
                  <div className="flex flex-wrap items-center gap-2">
                    {row.time && (
                      <span className="font-nerv-mono text-[10px] text-nerv-orange tracking-wider">
                        {row.time}
                      </span>
                    )}
                    {row.projects.map((project) => (
                      <Badge key={project} label={project} variant="default" size="sm" />
                    ))}
                    {row.tags.map((tag) => (
                      <span key={tag} className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider">
                        {tag.toUpperCase()}
                      </span>
                    ))}
                  </div>
                  {row.talked && (
                    <p className="font-nerv-body text-sm md:text-base text-nerv-white/90 leading-relaxed whitespace-pre-wrap">
                      {row.talked}
                    </p>
                  )}
                  <div className="space-y-2">
                    {NOTE_FIELDS.map((field) => (
                      <NoteField
                        key={field.key}
                        label={field.label}
                        text={String(row[field.key] ?? "")}
                      />
                    ))}
                  </div>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>
    </div>
  );
}
