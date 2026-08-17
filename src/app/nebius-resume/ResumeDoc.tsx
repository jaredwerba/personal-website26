import { Fragment } from "react";
import { SPEED, SPEED_META } from "@/lib/h200-sweep";
import {
  BACKGROUND,
  CAPABILITIES,
  NEBIUS_PROJECTS,
  TWEET_LEDGER_FULL,
  TWEET_THEMES,
  type NebiusProject,
  type ProjectLink,
  type TweetLedgerEntry,
} from "@/lib/nebius-projects";
import {
  GAPS,
  GAPS_LEAD,
  HEADER,
  SECTIONS,
  START_HERE,
  SUMMARY,
  VERIFY,
} from "@/lib/nebius-resume";

/* ─────────────────────────────────────────────────────────────
   Grouping lives here, derived from project ids, so the data
   module stays shared with /nebius and cannot drift.
   ───────────────────────────────────────────────────────────── */

const WORK_GROUPS: { title: string; note: string; ids: string[] }[] = [
  {
    title: "Agentic systems and evaluation",
    note: "Where my depth is. Every one of these is code I wrote.",
    ids: ["01", "03", "04", "13", "05"],
  },
  {
    title: "Inference and GPU",
    note: "One of these ran on Nebius hardware.",
    ids: ["18", "17"],
  },
  {
    title: "Hackathon and prototypes",
    note: "Built under a clock, judged by other people.",
    ids: ["02", "16", "08"],
  },
  {
    title: "Product and platform work",
    note: "Live software with real users, real domains, and real bugs I fixed.",
    ids: ["06", "07", "09", "10", "11", "12", "14", "15"],
  },
];

const byId = new Map(NEBIUS_PROJECTS.map((p) => [p.id, p]));

/** Claim level, read off the copy rather than stored twice. */
function claimOf(proof: string): { tag: string; cls: string } {
  if (/^I sold and architected|I sold and architected/.test(proof) || /sold and architected/.test(proof.slice(0, 90)))
    return { tag: "Sold", cls: "rs-tag--sold" };
  if (/^I run /.test(proof)) return { tag: "Operate", cls: "rs-tag--ops" };
  return { tag: "Built", cls: "rs-tag--built" };
}

function Section({
  id,
  label,
  blurb,
  children,
}: {
  id: string;
  label: string;
  blurb?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rs-sec" id={id} data-section>
      <h2 className="rs-h2">{label}</h2>
      {blurb ? <p className="rs-blurb">{blurb}</p> : null}
      {children}
    </section>
  );
}

function Links({ links }: { links?: ProjectLink[] }) {
  if (!links?.length) return null;
  const ordered = [...links].sort(
    (a, b) => Number(Boolean(b.primary)) - Number(Boolean(a.primary)),
  );
  return (
    <div className="rs-links">
      {ordered.map((l) => (
        <a
          key={l.href}
          href={l.href}
          target="_blank"
          rel="noopener noreferrer"
          className={l.primary ? "rs-btn rs-btn--primary" : "rs-btn"}
        >
          {l.label}
          {l.note ? <span className="rs-note-sm"> · {l.note}</span> : null}
        </a>
      ))}
    </div>
  );
}


/**
 * One comparison, not a report. Two bars, four numbers: what the server did
 * before I tuned it, and after. The full seven-level sweep lives with the
 * write-up; a hiring manager needs the point, not the dataset.
 */
function SpeedFigure() {
  const max = Math.max(SPEED.before.tokensPerSecond, SPEED.after.tokensPerSecond);
  return (
    <figure className="rs-fig">
      <figcaption className="rs-fig__cap">
        Speed before and after tuning, with {SPEED_META.concurrency} people asking
        at once. Same GPU, same model, one setting changed.
      </figcaption>
      {[SPEED.before, SPEED.after].map((r, i) => (
        <div key={r.label} className={`rs-speed${i === 1 ? " rs-speed--after" : ""}`}>
          <span className="rs-speed__label">{r.label}</span>
          <span className="rs-speed__track">
            <span
              className="rs-speed__fill"
              style={{ width: `${(r.tokensPerSecond / max) * 100}%` }}
            />
          </span>
          <span className="rs-speed__num">{r.tokensPerSecond.toLocaleString()} tok/s</span>
          <span className="rs-speed__wait">{r.waitSeconds}s wait</span>
        </div>
      ))}
      <p className="rs-fig__note">
        <code>{SPEED_META.flag}</code> went from four requests at a time to
        sixty-four. Throughput and waiting time usually trade against each other.
        They both improved here, because the old setting was leaving the card
        idle. {SPEED_META.requests} requests measured, {SPEED_META.failures} failures.
      </p>
    </figure>
  );
}

