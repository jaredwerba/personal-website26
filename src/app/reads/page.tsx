"use client";

import { useState, useEffect, useMemo } from "react";
import { Badge } from "@mdrbx/nerv-ui";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";

interface BookEntry {
  title: string;
  author: string;
  rating: number;
  dateRead: string;
  shelves: string;
  isbn13?: string;
  isbn?: string;
}

function stripExcelQuotes(s: string): string {
  return s.replace(/^=/, "").replace(/"/g, "").trim();
}

function amazonUrl(book: BookEntry): string {
  const id = (book.isbn13 && book.isbn13.length >= 10)
    ? book.isbn13
    : (book.isbn && book.isbn.length >= 10)
      ? book.isbn
      : "";
  if (id) return `https://www.amazon.com/dp/${id}`;
  const q = encodeURIComponent(`${book.title} ${book.author}`);
  return `https://www.amazon.com/s?k=${q}&i=stripbooks`;
}

type SortKey = "title" | "author" | "rating" | "dateRead";
type SortDir = "asc" | "desc";

function parseGoodreadsCSV(text: string): BookEntry[] {
  const lines = text.split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
  const titleIdx = headers.findIndex((h) => h === "Title");
  const authorIdx = headers.findIndex((h) => h === "Author");
  const ratingIdx = headers.findIndex((h) => h === "My Rating");
  const dateIdx = headers.findIndex((h) => h === "Date Read");
  const shelfIdx = headers.findIndex((h) => h === "Exclusive Shelf");
  const isbnIdx = headers.findIndex((h) => h === "ISBN");
  const isbn13Idx = headers.findIndex((h) => h === "ISBN13");

  const books: BookEntry[] = [];
  for (let i = 1; i < lines.length; i++) {
    const line = lines[i];
    if (!line.trim()) continue;

    const fields: string[] = [];
    let current = "";
    let inQuotes = false;
    for (const char of line) {
      if (char === '"') {
        inQuotes = !inQuotes;
      } else if (char === "," && !inQuotes) {
        fields.push(current.trim());
        current = "";
      } else {
        current += char;
      }
    }
    fields.push(current.trim());

    books.push({
      title: fields[titleIdx] || "Unknown",
      author: fields[authorIdx] || "Unknown",
      rating: Number(fields[ratingIdx]) || 0,
      dateRead: fields[dateIdx] || "",
      shelves: fields[shelfIdx] || "to-read",
      isbn: isbnIdx >= 0 ? stripExcelQuotes(fields[isbnIdx] || "") : "",
      isbn13: isbn13Idx >= 0 ? stripExcelQuotes(fields[isbn13Idx] || "") : "",
    });
  }
  return books;
}

function RatingBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  const isMax = value === max;
  return (
    <div className="flex items-center gap-2 w-full">
      <div
        className={`flex-1 h-2 bg-nerv-dark-gray overflow-hidden border ${isMax ? "border-nerv-orange shadow-[0_0_6px_rgba(255,153,0,0.6)]" : "border-nerv-mid-gray/20"}`}
      >
        <div
          className="h-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: isMax
              ? "#FFD700"
              : value >= 4
                ? "#FF9900"
                : value >= 3
                  ? "#FFAA00"
                  : value >= 2
                    ? "#555555"
                    : "#333333",
          }}
        />
      </div>
      <span
        className={`font-nerv-mono text-[10px] w-6 text-right shrink-0 tracking-tight ${isMax ? "text-nerv-orange font-bold" : "text-nerv-mid-gray"}`}
      >
        {isMax ? "5★" : value || "—"}
      </span>
    </div>
  );
}

function formatDate(dateStr: string): string {
  if (!dateStr) return "—";
  const d = new Date(dateStr);
  if (isNaN(d.getTime())) return "—";
  return d.toLocaleDateString("en-US", { year: "numeric", month: "short" });
}

function compareBy(a: BookEntry, b: BookEntry, key: SortKey, dir: SortDir): number {
  const mult = dir === "asc" ? 1 : -1;
  switch (key) {
    case "rating":
      return (a.rating - b.rating) * mult;
    case "dateRead": {
      const at = a.dateRead ? new Date(a.dateRead).getTime() : 0;
      const bt = b.dateRead ? new Date(b.dateRead).getTime() : 0;
      const av = isNaN(at) ? 0 : at;
      const bv = isNaN(bt) ? 0 : bt;
      return (av - bv) * mult;
    }
    case "title":
    case "author":
      return a[key].localeCompare(b[key]) * mult;
  }
}

