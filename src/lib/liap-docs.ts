export type LiapDoc = {
  slug: string;
  number: string;
  title: string;
  blurb: string;
  icon: string;
};

export const LIAP_DOCS: LiapDoc[] = [
  { slug: "home", number: "00", title: "Home", blurb: "Project status + quick nav", icon: "◆" },
  { slug: "overview", number: "01", title: "Project Overview", blurb: "What it does, tech stack, file map", icon: "▸" },
  { slug: "architecture", number: "02", title: "Architecture", blurb: "System diagram, request flows, WebSocket protocol", icon: "▸" },
  { slug: "features", number: "03", title: "Features", blurb: "Connection, first message, follow-up detail", icon: "▸" },
  { slug: "roadmap", number: "04", title: "Development Roadmap", blurb: "What's built, what's planned", icon: "▸" },
  { slug: "setup", number: "05", title: "Configuration & Setup", blurb: ".env, Chrome profile, Ollama + Gemini", icon: "▸" },
  { slug: "playbook", number: "06", title: "Outreach Playbook", blurb: "Campaign strategy + safety rules", icon: "▸" },
  { slug: "debugging", number: "07", title: "Debugging & Logs", blurb: "Selectors, bugs fixed, known issues", icon: "▸" },
  { slug: "data", number: "08", title: "Data & CSV Schema", blurb: "Schema for connections / messages / followups", icon: "▸" },
];

export const SLUG_BY_WIKILINK: Record<string, string> = {
  "00 - home": "home",
  "01 - project overview": "overview",
  "02 - architecture": "architecture",
  "03 - features": "features",
  "04 - development roadmap": "roadmap",
  "05 - configuration & setup": "setup",
  "06 - outreach playbook": "playbook",
  "07 - debugging & logs": "debugging",
  "08 - data & csv schema": "data",
};

export function getDoc(slug: string): LiapDoc | undefined {
  return LIAP_DOCS.find((d) => d.slug === slug);
}

export function getNeighbors(slug: string): { prev: LiapDoc | null; next: LiapDoc | null } {
  const i = LIAP_DOCS.findIndex((d) => d.slug === slug);
  if (i === -1) return { prev: null, next: null };
  return {
    prev: i > 0 ? LIAP_DOCS[i - 1] : null,
    next: i < LIAP_DOCS.length - 1 ? LIAP_DOCS[i + 1] : null,
  };
}
