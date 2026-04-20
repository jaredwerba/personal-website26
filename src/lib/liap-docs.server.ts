import "server-only";
import { readFile } from "fs/promises";
import path from "path";
import { getDoc, SLUG_BY_WIKILINK } from "./liap-docs";

export async function loadDocMarkdown(slug: string): Promise<string> {
  const doc = getDoc(slug);
  if (!doc) throw new Error(`Unknown LIAP doc slug: ${slug}`);
  const filename = `${doc.number}-${doc.slug}.md`;
  const filepath = path.join(process.cwd(), "src", "content", "liap", filename);
  const raw = await readFile(filepath, "utf-8");
  return preprocess(raw);
}

function preprocess(md: string): string {
  let out = stripFrontmatter(md);
  out = transformWikilinks(out);
  out = transformCallouts(out);
  return out;
}

function stripFrontmatter(md: string): string {
  if (!md.startsWith("---")) return md;
  const end = md.indexOf("\n---", 3);
  if (end === -1) return md;
  return md.slice(end + 4).replace(/^\n+/, "");
}

function transformWikilinks(md: string): string {
  return md.replace(/\[\[([^\]]+)\]\]/g, (_match, inner: string) => {
    const key = inner.toLowerCase().trim();
    const slug = SLUG_BY_WIKILINK[key];
    if (slug) {
      const label = inner.replace(/^\d+\s*-\s*/, "");
      return `[${label}](/software/liap/${slug})`;
    }
    return inner;
  });
}

const CALLOUT_LABELS: Record<string, string> = {
  note: "NOTE",
  tip: "TIP",
  important: "IMPORTANT",
  warning: "WARNING",
  caution: "CAUTION",
  danger: "DANGER",
  info: "INFO",
};

function transformCallouts(md: string): string {
  return md.replace(
    /^> \[!(\w+)\]([^\n]*)/gim,
    (_m, type: string, title: string) => {
      const label = CALLOUT_LABELS[type.toLowerCase()] ?? type.toUpperCase();
      const suffix = title.trim() ? ` — ${title.trim()}` : "";
      return `> **${label}${suffix}**`;
    },
  );
}