const SORT_LABELS: Record<SortKey, string> = {
  title: "TITLE",
  author: "AUTHOR",
  rating: "RATING",
  dateRead: "DATE",
};

const SORT_KEYS: SortKey[] = ["title", "author", "rating", "dateRead"];

function SortIndicator({ active, dir }: { active: boolean; dir: SortDir }) {
  if (!active) return <span className="text-nerv-mid-gray/40 ml-1">↕</span>;
  return <span className="text-nerv-orange ml-1">{dir === "asc" ? "↑" : "↓"}</span>;
}

export default function ReadsPage() {
  const [books, setBooks] = useState<BookEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [query, setQuery] = useState("");
  const [sortKey, setSortKey] = useState<SortKey>("dateRead");
  const [sortDir, setSortDir] = useState<SortDir>("desc");
  const isMobile = useIsMobile();

  useEffect(() => {
    fetch("/goodreads.csv")
      .then((r) => {
        if (!r.ok) throw new Error("No CSV");
        return r.text();
      })
      .then((text) => {
        const parsed = parseGoodreadsCSV(text);
        if (parsed.length > 0) {
          setBooks(parsed);
          setLoaded(true);
        }
      })
      .catch(() => {});
  }, []);

  const displayed = useMemo(() => {
    const q = query.trim().toLowerCase();
    const filtered = q
      ? books.filter(
          (b) =>
            b.title.toLowerCase().includes(q) ||
            b.author.toLowerCase().includes(q) ||
            b.shelves.toLowerCase().includes(q),
        )
      : books;
    return [...filtered].sort((a, b) => compareBy(a, b, sortKey, sortDir));
  }, [books, query, sortKey, sortDir]);

  function handleSort(key: SortKey) {
    if (key === sortKey) {
      setSortDir(sortDir === "asc" ? "desc" : "asc");
    } else {
      setSortKey(key);
      setSortDir(key === "dateRead" || key === "rating" ? "desc" : "asc");
    }
  }

  function cycleMobileSort() {
    const idx = SORT_KEYS.indexOf(sortKey);
    const next = SORT_KEYS[(idx + 1) % SORT_KEYS.length];
    setSortKey(next);
    setSortDir(next === "dateRead" || next === "rating" ? "desc" : "asc");
  }

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
          READS
        </h2>
        <Badge
          label={loaded ? `${displayed.length}/${books.length}` : "—"}
          variant="info"
          size="sm"
        />
      </div>

      {loaded && (
        <div className="bg-nerv-black border border-nerv-mid-gray">
          {/* Controls bar */}
          <div className="flex items-center gap-2 px-2 py-1.5 border-b border-nerv-mid-gray bg-nerv-dark-gray">
            <span className="font-nerv-mono text-[10px] text-nerv-cyan tracking-[0.2em] shrink-0">
              &gt;
            </span>
            <input
              type="search"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="SEARCH TITLE, AUTHOR, SHELF"
              className="flex-1 min-w-0 bg-transparent font-nerv-mono text-[11px] text-nerv-cyan placeholder:text-nerv-mid-gray/60 tracking-wider outline-none"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                aria-label="Clear search"
                className="font-nerv-mono text-[10px] text-nerv-mid-gray hover:text-nerv-orange transition-colors shrink-0"
              >
                [X]
              </button>
            )}
            {isMobile && (
              <button
                type="button"
                onClick={cycleMobileSort}
                className="font-nerv-mono text-[10px] text-nerv-orange border border-nerv-orange/40 px-2 py-0.5 tracking-wider shrink-0"
              >
                {SORT_LABELS[sortKey]} {sortDir === "asc" ? "↑" : "↓"}
              </button>
            )}
          </div>

          {/* Scrollable content */}
          <div
            className="overflow-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]"
            style={{ maxHeight: "calc(100dvh - 200px)" }}
          >
            {isMobile ? (
              <div style={{ fontFamily: "var(--font-nerv-mono)" }}>
                {displayed.map((book, i) => (
                  <motion.div
                    key={`${i}-${book.title}`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: Math.min(i * 0.005, 1) }}
                    className="px-3 py-1.5 border-b border-nerv-mid-gray/30 hover:bg-nerv-cyan/5 transition-colors"
                  >
                    <div className="flex items-start gap-2">
                      <span className="text-[10px] text-nerv-mid-gray shrink-0 pt-0.5 w-7">
                        {String(i + 1).padStart(3, "0")}
                      </span>
                      <div className="flex-1 min-w-0">
                        <a
                          href={amazonUrl(book)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block text-xs text-nerv-cyan truncate hover:text-nerv-orange underline underline-offset-2 decoration-dotted decoration-nerv-cyan/40 hover:decoration-nerv-orange transition-colors"
                        >
                          {book.title}
                        </a>
                        <div className="text-[10px] text-nerv-mid-gray truncate">{book.author}</div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <div className="w-36">
                            <RatingBar value={book.rating} />
                          </div>
                          <span className="text-[9px] text-nerv-mid-gray/60">
                            {formatDate(book.dateRead)}
                          </span>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>
            ) : (
              <table
                className="w-full border-collapse table-fixed"
                style={{ fontFamily: "var(--font-nerv-mono)" }}
              >
                <colgroup>
                  <col style={{ width: "36px" }} />
                  <col style={{ width: "34%" }} />
                  <col style={{ width: "22%" }} />
                  <col style={{ width: "28%" }} />
                  <col style={{ width: "16%" }} />
                </colgroup>
                <thead className="sticky top-0 z-10">
                  <tr className="bg-nerv-black text-nerv-cyan border-b border-nerv-cyan/30">
                    <th className="px-2 py-2 text-[10px] uppercase tracking-wider font-bold text-left border-r border-black/20">
                      #
                    </th>
                    {SORT_KEYS.map((key) => {
                      const active = sortKey === key;
                      return (
                        <th
                          key={key}
                          className="px-2 py-2 text-[10px] uppercase tracking-wider font-bold border-r border-black/20 last:border-r-0 text-left"
                          style={{ fontFamily: "var(--font-nerv-display)" }}
                        >
                          <button
                            type="button"
                            onClick={() => handleSort(key)}
                            className={`inline-flex items-center uppercase tracking-wider transition-colors hover:text-nerv-orange ${
                              active ? "text-nerv-orange" : "text-nerv-cyan"
                            }`}
                          >
                            {SORT_LABELS[key]}
                            <SortIndicator active={active} dir={sortDir} />
                          </button>
                        </th>
                      );
                    })}
                  </tr>
                </thead>
                <tbody>
                  {displayed.map((book, i) => (
                    <motion.tr
                      key={`${i}-${book.title}`}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: Math.min(i * 0.005, 1) }}
                      className="text-nerv-cyan hover:bg-nerv-cyan/5 border-b border-nerv-mid-gray/30 transition-colors duration-75 cursor-default text-xs"
                    >
                      <td className="px-2 py-1 text-nerv-mid-gray border-r border-nerv-mid-gray/20">
                        {String(i + 1).padStart(3, "0")}
                      </td>
                      <td className="px-2 py-1 border-r border-nerv-mid-gray/20 truncate">
                        <a
                          href={amazonUrl(book)}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="block truncate text-nerv-cyan hover:text-nerv-orange underline underline-offset-2 decoration-dotted decoration-nerv-cyan/40 hover:decoration-nerv-orange transition-colors"
                        >
                          {book.title}
                        </a>
                      </td>
                      <td className="px-2 py-1 border-r border-nerv-mid-gray/20 truncate">
                        {book.author}
                      </td>
                      <td className="px-2 py-1 border-r border-nerv-mid-gray/20">
                        <RatingBar value={book.rating} />
                      </td>
                      <td className="px-2 py-1 text-nerv-mid-gray truncate">
                        {formatDate(book.dateRead)}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            )}
          </div>

          {/* Footer */}
          <div className="flex items-center justify-between px-3 py-1 border-t border-nerv-mid-gray bg-nerv-dark-gray text-[10px] font-mono text-nerv-mid-gray">
            <span>
              ROWS: {displayed.length}
              {query && ` / ${books.length}`}
            </span>
            <span>
              SORT: {SORT_LABELS[sortKey]} {sortDir === "asc" ? "↑" : "↓"}
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