function ProjectCard({ project, open }: { project: NebiusProject; open?: boolean }) {
  const operates = project.kind === "operates";
  return (
    <details className="rs-card" id={`p-${project.id}`} open={open}>
      <summary>
        <span className="rs-card__name">{project.name}</span>
        <span className="rs-card__tag">{project.tagline}</span>
        <span className="rs-card__status">{project.status}</span>
      </summary>
      <div className="rs-card__body">
        <div className="rs-chips">
          {project.stack.map((s) => (
            <span key={s} className="rs-chip">
              {s}
            </span>
          ))}
        </div>

        <p className="rs-label">Problem</p>
        <p>{project.problem}</p>

        <p className="rs-label">{operates ? "What it does" : "What I built"}</p>
        <ul>
          {project.built.map((b, i) => (
            <li key={i}>{b}</li>
          ))}
        </ul>

        {project.id === "18" ? <SpeedFigure /> : null}

        <p className="rs-label">{operates ? "How I use it" : "Outcome"}</p>
        <ul>
          {project.outcome.map((o, i) => (
            <li key={i}>{o}</li>
          ))}
        </ul>

        <Links links={project.links} />
      </div>
    </details>
  );
}

/* ─────────────────────────────────────────────────────────────
   Page
   ───────────────────────────────────────────────────────────── */

