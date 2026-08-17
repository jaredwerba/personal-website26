import { Fragment } from "react";
import {
  BACKGROUND,
  OVERVIEW,
  CAPABILITIES,
  CAPABILITY_LEAD,
  NEBIUS_PROJECTS,
  TWEET_LEDGER_INTRO,
  TWEET_THEMES,
  TWEET_LEDGER_RECEIPTS,
  TWEET_LEDGER_FULL,
  type NebiusProject,
  type ProjectLink,
  type TweetLedgerEntry,
} from "@/lib/nebius-projects";

/* ─────────────────────────────────────────────────────────────
   Section map. Lives here, not in the data module, so the content
   file stays byte-identical.
   ───────────────────────────────────────────────────────────── */

type Section = { id: string; title: string; docs: string[] };

const SECTIONS: Section[] = [
  { id: "overview", title: "Overview / Live Systems", docs: ["overview", "capabilities", "background"] },
  { id: "record", title: "Public Record", docs: ["ledger"] },
  { id: "agentic", title: "Agentic Systems & Evaluation", docs: ["01", "03", "04", "13", "05"] },
  // Inference gets its own section rather than sitting under prototypes: it is
  // a named area of their technical bar, and one of these two ran on their
  // hardware.
  { id: "inference", title: "Inference & GPU", docs: ["18", "17"] },
  { id: "hackathon", title: "Hackathon & Prototypes", docs: ["02", "16", "08"] },
  { id: "other", title: "Other Projects", docs: ["06", "07", "09", "10", "11", "12", "14", "15"] },
];

/** The two the reader should see first, whichever section they sit in. */
const FEATURED = new Set(["01", "02"]);

const HINTS = [
  "eval harness",
  "vLLM",
  "SGLang",
  "H200",
  "RAG",
  "Ollama",
  "LangGraph",
  "MCP",
  "tool calling",
  "GPU",
  "RDMA",
  "InfiniBand",
  "GPT-3",
  "RoCE",
  "OAuth",
];

const KIND_LABELS = {
  built: { mid: "BUILT", end: "OUTCOME" },
  operates: { mid: "WHAT IT DOES", end: "HOW I USE IT" },
} as const;

const byId = new Map(NEBIUS_PROJECTS.map((p) => [p.id, p]));

/** Every running system, derived from the project data so it cannot drift. */
const LIVE_SYSTEMS = NEBIUS_PROJECTS.flatMap((p) =>
  (p.links ?? [])
    .filter((l) => l.primary)
    .map((l) => ({
      id: p.id,
      name: p.name,
      href: l.href,
      note: l.note,
      host:
        l.display ?? l.href.replace(/^https?:\/\/(www\.)?/, "").replace(/\/$/, ""),
    })),
);

/* ─────────────────────────────────────────────────────────────
   Search index — a lowercased copy of strings that already exist.
   Nothing is rewritten.
   ───────────────────────────────────────────────────────────── */

function projectSearchText(p: NebiusProject): string {
  return [p.id, p.name, p.tagline, p.status, p.stack.join(" "), p.problem, ...p.built, ...p.outcome]
    .join(" ")
    .toLowerCase();
}

const DOC_META: Record<string, { label: string; meta: string; search: string }> = {
  overview: {
    label: "Overview",
    meta: `${LIVE_SYSTEMS.length} live`,
    search: `overview live systems ${LIVE_SYSTEMS.map((l) => `${l.name} ${l.host}`).join(" ")}`.toLowerCase(),
  },
  capabilities: {
    label: "Capability Map",
    meta: `${CAPABILITIES.length}`,
    search: CAPABILITIES.map((c) => `${c.label} ${c.proof}`).join(" ").toLowerCase(),
  },
  background: {
    label: "Background",
    meta: "10 YRS",
    search: BACKGROUND.join(" ").toLowerCase(),
  },
  ledger: {
    label: "Public Record",
    meta: `${TWEET_LEDGER_FULL.length} POSTS`,
    search: `public record tweet ledger infiniband rdma roce gpt-3 optane xpoint ${TWEET_LEDGER_FULL.map((e) => `${e.date} ${e.title}`).join(" ")}`.toLowerCase(),
  },
  ...Object.fromEntries(
    NEBIUS_PROJECTS.map((p) => [
      p.id,
      { label: p.name, meta: p.status, search: projectSearchText(p) },
    ]),
  ),
};

