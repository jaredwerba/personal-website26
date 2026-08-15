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
import {
  THEMES,
  VOCAB,
  VOCAB_THEME,
  VOCAB_MAX_WORDS,
  VOCAB_MAX_CHARS,
  BOOK_THEMES,
  BOOK_PRIOR,
  BOOK_PRIOR_SECONDARY,
  STRONG,
  WEAK,
} from "./highlight-themes.mjs";

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

/** Word-boundary matcher, so "art" does not fire inside "start". */
function compile(terms) {
  return terms.map((t) => new RegExp(`\\b(?:${t})\\b`, "i"));
}

const COMPILED = THEMES.map((theme) => ({
  id: theme.id,
  strong: compile(theme.strong),
  weak: compile(theme.weak),
}));

/** Themes a book lends its highlights, looked up by title fragment. */
function themesForBook(title) {
  const t = title.toLowerCase();
  for (const [fragment, themes] of Object.entries(BOOK_THEMES)) {
    if (t.includes(fragment)) return themes;
  }
  return [];
}

function isVocab(text) {
  return (
    text.length <= VOCAB_MAX_CHARS &&
    text.trim().split(/\s+/).length <= VOCAB_MAX_WORDS
  );
}

/**
 * Score every theme for one highlight and return [primary, ...alsoIn].
 * Presence counts, not frequency — one word repeated should not win a theme.
 */
function classify(text, bookThemes) {
  if (isVocab(text)) return [VOCAB_THEME];

  const scores = new Map();
  const add = (id, n) => scores.set(id, (scores.get(id) ?? 0) + n);

  for (const theme of COMPILED) {
    let score = 0;
    for (const re of theme.strong) if (re.test(text)) score += STRONG;
    for (const re of theme.weak) if (re.test(text)) score += WEAK;
    if (score > 0) add(theme.id, score);
  }

  // The book leans the result but loses to a highlight that clearly says otherwise.
  const keywordOnly = new Map(scores);
  if (bookThemes[0]) add(bookThemes[0], BOOK_PRIOR);
  if (bookThemes[1]) add(bookThemes[1], BOOK_PRIOR_SECONDARY);

  const ranked = [...scores.entries()].sort((a, b) => b[1] - a[1]);
  if (ranked.length === 0) return bookThemes.length ? [bookThemes[0]] : [];

  const primary = ranked[0][0];
  // Cross-list a theme only when the highlight's own words earn it outright.
  const alsoIn = [...keywordOnly.entries()]
    .filter(([id, score]) => id !== primary && score >= STRONG + WEAK)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([id]) => id);

  return [primary, ...alsoIn];
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

// Flat items keyed by book index: cheap to search, filter, and pick at random.
const items = [];
const unpriored = new Set();

books.forEach((book, b) => {
  const bookThemes = themesForBook(book.title);
  if (bookThemes.length === 0) unpriored.add(book.title);
  for (const h of book.highlights) {
    const [primary, ...alsoIn] = classify(h.text, bookThemes);
    items.push({ b, text: h.text, loc: h.loc, t: primary, also: alsoIn });
  }
});

if (unpriored.size > 0) {
  console.warn(`\n${unpriored.size} books have no theme in BOOK_THEMES:`);
  for (const title of unpriored) console.warn(`  ${title}`);
}

const themeList = [...THEMES.map(({ id, label, blurb }) => ({ id, label, blurb })), VOCAB];

// Every theme, primary and cross-listed, for the counts shown on the cards.
const counts = {};
for (const item of items) {
  for (const id of [item.t, ...item.also]) {
    if (id) counts[id] = (counts[id] ?? 0) + 1;
  }
}

writeFileSync(
  OUT,
  JSON.stringify({
    books: books.map(({ title, author }) => ({ title, author })),
    themes: themeList.map((t) => ({ ...t, count: counts[t.id] ?? 0 })),
    items,
  }) + "\n",
);

console.log("\ntheme distribution (primary + cross-listed):");
for (const theme of themeList) {
  const primary = items.filter((i) => i.t === theme.id).length;
  console.log(
    `  ${String(primary).padStart(4)} primary  ${String(counts[theme.id] ?? 0).padStart(4)} total  ${theme.label}`,
  );
}

const kb = Math.round(Buffer.byteLength(readFileSync(OUT)) / 1024);
console.log(`\nwrote ${OUT} — ${books.length} books, ${items.length} highlights, ${kb} KB`);
