"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

interface HighlightBook {
  title: string;
  author: string;
}

interface HighlightItem {
  /** Index into `books`. */
  b: number;
  text: string;
  loc: string;
}

interface HighlightsData {
  books: HighlightBook[];
  items: HighlightItem[];
}

/** Search results are capped — 2,800 rows at once is a scroll no one finishes. */
const MAX_RESULTS = 200;

/** The shuffle card skips one-word highlights, which read as noise on their own. */
const MIN_FEATURE_LENGTH = 80;

/** Indices worth featuring — long enough to stand alone out of context. */
function featurableIndices(items: HighlightItem[]): number[] {
  const long = items
    .map((item, i) => (item.text.length >= MIN_FEATURE_LENGTH ? i : -1))
    .filter((i) => i >= 0);
  return long.length > 0 ? long : items.map((_, i) => i);
}

function pickFrom(indices: number[], avoid: number | null): number | null {
  if (indices.length === 0) return null;
  // Never serve the same highlight twice in a row.
  let next = avoid;
  for (let tries = 0; tries < 8 && next === avoid; tries++) {
    next = indices[Math.floor(Math.random() * indices.length)];
  }
  return next;
}

/** "Location: 1,680" -> "LOC 1,680", "Page: 52" -> "PAGE 52" */
function formatLoc(loc: string): string {
  const [label, value] = loc.split(":").map((s) => s.trim());
  if (!value) return loc.toUpperCase();
  return `${/^loc/i.test(label) ? "LOC" : label.toUpperCase()} ${value}`;
}

/** Highlight every occurrence of the query inside a highlight's text. */
function Marked({ text, query }: { text: string; query: string }) {
  if (!query) return <>{text}</>;
  const parts = text.split(new RegExp(`(${escapeRegExp(query)})`, "ig"));
  return (
    <>
      {parts.map((part, i) =>
        part.toLowerCase() === query.toLowerCase() ? (
          <mark key={i} className="bg-nerv-orange/25 text-nerv-orange">
            {part}
          </mark>
        ) : (
          <span key={i}>{part}</span>
        ),
      )}
    </>
  );
}

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

function Quote({
  item,
  book,
  query,
  showBook,
}: {
  item: HighlightItem;
  book: HighlightBook;
  query: string;
  showBook: boolean;
}) {
  return (
    <li className="border-b border-nerv-mid-gray/20 px-3 py-2.5 last:border-b-0 hover:bg-nerv-cyan/5 transition-colors">
      <p className="font-nerv-mono text-[11px] leading-relaxed text-nerv-cyan">
        <Marked text={item.text} query={query} />
      </p>
      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 font-nerv-mono text-[9px] tracking-[0.12em] text-nerv-mid-gray">
        {showBook && (
          <span className="text-nerv-amber/70 uppercase">{book.title}</span>
        )}
        <span>{formatLoc(item.loc)}</span>
      </p>
    </li>
  );
}