/* ─────────────────────────────────────────────────────────────
   Pieces
   ───────────────────────────────────────────────────────────── */

function Keys({ links }: { links?: ProjectLink[] }) {
  if (!links?.length) return null;
  const ordered = [...links].sort(
    (a, b) => Number(Boolean(b.primary)) - Number(Boolean(a.primary)),
  );
  return (
    <div className="ac-row ac-keys">
      {ordered.map((l) => (
        <span key={l.href} className="ac-keywrap">
          <a
            href={l.href}
            target="_blank"
            rel="noopener noreferrer"
            className={l.primary ? "ac-btn ac-btn--filled" : "ac-btn"}
          >
            {l.primary ? "▶ " : ""}
            {l.label}
            <span className="ac-sr-only"> (opens in a new tab)</span>
          </a>
          {l.note ? <small className="ac-note">{l.note}</small> : null}
        </span>
      ))}
    </div>
  );
}

function ListBlock({ label, items }: { label: string; items: string[] }) {
  return (
    <section className="ac-block">
      <h3 className="ac-block__title">{label}</h3>
      <ul className="ac-list">
        {items.map((item, i) => (
          <li key={i}>{item}</li>
        ))}
      </ul>
    </section>
  );
}

function DocShell({
  id,
  title,
  status,
  children,
}: {
  id: string;
  title: string;
  status: string;
  children: React.ReactNode;
}) {
  return (
    <ac-doc doc-id={id} className="ac-doc">
      <div className="ac-statusbar ac-doc__bar" role="status">
        <span>{title}</span>
        <span className="ac-push ac-doc__status">{status}</span>
      </div>
      <div className="ac-doc__body">
        <h2 className="ac-doc__heading" tabIndex={-1} data-doc-heading>
          {title}
        </h2>
        {children}
      </div>
    </ac-doc>
  );
}

function ProjectDoc({ project }: { project: NebiusProject }) {
  const labels = KIND_LABELS[project.kind ?? "built"];
  return (
    <DocShell
      id={project.id}
      title={project.name}
      status={project.status}
    >
      <p className="ac-tagline">{project.tagline}</p>
      {project.signals?.length ? (
        <div className="ac-row ac-signals">
          {project.signals.map((s) => (
            <span key={s} className="ac-signal">
              {s}
            </span>
          ))}
        </div>
      ) : null}
      <div className="ac-row ac-stackrow">
        {project.stack.map((s) => (
          <span key={s} className="ac-badge">
            {s}
          </span>
        ))}
      </div>
      <Keys links={project.links} />
      <hr className="ac-hr" />
      <section className="ac-block">
        <h3 className="ac-block__title">PROBLEM</h3>
        <p className="ac-prose">{project.problem}</p>
      </section>
      <ListBlock label={labels.mid} items={project.built} />
      <ListBlock label={labels.end} items={project.outcome} />
    </DocShell>
  );
}

function OverviewDoc() {
  const featured = ["01", "02"].map((id) => byId.get(id)).filter(Boolean) as NebiusProject[];
  return (
    <DocShell id="overview" title="OVERVIEW" status={`${NEBIUS_PROJECTS.length} RECORDS`}>
      {OVERVIEW.map((para, i) => (
        <p key={i} className="ac-prose ac-overview__para">
          {para}
        </p>
      ))}

      <section className="ac-block">
        <h3 className="ac-block__title">START HERE</h3>
        <div className="ac-row ac-keys">
          {featured.map((p) => (
            <button key={p.id} type="button" className="ac-btn ac-btn--filled" data-doc-target={p.id}>
              {p.name}
            </button>
          ))}
          <button type="button" className="ac-btn" data-doc-target="ledger">
            PUBLIC RECORD
          </button>
        </div>
      </section>

      <section className="ac-block">
        <h3 className="ac-block__title">LIVE SYSTEMS</h3>
        <div className="ac-row ac-keys">
          {LIVE_SYSTEMS.map((l) => (
            <span key={l.href} className="ac-keywrap">
              <a
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className="ac-btn ac-btn--filled"
              >
                {"▶ "}
                {l.host}
                <span className="ac-sr-only"> (opens in a new tab)</span>
              </a>
              {l.note ? <small className="ac-note">{l.note}</small> : null}
            </span>
          ))}
        </div>
      </section>
    </DocShell>
  );
}

