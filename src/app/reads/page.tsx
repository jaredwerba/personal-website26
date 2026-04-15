"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import {
  Badge,
  Divider,
} from "@mdrbx/nerv-ui";
import { motion } from "framer-motion";
import { useIsMobile } from "@/hooks/useIsMobile";

interface BookEntry {
  title: string;
  author: string;
  rating: number;
  dateRead: string;
  shelves: string;
}

function parseGoodreadsCSV(text: string): BookEntry[] {
  const lines = text.split("\n");
  if (lines.length < 2) return [];

  const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
  const titleIdx = headers.findIndex((h) => h === "Title");
  const authorIdx = headers.findIndex((h) => h === "Author");
  const ratingIdx = headers.findIndex((h) => h === "My Rating");
  const dateIdx = headers.findIndex((h) => h === "Date Read");
  const shelfIdx = headers.findIndex((h) => h === "Exclusive Shelf");

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
    });
  }
  return books;
}

function RatingBar({ value, max = 5 }: { value: number; max?: number }) {
  const pct = (value / max) * 100;
  return (
    <div className="flex items-center gap-2 w-full">
      <div className="flex-1 h-2 bg-nerv-dark-gray border border-nerv-mid-gray/20 overflow-hidden">
        <div
          className="h-full transition-all"
          style={{
            width: `${pct}%`,
            backgroundColor: value >= 4 ? "#FF9900" : value >= 3 ? "#FFAA00" : value >= 2 ? "#555555" : "#333333",
          }}
        />
      </div>
      <span className="font-nerv-mono text-[10px] text-nerv-mid-gray w-4 text-right shrink-0">
        {value || "—"}
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

type SortKey = "title" | "author" | "rating" | "date";
type SortDir = "asc" | "desc" | null;

export default function ReadsPage() {
  const [books, setBooks] = useState<BookEntry[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [sortKey, setSortKey] = useState<SortKey | null>(null);
  const [sortDir, setSortDir] = useState<SortDir>(null);
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

  const handleSort = useCallback((key: SortKey) => {
    if (sortKey !== key) {
      setSortKey(key);
      setSortDir("asc");
    } else if (sortDir === "asc") {
      setSortDir("desc");
    } else {
      setSortKey(null);
      setSortDir(null);
    }
  }, [sortKey, sortDir]);

  const sortedBooks = useMemo(() => {
    if (!sortKey || !sortDir) return books;
    return [...books].sort((a, b) => {
      let cmp = 0;
      switch (sortKey) {
        case "rating":
          cmp = a.rating - b.rating;
          break;
        case "title":
          cmp = a.title.localeCompare(b.title);
          break;
        case "author":
          cmp = a.author.localeCompare(b.author);
          break;
        case "date":
          cmp = (a.dateRead || "").localeCompare(b.dateRead || "");
          break;
      }
      return sortDir === "desc" ? -cmp : cmp;
    });
  }, [books, sortKey, sortDir]);

  const sortIndicator = (key: SortKey) => {
    if (sortKey !== key) return "—";
    return sortDir === "asc" ? "▲" : "▼";
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-3">
        <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
          READS
        </h2>
        <Badge label={loaded ? `${books.length}` : "—"} variant="info" size="sm" />
      </div>

      {loaded && (
        <div className="bg-nerv-black border border-nerv-mid-gray">
          {/* Title bar */}
          <div className="flex items-center justify-between px-3 py-1 border-b border-nerv-mid-gray bg-nerv-dark-gray">
            <span
              className="text-xs uppercase tracking-[0.2em] font-bold text-nerv-cyan"
              style={{ fontFamily: "var(--font-nerv-display)" }}
            >
              ALL.BOOKS
            </span>
            <span className="text-[10px] font-mono text-nerv-mid-gray">
              {books.length} ENTRIES
            </span>
          </div>

          {/* Sort controls */}
          <div className="flex items-center gap-1 px-2 py-1 border-b border-nerv-mid-gray/30 bg-nerv-cyan/5 overflow-x-auto">
            <span className="text-[9px] font-nerv-mono text-nerv-mid-gray shrink-0 mr-1">SORT:</span>
            {([
              { key: "title" as SortKey, label: "TITLE" },
              { key: "author" as SortKey, label: "AUTHOR" },
              { key: "rating" as SortKey, label: "RATING" },
              { key: "date" as SortKey, label: "DATE" },
            ]).map((col) => (
              <button
                key={col.key}
                onClick={() => handleSort(col.key)}
                className={`px-2 py-1 text-[9px] uppercase tracking-wider font-bold cursor-pointer select-none shrink-0 border transition-colors ${
                  sortKey === col.key
                    ? "text-nerv-cyan border-nerv-cyan/50 bg-nerv-cyan/10"
                    : "text-nerv-mid-gray border-nerv-mid-gray/20 hover:text-nerv-cyan"
                }`}
                style={{ fontFamily: "var(--font-nerv-display)" }}
              >
                {col.label}
                {sortKey === col.key && (
                  <span className="ml-1 text-[8px]">{sortDir === "asc" ? "▲" : "▼"}</span>
                )}
              </button>
            ))}
          </div>

          {/* Scrollable content */}
          <div className="overflow-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]" style={{ maxHeight: "calc(100dvh - 160px)" }}>
            {isMobile ? (
              /* Mobile: stacked list */
              <div style={{ fontFamily: "var(--font-nerv-mono)" }}>
                {sortedBooks.map((book, i) => (
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
                        <div className="text-xs text-nerv-cyan truncate">{book.title}</div>
                        <div className="text-[10px] text-nerv-mid-gray truncate">{book.author}</div>
                        <div className="flex items-center gap-3 mt-0.5">
                          <div className="w-20">
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
              /* Desktop: full table */
              <table className="w-full border-collapse table-fixed" style={{ fontFamily: "var(--font-nerv-mono)" }}>
                <colgroup>
                  <col style={{ width: "36px" }} />
                  <col style={{ width: "38%" }} />
                  <col style={{ width: "24%" }} />
                  <col style={{ width: "20%" }} />
                  <col style={{ width: "18%" }} />
                </colgroup>
                <thead className="sticky top-0 z-10">
                  <tr className="bg-nerv-black text-nerv-cyan border-b border-nerv-cyan/30">
                    <th className="px-2 py-2 text-[10px] uppercase tracking-wider font-bold text-left border-r border-black/20">
                      #
                    </th>
                    {([
                      { key: "title" as SortKey, label: "TITLE" },
                      { key: "author" as SortKey, label: "AUTHOR" },
                      { key: "rating" as SortKey, label: "RATING" },
                      { key: "date" as SortKey, label: "DATE" },
                    ]).map((col) => (
                      <th
                        key={col.key}
                        onClick={() => handleSort(col.key)}
                        className="px-2 py-2 text-[10px] uppercase tracking-wider font-bold border-r border-black/20 last:border-r-0 cursor-pointer select-none text-left"
                        style={{ fontFamily: "var(--font-nerv-display)" }}
                      >
                        {col.label}
                        <span className="ml-1.5 text-[8px] opacity-80">{sortIndicator(col.key)}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {sortedBooks.map((book, i) => (
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
                        {book.title}
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
            <span>ROWS: {books.length}</span>
          </div>
        </div>
      )}
    </div>
  );
}