export default function Highlights() {
  const [data, setData] = useState<HighlightsData | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [featured, setFeatured] = useState<number | null>(null);
  const [openBook, setOpenBook] = useState<number | null>(null);

  useEffect(() => {
    let cancelled = false;
    fetch("/highlights.json")
      .then((r) => {
        if (!r.ok) throw new Error("No highlights");
        return r.json();
      })
      .then((json: HighlightsData) => {
        if (cancelled) return;
        setData(json);
        // The first highlight lands with the data, not in a follow-up effect.
        setFeatured(pickFrom(featurableIndices(json.items), null));
      })
      .catch(() => {
        if (!cancelled) setError(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const featurable = useMemo(
    () => (data ? featurableIndices(data.items) : []),
    [data],
  );

  const shuffle = useCallback(() => {
    setFeatured((current) => pickFrom(featurable, current) ?? current);
  }, [featurable]);

  const results = useMemo(() => {
    if (!data) return [];
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return data.items.filter(
      (item) =>
        item.text.toLowerCase().includes(q) ||
        data.books[item.b].title.toLowerCase().includes(q) ||
        data.books[item.b].author.toLowerCase().includes(q),
    );
  }, [data, query]);

  /** Per-book highlight lists, built once so expanding a book is instant. */
  const byBook = useMemo(() => {
    if (!data) return [];
    const groups: HighlightItem[][] = data.books.map(() => []);
    for (const item of data.items) groups[item.b]?.push(item);
    return groups;
  }, [data]);

  if (error) {
    return (
      <p className="border border-nerv-red/40 bg-nerv-black px-3 py-4 font-nerv-mono text-[11px] text-nerv-red">
        HIGHLIGHTS UNAVAILABLE — run `node scripts/build-highlights.mjs`
      </p>
    );
  }

  if (!data) {
    return (
      <p className="border border-nerv-mid-gray bg-nerv-black px-3 py-4 font-nerv-mono text-[11px] tracking-[0.2em] text-nerv-cyan animate-nerv-pulse">
        LOADING HIGHLIGHTS…
      </p>
    );
  }

  const featuredItem = featured !== null ? data.items[featured] : null;
  const searching = query.trim().length > 0;

  return (
    <div className="space-y-2">
      {/* Random highlight */}
      {featuredItem && (
        <section className="border border-nerv-orange/50 bg-nerv-black">
          <div className="flex items-center justify-between gap-2 border-b border-nerv-orange/30 bg-nerv-dark-gray px-2.5 py-1">
            <span className="font-nerv-display text-[10px] tracking-[0.2em] text-nerv-orange">
              RANDOM // {data.items.length.toLocaleString()} HIGHLIGHTS
            </span>
            <button
              type="button"
              onClick={shuffle}
              className="font-nerv-mono text-[10px] tracking-[0.15em] text-nerv-cyan transition-colors hover:text-nerv-orange"
            >
              [ SHUFFLE ]
            </button>
          </div>
          <blockquote className="px-3 py-4 md:px-5 md:py-5">
            <p className="font-nerv-mono text-[13px] leading-relaxed text-nerv-white md:text-sm">
              {featuredItem.text}
            </p>
            <footer className="mt-3 border-t border-nerv-mid-gray/30 pt-2 font-nerv-mono text-[10px] tracking-[0.12em] text-nerv-amber">
              {data.books[featuredItem.b].title}
              {data.books[featuredItem.b].author && (
                <span className="text-nerv-mid-gray">
                  {" "}
                  — {data.books[featuredItem.b].author}
                </span>
              )}
              <span className="text-nerv-mid-gray">
                {" "}
                · {formatLoc(featuredItem.loc)}
              </span>
            </footer>
          </blockquote>
        </section>
      )}

      {/* Search + browser */}
      <div className="border border-nerv-mid-gray bg-nerv-black">
        <div className="flex items-center gap-2 border-b border-nerv-mid-gray bg-nerv-dark-gray px-1.5 py-1 md:px-2.5">
          <span className="shrink-0 font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-cyan">
            &gt;
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH HIGHLIGHTS, TITLE, AUTHOR"
            className="min-w-0 flex-1 bg-transparent font-nerv-mono text-[11px] tracking-wider text-nerv-cyan outline-none placeholder:text-nerv-mid-gray/60"
          />
          {query && (
            <button
              type="button"
              onClick={() => setQuery("")}
              aria-label="Clear search"
              className="shrink-0 font-nerv-mono text-[10px] text-nerv-mid-gray transition-colors hover:text-nerv-orange"
            >
              [X]
            </button>
          )}
        </div>

        <div
          className="overflow-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
          style={{ maxHeight: "calc(100dvh - 200px)" }}
        >
          {searching ? (
            results.length === 0 ? (
              <p className="px-3 py-4 font-nerv-mono text-[11px] text-nerv-mid-gray">
                NO MATCHES
              </p>
            ) : (
              <ul>
                {results.slice(0, MAX_RESULTS).map((item, i) => (
                  <Quote
                    key={i}
                    item={item}
                    book={data.books[item.b]}
                    query={query.trim()}
                    showBook
                  />
                ))}
              </ul>
            )
          ) : (
            <ul>
              {data.books.map((book, b) => {
                const open = openBook === b;
                return (
                  <li
                    key={b}
                    className="border-b border-nerv-mid-gray/20 last:border-b-0"
                  >
                    <button
                      type="button"
                      onClick={() => setOpenBook(open ? null : b)}
                      aria-expanded={open}
                      className="flex w-full items-center gap-2 px-2 py-1.5 text-left transition-colors hover:bg-nerv-cyan/5"
                    >
                      <span
                        className={`shrink-0 font-nerv-mono text-[10px] ${open ? "text-nerv-orange" : "text-nerv-mid-gray"}`}
                      >
                        {open ? "▾" : "▸"}
                      </span>
                      <span
                        className={`min-w-0 flex-1 truncate font-nerv-mono text-[11px] ${open ? "text-nerv-orange" : "text-nerv-cyan"}`}
                      >
                        {book.title}
                      </span>
                      <span className="shrink-0 font-nerv-mono text-[9px] text-nerv-mid-gray">
                        [{byBook[b].length}]
                      </span>
                    </button>
                    {open && (
                      <ul className="border-t border-nerv-mid-gray/20 bg-nerv-panel">
                        {byBook[b].map((item, i) => (
                          <Quote
                            key={i}
                            item={item}
                            book={book}
                            query=""
                            showBook={false}
                          />
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          )}
        </div>

        <div className="flex items-center justify-between border-t border-nerv-mid-gray bg-nerv-dark-gray px-3 py-1 font-mono text-[10px] text-nerv-mid-gray">
          <span>
            {searching
              ? `MATCHES: ${Math.min(results.length, MAX_RESULTS).toLocaleString()}${
                  results.length > MAX_RESULTS
                    ? ` / ${results.length.toLocaleString()}`
                    : ""
                }`
              : `BOOKS: ${data.books.length}`}
          </span>
          <span>
            {searching && results.length > MAX_RESULTS
              ? "REFINE SEARCH"
              : `HIGHLIGHTS: ${data.items.length.toLocaleString()}`}
          </span>
        </div>
      </div>
    </div>
  );
}
