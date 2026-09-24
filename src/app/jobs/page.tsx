"use client";

import { useCallback, useRef, useState } from "react";

type Job = {
  url: string;
  title: string;
  company: string;
  location: string | null;
  remote: boolean | null;
  source: string | null;
  posted_at: string | null;
};

function ymd(iso: string | null): string {
  if (!iso) return "";
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return "";
  return d.toISOString().slice(0, 10);
}

function md(iso: string | null): string {
  const [y, m, day] = ymd(iso).split("-");
  if (!m || !day) return "";
  return `${Number(m)}/${Number(day)}`;
}

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[] | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [query, setQuery] = useState("");
  const lastQuery = useRef<AbortController | null>(null);

  const load = useCallback(async () => {
    setLoading(true);
    setError("");
    lastQuery.current?.abort();
    const ctrl = new AbortController();
    lastQuery.current = ctrl;
    try {
      const res = await fetch("/api/jobs", { signal: ctrl.signal });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      setJobs(data.jobs ?? []);
    } catch (e) {
      if ((e as Error).name !== "AbortError") setError(String((e as Error).message ?? e));
    } finally {
      if (!ctrl.signal.aborted) setLoading(false);
    }
  }, []);

  const q = query.trim().toLowerCase();
  const shown = (jobs ?? []).filter((j) =>
    !q ||
    j.title.toLowerCase().includes(q) ||
    j.company.toLowerCase().includes(q) ||
    (j.location ?? "").toLowerCase().includes(q) ||
    (j.source ?? "").toLowerCase().includes(q),
  );

  return (
    <main style={{ maxWidth: 1100, margin: "0 auto", padding: "2rem 1rem", color: "#e8e8e8" }}>
      <style>{`
        .jobs-table { width: 100%; border-collapse: collapse; font-size: 0.9rem; }
        .jobs-table th { text-align: left; padding: 8px 10px; color: #888; font-weight: 500; text-transform: uppercase; letter-spacing: 0.08em; font-size: 0.7rem; border-bottom: 1px solid #333; }
        .jobs-table td { padding: 8px 10px; border-bottom: 1px solid #222; vertical-align: top; }
        .jobs-table tr:hover td { background: #161616; }
        .jobs-table a { color: #7FEE64; text-decoration: none; }
        .jobs-table a:hover { text-decoration: underline; }
      `}</style>

      <h1 style={{ fontSize: "1.4rem", marginBottom: 4 }}>Jobs</h1>
      <p style={{ color: "#999", fontSize: "0.85rem", margin: "0 0 1rem" }}>
        Live AE board — queries jobs_central directly. {jobs ? `${shown.length} of ${jobs.length} shown` : ""}
      </p>

      <div style={{ display: "flex", gap: "0.75rem", alignItems: "center", marginBottom: "1rem", flexWrap: "wrap" }}>
        {!jobs ? (
          <button
            onClick={load}
            disabled={loading}
            style={{ background: "#7FEE64", color: "#000", border: "none", padding: "10px 18px", fontWeight: 600, cursor: "pointer", fontSize: "0.9rem" }}
          >
            {loading ? "Loading…" : "AE — load live board"}
          </button>
        ) : (
          <>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Filter title, company, location…"
              style={{ background: "#111", color: "#eee", border: "1px solid #333", padding: "8px 12px", fontSize: "0.9rem", minWidth: 260 }}
            />
            <button
              onClick={load}
              disabled={loading}
              style={{ background: "#222", color: "#eee", border: "1px solid #333", padding: "8px 14px", cursor: "pointer", fontSize: "0.85rem" }}
            >
              {loading ? "Refreshing…" : "Refresh"}
            </button>
          </>
        )}
        {error && <span style={{ color: "#ff6b6b", fontSize: "0.85rem" }}>{error}</span>}
      </div>

      {jobs && (
        <table className="jobs-table">
          <thead>
            <tr>
              <th style={{ width: 70 }}>Posted</th>
              <th>Company</th>
              <th>Title</th>
              <th>Location</th>
              <th>Source</th>
              <th style={{ width: 60 }}>Apply</th>
            </tr>
          </thead>
          <tbody>
            {shown.map((j) => (
              <tr key={j.url}>
                <td>{md(j.posted_at)}</td>
                <td>{j.company}</td>
                <td>
                  <a href={j.url} target="_blank" rel="noopener">{j.title}</a>
                </td>
                <td>{j.remote ? "Remote" : (j.location ?? "")}</td>
                <td style={{ color: "#888", fontSize: "0.8rem" }}>{j.source ?? ""}</td>
                <td>
                  <a href={j.url} target="_blank" rel="noopener">→</a>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </main>
  );
}
