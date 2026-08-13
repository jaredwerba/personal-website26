import type { Metadata } from "next";
import { Divider } from "@mdrbx/nerv-ui";
import {
  NEBIUS_PROJECTS,
  TIER_1,
  TIER_2,
  TIER_3,
  type NebiusProject,
} from "@/lib/nebius-projects";

export const metadata: Metadata = {
  title: "Technical Brief — Jared Werba",
  description: "Projects, what I owned, and what came out of them.",
  robots: { index: false, follow: false },
};

const ACCENT_TEXT = {
  orange: "text-nerv-orange",
  cyan: "text-nerv-cyan",
  green: "text-nerv-green",
} as const;

function ProjectLinks({ project }: { project: NebiusProject }) {
  if (!project.links?.length) return null;
  return (
    <div className="flex flex-wrap gap-x-6 gap-y-2 pt-1">
      {project.links.map((link) => (
        <a
          key={link.href}
          href={link.href}
          target="_blank"
          rel="noopener noreferrer"
          className="font-nerv-mono text-[10px] text-nerv-cyan/70 tracking-wider hover:text-nerv-orange transition-colors"
        >
          &gt; {link.label} &rarr;
        </a>
      ))}
    </div>
  );
}

/** Mono label + hanging list. No boxes — hierarchy comes from type and rules. */
function Block({ label, items }: { label: string; items: string[] }) {
  return (
    <div className="space-y-2.5">
      <p className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-mid-gray uppercase">
        {label}
      </p>
      <ul className="space-y-2.5">
        {items.map((item, i) => (
          <li key={i} className="flex gap-2.5">
            <span
              className="font-nerv-mono text-[10px] text-nerv-mid-gray/60 shrink-0 leading-[1.9]"
              aria-hidden="true"
            >
              &mdash;
            </span>
            <span className="font-nerv-body text-sm md:text-base text-nerv-white/90 leading-relaxed">
              {item}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function FeaturedProject({ project }: { project: NebiusProject }) {
  return (
    <section id={`p${project.id}`} className="space-y-5 scroll-mt-6">
      <div className="space-y-2">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-nerv-mono text-[11px] text-nerv-mid-gray tracking-[0.2em]">
            {project.id}
          </span>
          <h3
            className={`font-nerv-display text-lg md:text-xl tracking-[0.16em] ${ACCENT_TEXT[project.accent]}`}
          >
            {project.name}
          </h3>
          <span className="font-nerv-mono text-[9px] tracking-[0.18em] text-nerv-mid-gray uppercase">
            {project.status}
          </span>
        </div>
        <p className="font-nerv-body text-sm md:text-base text-nerv-white/70 leading-relaxed italic">
          {project.tagline}
        </p>
        <p className="font-nerv-mono text-[10px] text-nerv-mid-gray/80 tracking-wider">
          {project.stack.join("  ·  ")}
        </p>
      </div>

      <div className="space-y-2.5">
        <p className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-mid-gray uppercase">
          Problem
        </p>
        <p className="font-nerv-body text-sm md:text-base text-nerv-white/90 leading-relaxed">
          {project.problem}
        </p>
      </div>

      <Block label="What I built" items={project.built} />
      <Block label="Outcome" items={project.outcome} />
      <ProjectLinks project={project} />
    </section>
  );
}

function CompactProject({ project }: { project: NebiusProject }) {
  return (
    <section id={`p${project.id}`} className="space-y-3 scroll-mt-6">
      <div className="space-y-1.5">
        <div className="flex items-baseline gap-3 flex-wrap">
          <span className="font-nerv-mono text-[11px] text-nerv-mid-gray tracking-[0.2em]">
            {project.id}
          </span>
          <h3
            className={`font-nerv-display text-base md:text-lg tracking-[0.16em] ${ACCENT_TEXT[project.accent]}`}
          >
            {project.name}
          </h3>
          <span className="font-nerv-mono text-[9px] tracking-[0.18em] text-nerv-mid-gray uppercase">
            {project.status}
          </span>
        </div>
        <p className="font-nerv-body text-sm text-nerv-white/70 leading-relaxed italic">
          {project.tagline}
        </p>
        <p className="font-nerv-mono text-[10px] text-nerv-mid-gray/80 tracking-wider">
          {project.stack.join("  ·  ")}
        </p>
      </div>

      <p className="font-nerv-body text-sm text-nerv-white/90 leading-relaxed">
        {project.problem}
      </p>

      <Block label="What I built" items={project.built} />
      <Block label="Outcome" items={project.outcome} />
      <ProjectLinks project={project} />
    </section>
  );
}

export default function NebiusPage() {
  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <header className="space-y-3">
        <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
          TECHNICAL BRIEF
        </h2>
        <p className="font-nerv-mono text-xs text-nerv-mid-gray tracking-wider">
          // PREPARED FOR C.MULDER &mdash; HEAD OF ENGINEERING, AI R&amp;D
        </p>
        <p className="font-nerv-body text-sm md:text-base text-nerv-white/90 leading-relaxed max-w-2xl">
          Fourteen projects, ordered by how much they bear on the work at Nebius rather than
          by date. For each one: the problem I was solving, what I personally built, and what
          came out of it. Everything with a live link is running right now &mdash; the fastest
          way through this page is to open one.
        </p>
      </header>

      <Divider color="orange" variant="dashed" />

      {/* ── Index ── */}
      <nav aria-label="Project index" className="space-y-2">
        <p className="font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-mid-gray uppercase">
          Index
        </p>
        <ul className="space-y-1.5">
          {NEBIUS_PROJECTS.map((p) => (
            <li key={p.id}>
              <a
                href={`#p${p.id}`}
                className="group flex items-baseline gap-3 font-nerv-mono text-[11px] tracking-wider"
              >
                <span className="text-nerv-mid-gray/70 shrink-0">{p.id}</span>
                <span
                  className={`${ACCENT_TEXT[p.accent]} opacity-80 group-hover:opacity-100 transition-opacity`}
                >
                  {p.name}
                </span>
                <span className="text-nerv-mid-gray/50 text-[9px] truncate">{p.status}</span>
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <Divider color="green" variant="dashed" />

      {/* ── Tier 1 ── */}
      <div className="space-y-8">
        {TIER_1.map((project, i) => (
          <div key={project.id} className="space-y-8">
            <FeaturedProject project={project} />
            {i < TIER_1.length - 1 && <Divider color="cyan" variant="dashed" />}
          </div>
        ))}
      </div>

      <Divider color="orange" variant="dashed" />

      {/* ── Tier 2 ── */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-nerv-display text-lg md:text-xl tracking-[0.16em] text-nerv-orange">
            SHIPPED
          </h3>
          <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider">
            // PRODUCTS RUNNING ON THEIR OWN DOMAINS
          </p>
        </div>
        {TIER_2.map((project) => (
          <CompactProject key={project.id} project={project} />
        ))}
      </div>

      <Divider color="green" variant="dashed" />

      {/* ── Tier 3 ── */}
      <div className="space-y-6">
        <div className="space-y-2">
          <h3 className="font-nerv-display text-lg md:text-xl tracking-[0.16em] text-nerv-cyan">
            ALSO
          </h3>
          <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider">
            // CONTRIBUTIONS AND TOOLING
          </p>
        </div>
        {TIER_3.map((project) => (
          <CompactProject key={project.id} project={project} />
        ))}
      </div>

      <Divider color="orange" variant="dashed" />

      <footer className="space-y-2 pb-4">
        <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider">
          // JARED WERBA &middot; BOSTON, MA
        </p>
        <div className="flex flex-wrap gap-x-6 gap-y-2">
          <a
            href="https://github.com/jaredwerba"
            target="_blank"
            rel="noopener noreferrer"
            className="font-nerv-mono text-[10px] text-nerv-cyan/70 tracking-wider hover:text-nerv-orange transition-colors"
          >
            &gt; GITHUB &rarr;
          </a>
          <a
            href="https://linkedin.com/in/jwerba"
            target="_blank"
            rel="noopener noreferrer"
            className="font-nerv-mono text-[10px] text-nerv-cyan/70 tracking-wider hover:text-nerv-orange transition-colors"
          >
            &gt; LINKEDIN &rarr;
          </a>
        </div>
      </footer>
    </div>
  );
}