/**
 * Rows carry their own group name and are already in reading order, so runs of
 * consecutive rows are folded into one heading here rather than kept in a
 * separate nested structure that could drift out of step with the data.
 */
function groupCapabilities() {
  const out: { name: string; rows: typeof CAPABILITIES }[] = [];
  for (const c of CAPABILITIES) {
    const name = c.group ?? "";
    const last = out[out.length - 1];
    if (last && last.name === name) last.rows.push(c);
    else out.push({ name, rows: [c] });
  }
  return out;
}

function CapabilitiesDoc() {
  const groups = groupCapabilities();
  return (
    <DocShell id="capabilities" title="CAPABILITY MAP" status={`${CAPABILITIES.length} ROWS`}>
      <p className="ac-tagline">{CAPABILITY_LEAD}</p>
      {groups.map((g) => (
        <section key={g.name || "ungrouped"} className="ac-capgroup">
          {g.name ? <h3 className="ac-capgroup__title">{g.name}</h3> : null}
          {g.rows.map((c) => (
            <section key={c.label} className="ac-block">
              <h4 className="ac-block__title">{c.label}</h4>
              <p className="ac-prose">{c.proof}</p>
              <Keys links={c.links} />
            </section>
          ))}
        </section>
      ))}
    </DocShell>
  );
}

function BackgroundDoc() {
  return (
    <DocShell id="background" title="BACKGROUND" status="TEN YEARS">
      <ul className="ac-list">
        {BACKGROUND.map((line, i) => (
          <li key={i}>{line}</li>
        ))}
      </ul>
    </DocShell>
  );
}

function LedgerLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <a href={href} target="_blank" rel="noopener noreferrer">
      {children}
      <span className="ac-sr-only"> (opens in a new tab)</span>
    </a>
  );
}

function LedgerRow({ row }: { row: TweetLedgerEntry }) {
  const relevant = Boolean(row.receipt);
  return (
    <tr
      className={row.star ? "ac-table__row--active" : undefined}
      data-row
      data-rel={relevant ? "1" : "0"}
      data-theme={row.theme}
      data-year={row.date.slice(0, 4)}
      data-date={row.date}
    >
      <td className="nbx-rel">
        {relevant ? (
          <span className="nbx-rel__flag" title="Bears directly on this role">
            ●<span className="ac-sr-only"> relevant</span>
          </span>
        ) : (
          <span className="ac-sr-only">not flagged</span>
        )}
      </td>
      <td className="ac-table__num ac-table__date">{row.date}</td>
      <td>
        {row.title}
        {/* The reason rides under the title rather than in its own column. It
            exists for 64 of 153 rows, so a column would be mostly empty and
            would cost the title the width it actually needs. */}
        {row.why ? <span className="nbx-why">{row.why}</span> : null}
      </td>
      <td className="nbx-theme">{row.theme}</td>
      <td>
        <LedgerLink href={row.tweetUrl}>OPEN</LedgerLink>
      </td>
    </tr>
  );
}

/** A boundary row. All three sets are rendered; the element shows one set. */
function LedgerGroup({
  kind,
  keyName,
  label,
  count,
}: {
  kind: "theme" | "year" | "rel";
  keyName: string;
  label: string;
  count: number;
}) {
  return (
    <tr className="ac-table__group" data-group={kind} data-key={keyName} hidden={kind !== "theme"}>
      <th scope="colgroup" colSpan={5}>
        {label}
        <span className="ac-table__group-count">
          {count} {count === 1 ? "post" : "posts"}
        </span>
      </th>
    </tr>
  );
}

