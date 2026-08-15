import type { Metadata } from "next";
import { VT323, Silkscreen } from "next/font/google";
import {
  BACKGROUND,
  CAPABILITIES,
  NEBIUS_PROJECTS,
  TIER_1,
  TIER_2,
  TIER_3,
  type NebiusProject,
} from "@/lib/nebius-projects";

/**
 * Fonts are imported per-route, so they load only on /nebius and the rest of
 * the site keeps its own typography untouched.
 */
const term = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ac-term",
  display: "swap",
});
const micro = Silkscreen({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ac-micro",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Technical Brief — Jared Werba",
  description: "Projects, what I owned, and what came out of them.",
  robots: { index: false, follow: false },
};

/**
 * Amber Console, CRT P3 phosphor. Hierarchy is brightness — never hue.
 * Everything is scoped under .ac-root so no other route is affected.
 */
const AC_CSS = `
.ac-root {
  --ac-emit-100: #ffd052;
  --ac-emit-90:  #ffae1e;
  --ac-emit-70:  #d98f13;
  --ac-emit-50:  #a2690c;
  --ac-emit-30:  #6b4405;
  --ac-screen:   #0d0700;
  --ac-on-fill:  #1e1200;
  --ac-bw: 2px;

  background: var(--ac-screen);
  color: var(--ac-emit-90);
  font-family: var(--font-ac-term), "VT323", ui-monospace, monospace;
  font-weight: 400;
  letter-spacing: 0.04em;
  text-shadow: 0 0 1px rgba(255,174,30,0.40), 0 0 8px rgba(255,174,30,0.14);
  position: relative;
}

/* Faint scanlines — kept low so they never fight the text. */
.ac-root::after {
  content: "";
  position: absolute;
  inset: 0;
  pointer-events: none;
  background: repeating-linear-gradient(
    0deg,
    transparent 0px,
    transparent 2px,
    rgba(0,0,0,0.10) 2px,
    rgba(0,0,0,0.10) 4px
  );
  mix-blend-mode: multiply;
}

.ac-root ::selection { background: var(--ac-emit-90); color: var(--ac-screen); }

.ac-micro {
  font-family: var(--font-ac-micro), "Silkscreen", ui-monospace, monospace;
  font-size: 10px;
  letter-spacing: 0.08em;
  text-transform: uppercase;
  text-shadow: none;
}

.ac-display { font-size: 40px; line-height: 1.05; letter-spacing: 0.1em; color: var(--ac-emit-100); }
.ac-title   { font-size: 27px; line-height: 1.1;  letter-spacing: 0.06em; color: var(--ac-emit-100); }
.ac-body    { font-size: 21px; line-height: 1.5;  color: var(--ac-emit-90); }
.ac-small   { font-size: 18px; line-height: 1.45; color: var(--ac-emit-70); }
.ac-dim     { color: var(--ac-emit-50); }

@media (min-width: 768px) {
  .ac-display { font-size: 52px; }
  .ac-title   { font-size: 32px; }
  .ac-body    { font-size: 22px; }
}

/* 2px rules draw the regions. No elevation, no shadows-as-depth. */
.ac-panel {
  border: var(--ac-bw) solid var(--ac-emit-30);
  border-radius: 2px 4px 8px 4px;
}
.ac-rule { border: 0; border-top: var(--ac-bw) solid var(--ac-emit-30); margin: 0; }

/* Inverse video carries emphasis instead of bold — there is no bold here. */
.ac-inv {
  background: var(--ac-emit-90);
  color: var(--ac-screen);
  text-shadow: none;
}
/* Size classes carry their own colour, which would otherwise render
   amber-on-amber inside an inverse bar. Force descendants back to screen. */
.ac-inv .ac-display,
.ac-inv .ac-title,
.ac-inv .ac-body,
.ac-inv .ac-small,
.ac-inv .ac-micro,
.ac-inv .ac-dim {
  color: var(--ac-screen);
  text-shadow: none;
}

/* Soft keys — the system's affordance for anything actionable.
   2px bright lip + 3px drop edge reads as a physical key. */
.ac-key {
  display: inline-flex;
  align-items: center;
  gap: 8px;
  min-height: 44px;
  padding: 8px 14px;
  font-size: 20px;
  line-height: 1;
  letter-spacing: 0.06em;
  text-decoration: none;
  border: var(--ac-bw) solid var(--ac-emit-100);
  border-radius: 2px 4px 8px 4px;
  background: var(--ac-emit-90);
  color: var(--ac-screen);
  text-shadow: none;
  box-shadow: inset 0 2px 0 var(--ac-emit-100), 0 3px 0 var(--ac-emit-30);
}
.ac-key:hover, .ac-key:focus-visible {
  background: var(--ac-emit-100);
  box-shadow: inset 0 2px 0 #fff3c9, 0 3px 0 var(--ac-emit-50);
  outline: none;
}
.ac-key:active {
  transform: translateY(2px);
  box-shadow: inset 0 2px 0 var(--ac-emit-100), 0 1px 0 var(--ac-emit-30);
}

/* Secondary key — outlined, same tap target. */
.ac-key--ghost {
  background: transparent;
  color: var(--ac-emit-100);
  border-color: var(--ac-emit-50);
  box-shadow: inset 0 2px 0 rgba(255,208,82,0.16), 0 3px 0 var(--ac-emit-30);
  text-shadow: 0 0 1px rgba(255,174,30,0.40);
}
.ac-key--ghost:hover, .ac-key--ghost:focus-visible {
  background: var(--ac-emit-90);
  color: var(--ac-screen);
  border-color: var(--ac-emit-100);
  text-shadow: none;
}

@keyframes ac-blink { 0%, 49% { opacity: 1; } 50%, 100% { opacity: 0.3; } }
.ac-blink { animation: ac-blink 1.6s steps(1) infinite; }
@media (prefers-reduced-motion: reduce) { .ac-blink { animation: none; } }

.ac-idx { color: var(--ac-emit-70); text-decoration: none; display: block; }
.ac-idx:hover { background: var(--ac-on-fill); color: var(--ac-emit-100); }
`;

const KIND_LABELS = {
  built: { mid: "BUILT", end: "OUTCOME" },
  operates: { mid: "WHAT IT DOES", end: "HOW I USE IT" },
} as const;

/** Live software first, as a filled key; everything else outlined. */
function Links({ project }: { project: NebiusProject }) {
  if (!project.links?.length) return null;
  const ordered = [...project.links].sort(
    (a, b) => Number(Boolean(b.primary)) - Number(Boolean(a.primary)),
  );
  return (
    <div className="flex flex-wrap gap-3 pt-2">
      {ordered.map((l) => (
        <div key={l.href} className="flex flex-col gap-1">
          <a
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className={l.primary ? "ac-key" : "ac-key ac-key--ghost"}
          >
            {/* VT323 has no hollow-rectangle glyph, so secondary keys carry no
                ornament — the outline already separates them. */}
            {l.primary && <span aria-hidden="true">&#9654;</span>}
            {l.label}
          </a>
          {l.note && <span className="ac-micro ac-dim">{l.note}</span>}
        </div>
      ))}
    </div>
  );
}

/** Every running system, pulled off the project list so it can't drift. */
const LIVE_SYSTEMS = NEBIUS_PROJECTS.flatMap((p) =>
  (p.links ?? [])
    .filter((l) => l.primary)
    .map((l) => ({
      id: p.id,
      href: l.href,
      note: l.note,
      host:
        l.display ?? l.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
    })),
);

const LIVE_IDS = new Set(LIVE_SYSTEMS.map((l) => l.id));

function Block({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="space-y-3">
      <p className="ac-micro ac-dim">{label}:</p>
      <ul className="space-y-3">
        {items.map((item, i) => (
          <li key={i} className="flex gap-3">
            <span className="ac-body ac-dim shrink-0 select-none" aria-hidden="true">
              &#9646;
            </span>
            <span className="ac-body">{item}</span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function Project({ project, full }: { project: NebiusProject; full: boolean }) {
  const labels = KIND_LABELS[project.kind ?? "built"];
  return (
    <section id={`p${project.id}`} className="ac-panel scroll-mt-4">
      {/* Header bar — inverse video, KEY:VALUE */}
      <div className="ac-inv flex items-baseline justify-between gap-3 px-3 py-1.5">
        <span className={full ? "ac-title" : "ac-body"}>
          {project.id} {project.name}
        </span>
        <span className="ac-micro shrink-0">{project.status}</span>
      </div>

      <div className="px-3 py-4 space-y-5">
        <div className="space-y-2">
          <p className="ac-body">{project.tagline}</p>
          <p className="ac-micro ac-dim">{project.stack.join(" / ")}</p>
        </div>

        <hr className="ac-rule" />

        <div className="space-y-3">
          <p className="ac-micro ac-dim">Problem:</p>
          <p className="ac-body">{project.problem}</p>
        </div>

        <Block label={labels.mid} items={project.built} />
        <Block label={labels.end} items={project.outcome} />
        <Links project={project} />
      </div>
    </section>
  );
}

export default function NebiusPage() {
  return (
    <div
      className={`${term.variable} ${micro.variable} ac-root -mx-4 md:-mx-8 px-4 md:px-6 py-6 space-y-6`}
    >
      <style dangerouslySetInnerHTML={{ __html: AC_CSS }} />

      {/* ── Status bar ── */}
      <div className="ac-inv flex items-center justify-between gap-3 px-3 py-1">
        <span className="ac-micro">JWERBA // TECHNICAL BRIEF</span>
        <span className="ac-micro">REC:{NEBIUS_PROJECTS.length}</span>
      </div>

      {/* ── Header ── */}
      <header className="space-y-4">
        <h2 className="ac-display">TECHNICAL BRIEF</h2>
        <p className="ac-small">
          PREPARED FOR C.MULDER &mdash; HEAD OF ENGINEERING, AI R&amp;D
        </p>
        <p className="ac-body max-w-[62ch]">
          Seventeen projects. I ordered them by how much they matter to the work at
          Nebius, not by date. For each one, I give three things: the problem, what I
          built, and what came of it. Everything with a live link is running right now.
          The fastest way through this page is to open one.
        </p>
        <p className="ac-body max-w-[62ch]">
          Before the projects: ten years at Oracle, selling and architecting cloud
          infrastructure. That included GPU compute for AI training and inference. It is
          why I build what I build.
        </p>
      </header>

      {/* ── Capability map — their bar, what proves it, and the software itself ── */}
      <section className="ac-panel" aria-label="Capability map">
        <div className="ac-inv flex items-center justify-between gap-3 px-3 py-1.5">
          <span className="ac-micro">
            <span className="ac-blink" aria-hidden="true">
              &#9646;
            </span>{" "}
            CAPABILITY MAP &mdash; OPEN ANYTHING
          </span>
          <span className="ac-micro">{CAPABILITIES.length}</span>
        </div>
        <div className="px-3 py-4 space-y-4">
          {CAPABILITIES.map((c) => (
            <div key={c.label} className="space-y-1">
              <p className="ac-micro ac-dim">{c.label}:</p>
              <p className="ac-body">{c.proof}</p>
              {c.links?.length ? (
                <div className="flex flex-wrap gap-3 pt-1">
                  {c.links.map((l) => (
                    <a
                      key={l.href}
                      href={l.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={l.primary ? "ac-key" : "ac-key ac-key--ghost"}
                    >
                      {l.primary && <span aria-hidden="true">&#9654;</span>}
                      {l.label}
                      <span className="sr-only"> (opens in a new tab)</span>
                    </a>
                  ))}
                </div>
              ) : null}
              {c.links?.some((l) => l.note) ? (
                <p className="ac-micro ac-dim">
                  {c.links.find((l) => l.note)?.note}
                </p>
              ) : null}
            </div>
          ))}
        </div>
      </section>

      <hr className="ac-rule" />

      {/* ── Index ── */}
      <nav aria-label="Project index" className="space-y-2">
        <p className="ac-micro ac-dim">Index:</p>
        <ul>
          {NEBIUS_PROJECTS.map((p) => (
            <li key={p.id}>
              <a href={`#p${p.id}`} className="ac-idx ac-small px-1 py-1">
                <span className="ac-dim">{p.id}</span>{" "}
                <span>{p.name}</span>{" "}
                {LIVE_IDS.has(p.id) && (
                  <span aria-label="has a live link" title="Live">
                    &#9654;
                  </span>
                )}{" "}
                <span className="ac-dim">&middot; {p.status}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <hr className="ac-rule" />

      {/* ── Featured ── */}
      <div className="space-y-6">
        {TIER_1.map((p) => (
          <Project key={p.id} project={p} full />
        ))}
      </div>

      {/* ── Shipped ── */}
      <div className="space-y-4">
        <div className="ac-inv px-3 py-1">
          <span className="ac-micro">SHIPPED / RUNNING ON THEIR OWN DOMAINS</span>
        </div>
        <div className="space-y-6">
          {TIER_2.map((p) => (
            <Project key={p.id} project={p} full={false} />
          ))}
        </div>
      </div>

      {/* ── Also ── */}
      <div className="space-y-4">
        <div className="ac-inv px-3 py-1">
          <span className="ac-micro">ALSO / CONTRIBUTIONS, TOOLING, DAILY DRIVERS</span>
        </div>
        <div className="space-y-6">
          {TIER_3.map((p) => (
            <Project key={p.id} project={p} full={false} />
          ))}
        </div>
      </div>

      {/* ── Background ── */}
      <div className="space-y-4">
        <div className="ac-inv px-3 py-1">
          <span className="ac-micro">BACKGROUND / TEN YEARS IN CLOUD INFRASTRUCTURE</span>
        </div>
        <div className="px-1 space-y-3">
          {BACKGROUND.map((line, i) => (
            <div key={i} className="flex gap-3">
              <span
                className="ac-body ac-dim shrink-0 select-none"
                aria-hidden="true"
              >
                &#9646;
              </span>
              <p className="ac-body">{line}</p>
            </div>
          ))}
        </div>
      </div>

      <hr className="ac-rule" />

      <footer className="space-y-3 pb-2">
        <p className="ac-micro ac-dim">JARED WERBA / BOSTON MA</p>
        <div className="flex flex-wrap gap-x-5 gap-y-2">
          <a
            href="https://github.com/jaredwerba"
            target="_blank"
            rel="noopener noreferrer"
            className="ac-link ac-small"
          >
            &#9658; GITHUB
          </a>
          <a
            href="https://linkedin.com/in/jwerba"
            target="_blank"
            rel="noopener noreferrer"
            className="ac-link ac-small"
          >
            &#9658; LINKEDIN
          </a>
        </div>
        <p className="ac-micro ac-dim">&#10035; END OF RECORD</p>
      </footer>
    </div>
  );
}
