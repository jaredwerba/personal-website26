/**
 * Fetch the real text, author and timestamp for every post in the ledger and
 * bake them into src/lib/tweet-data.json.
 *
 * Build-time on purpose. Baking the data means the page never calls X at load,
 * so the modal cannot go blank if X rate-limits, blocks, or changes the
 * endpoint — and no reader's browser talks to X unless they click through.
 *
 *   node scripts/fetch-tweets.mjs
 *
 * Re-run it after adding posts. Entries that fail are simply left out; the
 * modal falls back to the ledger's own title and date.
 */
import { readFileSync, writeFileSync } from "node:fs";

const SRC = "src/lib/nebius-projects.ts";
const OUT = "src/lib/tweet-data.json";

/** The syndication endpoint derives its token from the id. */
const tokenFor = (id) =>
  ((Number(id) / 1e15) * Math.PI).toString(6 ** 2).replace(/(0+|\.)/g, "");

const ids = [
  ...new Set(
    Array.from(
      readFileSync(SRC, "utf8").matchAll(/x\.com\/[^/"]+\/status\/(\d+)/g),
      (m) => m[1],
    ),
  ),
];

console.log(`found ${ids.length} unique post ids`);

const out = {};
let ok = 0;
let failed = 0;

for (const [i, id] of ids.entries()) {
  const url =
    `https://cdn.syndication.twimg.com/tweet-result` +
    `?id=${id}&lang=en&token=${tokenFor(id)}`;
  try {
    const res = await fetch(url, {
      headers: { "user-agent": "Mozilla/5.0", accept: "application/json" },
    });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const d = await res.json();
    if (!d?.created_at) throw new Error("no created_at");
    out[id] = {
      createdAt: d.created_at,
      text: d.text ?? "",
      name: d.user?.name ?? "",
      screenName: d.user?.screen_name ?? "",
    };
    ok += 1;
  } catch (err) {
    failed += 1;
    console.warn(`  ${id}: ${err.message}`);
  }
  if ((i + 1) % 25 === 0) console.log(`  ${i + 1}/${ids.length}`);
  // Be a polite client.
  await new Promise((r) => setTimeout(r, 120));
}

writeFileSync(OUT, JSON.stringify(out, null, 2) + "\n");
console.log(`wrote ${OUT} — ${ok} fetched, ${failed} missing`);
