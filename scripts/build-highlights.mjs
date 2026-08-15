/**
 * Merge the Kindle highlight exports into public/highlights.json.
 *
 * Build-time on purpose, same as scripts/fetch-tweets.mjs. The exports live
 * outside the repo and each one is a full dump, so later exports repeat what
 * earlier ones held. This merges every export it finds and drops duplicates,
 * which keeps highlights that Amazon stopped returning in newer exports.
 *
 *   node scripts/build-highlights.mjs
 *   node scripts/build-highlights.mjs ~/some/other/folder
 *
 * Re-run it after exporting new highlights, then commit the JSON — the Vercel
 * build has no access to the source folder.
 */
import { readFileSync, writeFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { homedir } from "node:os";

const SRC_DIR = process.argv[2] || join(homedir(), "kindlehighlights");
const OUT = "public/highlights.json";

/** "Title by Author" — split on the last " by ", so titles may contain it. */
function splitTitleAuthor(heading) {
  const i = heading.lastIndexOf(" by ");
  if (i === -1) return { title: heading.trim(), author: "" };
  return {
    title: heading.slice(0, i).trim(),
    author: heading.slice(i + 4).trim(),
  };
}

/** Collapse whitespace and quoting so the same highlight matches across exports. */
const dedupeKey = (s) => s.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

/** Strip the wrapping quotes the export adds around every highlight. */
function unwrap(text) {
  const t = text.trim();
  return t.length > 1 && t.startsWith('"') && t.endsWith('"')
    ? t.slice(1, -1).trim()
    : t;
}

function parse(markdown) {
  const books = [];
  let book = null;
  let quote = null;

  for (const line of markdown.split("\n")) {
    const heading = line.match(/^##\s+(.+?)\s*$/);
    if (heading) {
      book = { ...splitTitleAuthor(heading[1]), highlights: [] };
      books.push(book);
      quote = null;
      continue;
    }
    if (!book) continue;

    const quoted = line.match(/^>\s?(.*)$/);
    if (quoted) {
      // Wrapped highlights continue on further "> " lines.
      quote = quote === null ? quoted[1] : `${quote} ${quoted[1]}`.trim();
      continue;
    }

    // "— Yellow highlight | Page: 52" closes the highlight above it.
    const meta = line.match(/^—\s*(.+?)\s*\|\s*(.+?)\s*$/);
    if (meta && quote !== null) {
      const text = unwrap(quote);
      if (text) book.highlights.push({ text, loc: meta[2], kind: meta[1] });
      quote = null;
    }
  }
  return books;
}

const files = readdirSync(SRC_DIR)
  .filter((f) => f.endsWith(".md"))
  // Oldest export first, so the newest export's wording wins a tie.
  .sort();

if (files.length === 0) {
  console.error(`no .md exports found in ${SRC_DIR}`);
  process.exit(1);
}

/** title -> merged book, so the same book across exports lands in one entry. */
const merged = new Map();

for (const file of files) {
  const books = parse(readFileSync(join(SRC_DIR, file), "utf8"));
  let added = 0;
  for (const book of books) {
    const key = dedupeKey(book.title);
    let entry = merged.get(key);
    if (!entry) {
      entry = { title: book.title, author: book.author, highlights: [], seen: new Set() };
      merged.set(key, entry);
    }
    if (!entry.author && book.author) entry.author = book.author;
    for (const h of book.highlights) {
      const k = dedupeKey(h.text);
      if (!k || entry.seen.has(k)) continue;
      entry.seen.add(k);
      entry.highlights.push(h);
      added += 1;
    }
  }
  console.log(`${file}: ${books.length} books, ${added} new highlights`);
}

const books = [...merged.values()]
  .filter((b) => b.highlights.length > 0)
  .sort((a, b) => a.title.localeCompare(b.title))
  .map((b) => ({ title: b.title, author: b.author, highlights: b.highlights }));

// Flat items keyed by book index: cheap to search and to pick at random.
const items = [];
books.forEach((book, b) => {
  for (const h of book.highlights) items.push({ b, text: h.text, loc: h.loc });
});

writeFileSync(
  OUT,
  JSON.stringify({
    books: books.map(({ title, author }) => ({ title, author })),
    items,
  }) + "\n",
);

const kb = Math.round(Buffer.byteLength(readFileSync(OUT)) / 1024);
console.log(`wrote ${OUT} — ${books.length} books, ${items.length} highlights, ${kb} KB`);