function SortHeader({
  sort,
  label,
  className,
  initial,
}: {
  sort: string;
  label: string;
  className?: string;
  initial?: "ascending";
}) {
  return (
    <th className={className} aria-sort={initial ?? "none"} data-sort-col={sort}>
      <button type="button" className="nbx-sort" data-sort={sort}>
        {label}
        <span className="nbx-sort__mark" aria-hidden="true" />
      </button>
    </th>
  );
}

/**
 * One table, one scroll region. `byYear` groups rows under sticky year rows
 * inside a single scroller rather than emitting a scroll box per year — a
 * column of small independently-scrolling panes is miserable to read, and it
 * hides how long the record actually is.
 */
/**
 * One table for the whole record. Sortable by relevance, date or theme, and
 * grouped by whichever of those you sorted on.
 *
 * Every row and every group boundary is server-rendered once. <ac-ledger>
 * reorders by moving existing nodes and toggles `hidden` on the group sets it
 * is not showing — it never creates or destroys one. Without JavaScript the
 * table renders grouped by theme, which is the default anyway.
 */
function LedgerTable({ rows }: { rows: TweetLedgerEntry[] }) {
  const byTheme = new Map<string, TweetLedgerEntry[]>();
  const byYear = new Map<string, TweetLedgerEntry[]>();
  let relCount = 0;
  for (const row of rows) {
    (byTheme.get(row.theme) ?? byTheme.set(row.theme, []).get(row.theme)!).push(row);
    const y = row.date.slice(0, 4);
    (byYear.get(y) ?? byYear.set(y, []).get(y)!).push(row);
    if (row.receipt) relCount += 1;
  }
  const themes = TWEET_THEMES.filter((t) => byTheme.has(t));

  return (
    <div className="ac-table-scroll">
      <table className="ac-table ac-table--dense ac-table--prose nbx-ledger">
        <thead>
          <tr>
            <SortHeader sort="rel" label="Rel" className="nbx-rel" />
            <SortHeader sort="year" label="Date" />
            <th>What I posted</th>
            <SortHeader sort="theme" label="Theme" className="nbx-theme" initial="ascending" />
            <th>Tweet</th>
          </tr>
        </thead>
        <tbody>
          {/* Server order is the default sort: theme headings interleaved with
              their rows, so the table reads correctly with no JavaScript. */}
          {themes.map((t) => (
            <Fragment key={`g-${t}`}>
              <LedgerGroup kind="theme" keyName={t} label={t} count={byTheme.get(t)!.length} />
              {byTheme.get(t)!.map((row) => (
                <LedgerRow key={row.tweetUrl} row={row} />
              ))}
            </Fragment>
          ))}

          {/* Boundaries for the other two sorts, parked and hidden until used. */}
          {[...byYear.keys()].map((y) => (
            <LedgerGroup
              key={`year-${y}`}
              kind="year"
              keyName={y}
              label={y}
              count={byYear.get(y)!.length}
            />
          ))}
          <LedgerGroup kind="rel" keyName="1" label="Relevant to this role" count={relCount} />
          <LedgerGroup
            kind="rel"
            keyName="0"
            label="The rest of the record"
            count={rows.length - relCount}
          />
        </tbody>
      </table>
    </div>
  );
}

function LedgerDoc() {
  return (
    <DocShell id="ledger" title="PUBLIC RECORD" status={`${TWEET_LEDGER_FULL.length} POSTS`}>
      {TWEET_LEDGER_INTRO.map((para, i) => (
        <p key={i} className="ac-prose ac-overview__para">
          {para}
        </p>
      ))}

      <section className="ac-block">
        <h3 className="ac-block__title">
          THE RECORD &mdash; {TWEET_LEDGER_FULL.length}
        </h3>
        <p className="ac-prose ac-ledger__note">
          Grouped by theme. Sort by relevance, date or theme from the column
          headings. {TWEET_LEDGER_RECEIPTS.length} rows carry a dot: those are
          the ones that bear on this role.
        </p>
        <ac-ledger>
          <LedgerTable rows={TWEET_LEDGER_FULL} />
        </ac-ledger>
      </section>
    </DocShell>
  );
}

/* ─────────────────────────────────────────────────────────────
   Console
   ───────────────────────────────────────────────────────────── */

