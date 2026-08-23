"use client";

import { useEffect, useRef, useState } from "react";

type AskResult = {
  answer: string | null;
  sql: string | null;
  description: string | null;
  columns: string[];
  rows: string[][];
};

const SAMPLE_QUESTIONS = [
  "Which book did I highlight the most?",
  "How many books and pages did I read in 2020?",
  "Which themes do I highlight most often?",
  "What were my five-star books?",
];

const LOADING_LINES = [
  "CONNECTING TO LAKEHOUSE",
  "GENIE WRITING SQL",
  "RUNNING ON SERVERLESS WAREHOUSE",
  "READING DELTA TABLES",
];

function cleanMarkdown(s: string): string {
  return s.replace(/\*\*/g, "");
}

export default function AskBookshelf() {
  const [question, setQuestion] = useState("");
  const [asked, setAsked] = useState("");
  const [loading, setLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [result, setResult] = useState<AskResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [showSql, setShowSql] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (!loading) return;
    const t = setInterval(() => setElapsed((e) => e + 1), 1000);
    return () => clearInterval(t);
  }, [loading]);

  async function ask(q: string) {
    const trimmed = q.trim();
    if (!trimmed || loading) return;
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;
    setAsked(trimmed);
    setLoading(true);
    setElapsed(0);
    setResult(null);
    setError(null);
    setShowSql(false);
    try {
      const res = await fetch("/api/bookshelf/ask", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ question: trimmed }),
        signal: controller.signal,
      });
      const data = await res.json();
      if (!res.ok) {
        setError(typeof data.error === "string" ? data.error : "Something broke.");
      } else {
        setResult(data as AskResult);
      }
    } catch (err) {
      if (!(err instanceof DOMException && err.name === "AbortError")) {
        setError("The lakehouse didn't answer. Try again in a moment.");
      }
    } finally {
      setLoading(false);
    }
  }

  const loadingLine = LOADING_LINES[Math.min(Math.floor(elapsed / 4), LOADING_LINES.length - 1)];

  return (
    <div className="bg-nerv-black border border-nerv-mid-gray">
      <div className="flex items-center justify-between px-2.5 py-1 border-b border-nerv-mid-gray bg-nerv-dark-gray">
        <span className="font-nerv-display text-[10px] tracking-[0.2em] text-nerv-orange">
          ASK MY BOOKSHELF
        </span>
        <span className="font-nerv-mono text-[9px] tracking-[0.15em] text-nerv-mid-gray">
          LIVE · DATABRICKS GENIE
        </span>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault();
          ask(question);
        }}
        className="flex items-center gap-2 px-1.5 py-1.5 md:px-2.5 border-b border-nerv-mid-gray/40"
      >
        <span className="font-nerv-mono text-[10px] text-nerv-cyan tracking-[0.2em] shrink-0">
          &gt;
        </span>
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          maxLength={200}
          placeholder="ASK IN PLAIN ENGLISH — E.G. WHICH AUTHOR DO I HIGHLIGHT MOST?"
          className="flex-1 min-w-0 bg-transparent font-nerv-mono text-[11px] text-nerv-cyan placeholder:text-nerv-mid-gray/60 tracking-wider outline-none"
        />
        <button
          type="submit"
          disabled={loading || question.trim().length < 3}
          className="font-nerv-display text-[10px] tracking-[0.18em] px-2 py-0.5 border border-nerv-orange/60 text-nerv-orange hover:bg-nerv-orange hover:text-nerv-black disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-nerv-orange transition-colors shrink-0"
        >
          ASK
        </button>
      </form>

      <div className="flex flex-wrap gap-1.5 px-2.5 py-1.5 border-b border-nerv-mid-gray/40">
        {SAMPLE_QUESTIONS.map((q) => (
          <button
            key={q}
            type="button"
            onClick={() => {
              setQuestion(q);
              ask(q);
            }}
            disabled={loading}
            className="font-nerv-mono text-[9px] tracking-wider px-1.5 py-0.5 border border-nerv-cyan/30 text-nerv-cyan/80 hover:border-nerv-orange hover:text-nerv-orange disabled:opacity-40 transition-colors"
          >
            {q.toUpperCase()}
          </button>
        ))}
      </div>

      <div className="px-2.5 py-2 min-h-[120px] font-nerv-mono text-[11px]">
        {loading && (
          <div className="text-nerv-cyan">
            <span className="text-nerv-orange">&gt;</span> {asked}
            <div className="mt-2 text-nerv-mid-gray animate-pulse">
              {loadingLine}
              {".".repeat((elapsed % 3) + 1)} [{elapsed}s]
            </div>
          </div>
        )}

        {error && !loading && (
          <div>
            <div className="text-nerv-cyan">
              <span className="text-nerv-orange">&gt;</span> {asked}
            </div>
            <div className="mt-2 text-nerv-orange">{error}</div>
          </div>
        )}

        {result && !loading && (
          <div className="space-y-2">
            <div className="text-nerv-cyan">
              <span className="text-nerv-orange">&gt;</span> {asked}
            </div>
            {result.answer && (
              <p className="text-nerv-cyan leading-relaxed whitespace-pre-wrap">
                {cleanMarkdown(result.answer)}
              </p>
            )}

            {result.columns.length > 0 && result.rows.length > 1 && (
              <div className="overflow-x-auto border border-nerv-mid-gray/40">
                <table className="w-full border-collapse text-[10px]">
                  <thead>
                    <tr className="bg-nerv-dark-gray text-nerv-cyan border-b border-nerv-cyan/30">
                      {result.columns.map((c) => (
                        <th
                          key={c}
                          className="px-2 py-1 text-left uppercase tracking-wider whitespace-nowrap"
                        >
                          {c.replace(/_/g, " ")}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {result.rows.map((row, i) => (
                      <tr
                        key={i}
                        className="text-nerv-cyan/90 border-b border-nerv-mid-gray/20 hover:bg-nerv-cyan/5"
                      >
                        {row.map((cell, j) => (
                          <td key={j} className="px-2 py-1 whitespace-nowrap">
                            {cell ?? "—"}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}

            {result.sql && (
              <div>
                <button
                  type="button"
                  onClick={() => setShowSql((s) => !s)}
                  className="text-[9px] tracking-[0.15em] text-nerv-mid-gray hover:text-nerv-orange transition-colors"
                >
                  [{showSql ? "HIDE" : "VIEW"} GENERATED SQL]
                </button>
                {showSql && (
                  <pre className="mt-1 p-2 border border-nerv-mid-gray/40 bg-nerv-dark-gray text-nerv-cyan/80 text-[10px] overflow-x-auto whitespace-pre-wrap">
                    {result.sql}
                  </pre>
                )}
              </div>
            )}
          </div>
        )}

        {!loading && !result && !error && (
          <div className="text-nerv-mid-gray/70 space-y-3">
            <p>
              Ask a question about 15 years of my reading — 459 books, 2,821 Kindle
              highlights. Genie turns it into SQL and runs it live against Delta
              tables in my Databricks lakehouse.
            </p>

            <div>
              <div className="text-[9px] tracking-[0.2em] text-nerv-cyan/70 mb-1">
                DATABRICKS SERVICES IN USE
              </div>
              <ul className="space-y-0.5 text-[10px]">
                <li>
                  <span className="text-nerv-orange/80">GENIE</span> — makes SQL
                  from English questions
                </li>
                <li>
                  <span className="text-nerv-orange/80">SERVERLESS SQL WAREHOUSE</span>{" "}
                  — runs the queries
                </li>
                <li>
                  <span className="text-nerv-orange/80">UNITY CATALOG</span> —
                  controls access to the data (workspace.reading)
                </li>
                <li>
                  <span className="text-nerv-orange/80">DELTA LAKE</span> — stores
                  the tables
                </li>
                <li>
                  <span className="text-nerv-orange/80">UC VOLUMES</span> — holds
                  the raw CSV and JSON files
                </li>
              </ul>
            </div>

            <div>
              <div className="text-[9px] tracking-[0.2em] text-nerv-cyan/70 mb-1">
                HOW THIS WORKS
              </div>
              {/* Written in ASD-STE100 Simplified Technical English. */}
              <ol className="space-y-0.5 text-[10px] list-none">
                <li>1. You write a question in English.</li>
                <li>2. The website sends your question to Databricks Genie.</li>
                <li>3. Genie makes an SQL query from your question.</li>
                <li>4. A serverless SQL warehouse runs the query on Delta tables.</li>
                <li>5. Unity Catalog controls the access to the tables.</li>
                <li>6. The website shows the answer, the SQL, and the data.</li>
              </ol>
            </div>
          </div>
        )}
      </div>

      <div className="px-2.5 py-1 border-t border-nerv-mid-gray bg-nerv-dark-gray text-[9px] font-nerv-mono text-nerv-mid-gray tracking-wider">
        QUERIES RUN LIVE · UNITY CATALOG workspace.reading · DELTA LAKE · GENIE
      </div>
    </div>
  );
}
