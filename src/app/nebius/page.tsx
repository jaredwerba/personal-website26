import type { Metadata } from "next";
import { VT323, Silkscreen } from "next/font/google";
import {
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

.ac-link { color: var(--ac-emit-100); text-decoration: none; border-bottom: var(--ac-bw) solid var(--ac-emit-30); }
.ac-link:hover { background: var(--ac-emit-90); color: var(--ac-screen); text-shadow: none; border-bottom-color: var(--ac-emit-90); }

.ac-idx { color: var(--ac-emit-70); text-decoration: none; display: block; }
.ac-idx:hover { background: var(--ac-on-fill); color: var(--ac-emit-100); }
`;

const KIND_LABELS = {
  built: { mid: "BUILT", end: "OUTCOME" },
  operates: { mid: "WHAT IT DOES", end: "HOW I USE IT" },
} as const;

function Links({ project }: { project: NebiusProject }) {
  if (!project.links?.length) return null;
  return (
    <div className="flex flex-wrap gap-x-5 gap-y-2 pt-1">
      {project.links.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className="ac-link ac-small"
        >
          &#9658; {l.label}
        </a>
      ))}
    </div>
  );
}

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
        <span className="ac-micro">REC:14</span>
      </div>

      {/* ── Header ── */}
      <header className="space-y-4">
        <h2 className="ac-display">TECHNICAL BRIEF</h2>
        <p className="ac-small">
          PREPARED FOR C.MULDER &mdash; HEAD OF ENGINEERING, AI R&amp;D
        </p>
        <p className="ac-body max-w-[62ch]">
          Sixteen projects, ordered by how much they bear on the work at Nebius rather than
          by date. For each one: the problem I was solving, what I personally built, and what
          came out of it. Everything with a live link is running right now &mdash; the fastest
          way through this page is to open one.
        </p>
      </header>

      <hr className="ac-rule" />

      {/* ── Index ── */}
      <nav aria-label="Project index" className="space-y-2">
        <p className="ac-micro ac-dim">Index:</p>
        <ul>
          {NEBIUS_PROJECTS.map((p) => (
            <li key={p.id}>
              <a href={`#p${p.id}`} className="ac-idx ac-small px-1 py-0.5">
                <span className="ac-dim">{p.id}</span>{" "}
                <span>{p.name}</span>{" "}
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