export default function NebiusConsole() {
  return (
    <ac-console className="ac-console" default-doc="01">
      {/* Top status bar */}
      <div className="ac-statusbar ac-console__bar" role="status">
        <span className="ac-bar__line">
          <span>Jared Werba</span>
          <span className="ac-bar__sep" aria-hidden="true">//</span>
          <span>Nebius FDE Candidate</span>
          <span className="ac-bar__sep" aria-hidden="true">//</span>
          <span>Prepared for: Chris Mulder, Head of Engineering &mdash; AI R&amp;D</span>
        </span>
        <span className="ac-push nbx-barkeys">
          {/* The escape hatch. Deliberately styled plain rather than as an
              amber key: it is the one control that is not part of the
              simulation, and it should not look like it is. */}
          <button
            type="button"
            className="nbx-readability"
            data-readability-toggle
            aria-pressed="false"
          >
            READABILITY
          </button>
          <span className="ac-bar__sep" aria-hidden="true">//</span>
          REC:<span data-match-count>{Object.keys(DOC_META).length}</span>
        </span>
      </div>

      {/* Recipient mark. Desaturated — a label, not a claim of affiliation. */}
      <div className="ac-brandbar">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/nebius-logo.svg"
          alt="Nebius"
          className="ac-brand"
          width={131}
          height={36}
        />
        <span className="ac-brand__caption">Forward Deployed Engineer &mdash; AI R&amp;D</span>
      </div>

      <div className="ac-console__grid">
        {/* ── Index rail ── */}
        <ac-index className="ac-rail">
          <button type="button" className="ac-btn ac-rail__toggle" data-index-toggle>
            INDEX
          </button>

          <div className="ac-rail__inner">
            <ac-search className="ac-search">
              <label className="ac-field">
                <span className="ac-sr-only">Search projects</span>
                <input
                  type="search"
                  className="ac-input"
                  placeholder="SEARCH  ( / )"
                  autoComplete="off"
                  spellCheck={false}
                />
              </label>
              <div className="ac-hints">
                {HINTS.map((h) => (
                  <button key={h} type="button" className="ac-btn ac-hint" data-hint={h}>
                    {h}
                  </button>
                ))}
              </div>
            </ac-search>

            <p className="ac-banner ac-nomatch" data-no-match hidden>
              NO MATCH
            </p>

            <nav className="nbx-nav" aria-label="Document index">
              {SECTIONS.map((section) => (
                <div key={section.id} className="nbx-nav__group" data-section>
                  <p className="nbx-nav__title">{section.title}</p>
                  <ul className="nbx-nav__list">
                    {section.docs.map((docId) => {
                      const meta = DOC_META[docId];
                      if (!meta) return null;
                      const project = byId.get(docId);
                      return (
                        <li
                          key={docId}
                          data-search={`${meta.label} ${meta.meta} ${meta.search}`.toLowerCase()}
                        >
                          <button
                            type="button"
                            className="nbx-nav__item"
                            data-doc-target={docId}
                            data-featured={FEATURED.has(docId) ? "" : undefined}
                            aria-current="false"
                          >                            <span className="nbx-nav__label">{meta.label}</span>
                            <span className="nbx-nav__meta">{meta.meta}</span>
                          </button>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </div>
        </ac-index>

        {/* ── Content ── */}
        <div className="ac-content" data-content-scroll>
          <OverviewDoc />
          <CapabilitiesDoc />
          <BackgroundDoc />
          <LedgerDoc />
          {NEBIUS_PROJECTS.map((p) => (
            <ProjectDoc key={p.id} project={p} />
          ))}
        </div>
      </div>


      <div className="ac-statusbar ac-console__foot" role="status">
        <span>JARED WERBA / BOSTON MA</span>
        <span className="ac-push ac-foot__links">
          <a href="https://github.com/jaredwerba" target="_blank" rel="noopener noreferrer">
            GITHUB
          </a>
          <a href="https://linkedin.com/in/jwerba" target="_blank" rel="noopener noreferrer">
            LINKEDIN
          </a>
        </span>
      </div>
    </ac-console>
  );
}
