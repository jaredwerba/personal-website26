"use client";

import { useState, useEffect, useMemo, useCallback } from "react";

interface HighlightBook {
  title: string;
  author: string;
}

interface Theme {
  id: string;
  label: string;
  blurb: string;
  count: number;
}

interface HighlightItem {
  /** Index into `books`. */
  b: number;
  text: string;
  loc: string;
  /** Primary theme id. */
  t: string;
  /** Themes this highlight also earned on its own wording. */
  also: string[];
}

interface HighlightsData {
  books: HighlightBook[];
  themes: Theme[];
  items: HighlightItem[];
}

/** Search results are capped — 2,800 rows at once is a scroll no one finishes. */
const MAX_RESULTS = 200;

/** The shuffle card skips one-word lookups, which read as noise on their own. */
const MIN_FEATURE_LENGTH = 80;

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

function escapeRegExp(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
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

function Quote({
  item,
  book,
  query,
}: {
  item: HighlightItem;
  book: HighlightBook;
  query: string;
}) {
  return (
    <li className="border-b border-nerv-mid-gray/20 px-3 py-2.5 last:border-b-0 hover:bg-nerv-cyan/5 transition-colors">
      <p className="font-nerv-mono text-[11px] leading-relaxed text-nerv-cyan">
        <Marked text={item.text} query={query} />
      </p>
      <p className="mt-1.5 flex flex-wrap items-center gap-x-2 font-nerv-mono text-[9px] tracking-[0.12em] text-nerv-mid-gray">
        <span className="text-nerv-amber/70 uppercase">{book.title}</span>
        <span>{formatLoc(item.loc)}</span>
      </p>
    </li>
  );
}

function ScrollBox({ children }: { children: React.ReactNode }) {
  return (
    <div
      className="overflow-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
      style={{ maxHeight: "calc(100dvh - 210px)" }}
    >
      {children}
    </div>
  );
}

export default function Highlights() {
  const [data, setData] = useState<HighlightsData | null>(null);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState("");
  const [featured, setFeatured] = useState<number | null>(null);
  /** null = the theme grid; otherwise the open theme's id. */
  const [openTheme, setOpenTheme] = useState<string | null>(null);

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

  /** Highlights of the open theme, primary matches first, then cross-listed. */
  const themeItems = useMemo(() => {
    if (!data || !openTheme) return [];
    return [
      ...data.items.filter((i) => i.t === openTheme),
      ...data.items.filter((i) => i.t !== openTheme && i.also.includes(openTheme)),
    ];
  }, [data, openTheme]);

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
  const theme = data.themes.find((t) => t.id === openTheme) ?? null;

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

      <div className="border border-nerv-mid-gray bg-nerv-black">
        {/* Search */}
        <div className="flex items-center gap-2 border-b border-nerv-mid-gray bg-nerv-dark-gray px-1.5 py-1 md:px-2.5">
          <span className="shrink-0 font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-cyan">
            &gt;
          </span>
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="SEARCH ALL HIGHLIGHTS"
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

        {/* Open theme header, so there is always a way back to the grid */}
        {!searching && theme && (
          <div className="flex items-center gap-2 border-b border-nerv-mid-gray bg-nerv-dark-gray px-2 py-1.5">
            <button
              type="button"
              onClick={() => setOpenTheme(null)}
              className="shrink-0 font-nerv-mono text-[10px] tracking-[0.15em] text-nerv-cyan transition-colors hover:text-nerv-orange"
            >
              [ ← ALL ]
            </button>
            <span className="min-w-0 flex-1 truncate font-nerv-display text-[11px] tracking-[0.18em] text-nerv-orange">
              {theme.label.toUpperCase()}
            </span>
            <span className="shrink-0 font-nerv-mono text-[9px] text-nerv-mid-gray">
              {themeItems.length}
            </span>
          </div>
        )}

        {searching ? (
          <ScrollBox>
            {results.length === 0 ? (
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
                  />
                ))}
              </ul>
            )}
          </ScrollBox>
        ) : theme ? (
          <ScrollBox>
            <ul>
              {themeItems.map((item, i) => (
                <Quote key={i} item={item} book={data.books[item.b]} query="" />
              ))}
            </ul>
          </ScrollBox>
        ) : (
          /* Theme grid — the landing view */
          <ScrollBox>
            <div className="grid grid-cols-1 gap-px bg-nerv-mid-gray/20 sm:grid-cols-2">
              {data.themes.map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setOpenTheme(t.id)}
                  className="group bg-nerv-black px-3 py-3 text-left transition-colors hover:bg-nerv-cyan/5"
                >
                  <span className="flex items-baseline justify-between gap-2">
                    <span className="font-nerv-display text-[12px] tracking-[0.14em] text-nerv-cyan transition-colors group-hover:text-nerv-orange">
                      {t.label.toUpperCase()}
                    </span>
                    <span className="shrink-0 font-nerv-mono text-[10px] text-nerv-amber">
                      {t.count}
                    </span>
                  </span>
                  <span className="mt-1 block font-nerv-mono text-[10px] leading-relaxed text-nerv-mid-gray">
                    {t.blurb}
                  </span>
                </button>
              ))}
            </div>
          </ScrollBox>
        )}

        <div className="flex items-center justify-between border-t border-nerv-mid-gray bg-nerv-dark-gray px-3 py-1 font-mono text-[10px] text-nerv-mid-gray">
          <span>
            {searching
              ? `MATCHES: ${Math.min(results.length, MAX_RESULTS).toLocaleString()}${
                  results.length > MAX_RESULTS
                    ? ` / ${results.length.toLocaleString()}`
                    : ""
                }`
              : theme
                ? `${data.books.length} BOOKS`
                : `THEMES: ${data.themes.length}`}
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