export default function ResumeDoc() {
  // Capability rows keep their group order from the data module.
  const capGroups: { name: string; rows: typeof CAPABILITIES }[] = [];
  for (const c of CAPABILITIES) {
    const name = c.group ?? "";
    const last = capGroups[capGroups.length - 1];
    if (last && last.name === name) last.rows.push(c);
    else capGroups.push({ name, rows: [c] });
  }

  const relevant = TWEET_LEDGER_FULL.filter((e) => e.receipt);
  const ledgerByTheme = new Map<string, TweetLedgerEntry[]>();
  for (const e of TWEET_LEDGER_FULL) {
    const list = ledgerByTheme.get(e.theme) ?? [];
    list.push(e);
    ledgerByTheme.set(e.theme, list);
  }
  const themes = TWEET_THEMES.filter((t) => ledgerByTheme.has(t));

  const liveCount = NEBIUS_PROJECTS.reduce(
    (n, p) => n + (p.links ?? []).filter((l) => l.primary).length,
    0,
  );

  return (
    <div className="rs" data-resume>
      <div className="rs-bar">
        <span className="rs-bar__name">{HEADER.name}</span>
        <span className="rs-bar__sep">/</span>
        <span>{HEADER.role}</span>
        <span className="rs-bar__sep">/</span>
        <span>Prepared for {HEADER.preparedFor}</span>
        <span className="rs-bar__right">
          <a href="/nebius">Console version</a>
          <a href={HEADER.github} target="_blank" rel="noopener noreferrer">
            GitHub
          </a>
          <a href={HEADER.linkedin} target="_blank" rel="noopener noreferrer">
            LinkedIn
          </a>
        </span>
      </div>

      <div className="rs-wrap">
        <nav className="rs-toc" aria-label="Contents">
          <p className="rs-toc__title">Contents</p>
          <ul className="rs-toc__list">
            {SECTIONS.map((s) => (
              <li key={s.id}>
                <a href={`#${s.id}`} data-toc={s.id}>
                  {s.label}
                </a>
              </li>
            ))}
          </ul>
        </nav>

        <main className="rs-main">
          <h1 className="rs-h1">{HEADER.name}</h1>
          <p className="rs-sub">Forward Deployed Engineer — AI R&amp;D, Nebius</p>
          <p className="rs-meta">
            {HEADER.location} · <a href={`mailto:${HEADER.email}`}>{HEADER.email}</a> ·{" "}
            <a href={HEADER.site} target="_blank" rel="noopener noreferrer">
              jwerba.com
            </a>{" "}
            ·{" "}
            <a href={HEADER.x} target="_blank" rel="noopener noreferrer">
              @jaredwerba
            </a>
          </p>

          {/* ── In one minute ── */}
          <Section id="summary" label="In one minute">
            {SUMMARY.map((p, i) => (
              <p key={i}>{p}</p>
            ))}

            <h3 className="rs-h3">If you only open three things</h3>
            <div className="rs-cards">
              {START_HERE.map((s) => {
                const p = byId.get(s.id);
                if (!p) return null;
                const primary = (p.links ?? []).find((l) => l.primary);
                const source = (p.links ?? []).find((l) => /github/.test(l.href));
                return (
                  <div key={s.id} className="rs-card">
                    <div className="rs-card__body">
                      <p className="rs-label">{s.name}</p>
                      <p>{s.why}</p>
                      <div className="rs-links">
                        {primary ? (
                          <a
                            className="rs-btn rs-btn--primary"
                            href={primary.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            {primary.label}
                          </a>
                        ) : null}
                        {source ? (
                          <a
                            className="rs-btn"
                            href={source.href}
                            target="_blank"
                            rel="noopener noreferrer"
                          >
                            Source
                          </a>
                        ) : null}
                        <a className="rs-btn" href={`#p-${s.id}`}>
                          Read the write-up
                        </a>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Section>

          {/* ── Against your bar ── */}
          <Section
            id="bar"
            label={SECTIONS[1].label}
            blurb={SECTIONS[1].blurb}
          >
            <div className="rs-note">
              <p className="rs-note__label">How to read the claim column</p>
              <p>
                <span className="rs-tag rs-tag--built">Built</span> is code I wrote.{" "}
                <span className="rs-tag rs-tag--sold">Sold</span> is Oracle work I
                architected and sold but did not operate.{" "}
                <span className="rs-tag rs-tag--ops">Operate</span> is software I run
                daily that someone else wrote. I keep these separate on purpose —
                nothing here should fail a follow-up question.
              </p>
            </div>

            <div className="rs-tablewrap">
              <table className="rs-table">
                <thead>
                  <tr>
                    <th className="rs-cap">Capability</th>
                    <th className="rs-claim">Claim</th>
                    <th>Evidence</th>
                  </tr>
                </thead>
                <tbody>
                  {capGroups.map((g) => (
                    <Fragment key={`cap-${g.name}`}>
                      {g.name ? (
                        <tr className="rs-table__group">
                          <th colSpan={3}>{g.name}</th>
                        </tr>
                      ) : null}
                      {g.rows.map((c) => {
                        const claim = claimOf(c.proof);
                        return (
                          <tr key={c.label}>
                            <td className="rs-cap">{c.label}</td>
                            <td className="rs-claim">
                              <span className={`rs-tag ${claim.cls}`}>{claim.tag}</span>
                            </td>
                            <td>
                              {c.proof}
                              {c.links?.length ? (
                                <div className="rs-links">
                                  {c.links.map((l) => (
                                    <a
                                      key={l.href}
                                      className="rs-btn"
                                      href={l.href}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                    >
                                      {l.label}
                                    </a>
                                  ))}
                                </div>
                              ) : null}
                            </td>
                          </tr>
                        );
                      })}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* ── The gaps ── */}
          <Section id="honest" label={SECTIONS[2].label} blurb={SECTIONS[2].blurb}>
            <p>{GAPS_LEAD}</p>
            {GAPS.map((g) => (
              <div key={g.gap} className="rs-card">
                <div className="rs-card__body">
                  <p className="rs-label">{g.gap}</p>
                  <p>{g.standing}</p>
                  <p className="rs-note-sm">{g.plan}</p>
                </div>
              </div>
            ))}
          </Section>

          {/* ── Work ── */}
          <Section id="work" label={SECTIONS[3].label} blurb={SECTIONS[3].blurb}>
            <p className="rs-note-sm">
              {NEBIUS_PROJECTS.length} projects · {liveCount} deployments running right
              now · every heading below expands.
            </p>
            {WORK_GROUPS.map((group, gi) => (
              <div key={group.title}>
                <h3 className="rs-h3">{group.title}</h3>
                <p className="rs-blurb">{group.note}</p>
                <div className="rs-cards">
                  {group.ids
                    .map((id) => byId.get(id))
                    .filter(Boolean)
                    .map((p, i) => (
                      <ProjectCard
                        key={(p as NebiusProject).id}
                        project={p as NebiusProject}
                        open={gi === 0 && i === 0}
                      />
                    ))}
                </div>
              </div>
            ))}
          </Section>

          {/* ── Ledger ── */}
          <Section id="record" label={SECTIONS[4].label} blurb={SECTIONS[4].blurb}>
            <p>
              I have posted what I was reading since 2017. It is not a portfolio, and
              it does not prove I can build anything. What it proves is that the
              interest is old and the direction was right:{" "}
              <strong>InfiniBand in 2019, RDMA in July 2020, GPT-3 in August 2020,
              RoCE for distributed training in 2024, Ultra Ethernet in 2025.</strong>{" "}
              Every row links to the original post, and X shows the exact timestamp.
            </p>
            <div className="rs-filter" data-ledger-filter>
              <button type="button" data-filter="rel" aria-pressed="true">
                Relevant to this role ({relevant.length})
              </button>
              <button type="button" data-filter="all" aria-pressed="false">
                Everything ({TWEET_LEDGER_FULL.length})
              </button>
            </div>
            <div className="rs-tablewrap">
              <table className="rs-table rs-ledger">
                <thead>
                  <tr>
                    <th className="rs-date">Date</th>
                    <th>What I posted</th>
                    <th className="rs-theme">Theme</th>
                    <th className="rs-open">Link</th>
                  </tr>
                </thead>
                <tbody>
                  {themes.map((t) => (
                    <Fragment key={`led-${t}`}>
                      {/* A theme with no flagged rows starts hidden, so the
                          default filtered view has no empty headings. */}
                      <tr
                        className="rs-table__group"
                        data-theme-head={t}
                        hidden={ledgerByTheme.get(t)!.every((e) => !e.receipt)}
                      >
                        <th colSpan={4}>
                          {t}
                          {" · "}
                          <span data-theme-count={t}>
                            {ledgerByTheme.get(t)!.filter((e) => e.receipt).length}
                          </span>
                        </th>
                      </tr>
                      {ledgerByTheme.get(t)!.map((e) => (
                        // Hidden in the markup, not by script, so the default
                        // view matches the pressed filter with JS switched off.
                        <tr
                          key={e.tweetUrl}
                          data-rel={e.receipt ? "1" : "0"}
                          hidden={!e.receipt}
                        >
                          <td className="rs-date">{e.date}</td>
                          <td>
                            {e.receipt ? <span className="rs-flag">● </span> : null}
                            {e.title}
                            {e.why ? <span className="rs-why">{e.why}</span> : null}
                          </td>
                          <td className="rs-theme">{e.theme}</td>
                          <td className="rs-open">
                            <a href={e.tweetUrl} target="_blank" rel="noopener noreferrer">
                              Open
                            </a>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  ))}
                </tbody>
              </table>
            </div>
          </Section>

          {/* ── Background ── */}
          <Section id="background" label={SECTIONS[5].label} blurb={SECTIONS[5].blurb}>
            <ul>
              {BACKGROUND.map((b, i) => (
                <li key={i}>{b}</li>
              ))}
            </ul>
            <div className="rs-note">
              <p className="rs-note__label">Why this is relevant rather than a detour</p>
              <p>
                A Forward Deployed Engineer sits with a partner&rsquo;s engineers and
                makes their product work on someone else&rsquo;s platform. I have done
                the customer-facing half of that for ten years, on infrastructure, with
                CTOs, under a quota. What I have added since is the engineering half.
                Most candidates have to learn the first part on the job.
              </p>
            </div>
          </Section>

          {/* ── Verify ── */}
          <Section id="verify" label={SECTIONS[6].label}>
            <table className="rs-table">
              <tbody>
                {VERIFY.map((v) => (
                  <tr key={v.label}>
                    <td className="rs-cap">
                      {v.href ? (
                        <a
                          href={v.href}
                          target={v.href.startsWith("/") ? undefined : "_blank"}
                          rel={v.href.startsWith("/") ? undefined : "noopener noreferrer"}
                        >
                          {v.label}
                        </a>
                      ) : (
                        v.label
                      )}
                    </td>
                    <td>{v.detail}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Section>

          <footer className="rs-foot">
            <p>
              {HEADER.name} · {HEADER.location} ·{" "}
              <a href={`mailto:${HEADER.email}`}>{HEADER.email}</a> ·{" "}
              <a href="/nebius">console version of this page</a>
            </p>
            <p className="rs-note-sm">
              Written for one conversation. Unlisted and not indexed. Every fact on this
              page comes from the same source file as the console version, so the two
              cannot disagree.
            </p>
          </footer>
        </main>
      </div>
    </div>
  );
}
