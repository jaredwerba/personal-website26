"use client";

import { useEffect } from "react";

/**
 * Progressive enhancement for the resume. Two jobs, both of which the page
 * reads fine without: highlight the current section in the contents, and
 * filter the ledger. Retired section ids are handled in the markup instead,
 * as real anchors — see .rs-anchor.
 *
 * Registered from a client component that renders null, so the page itself
 * stays a server component and keeps its robots: noindex metadata.
 */
export default function ResumeRuntime() {
  useEffect(() => {
    const root = document.querySelector<HTMLElement>("[data-resume]");
    if (!root) return;

    /* ── Contents: highlight the section being read ─────────────────────── */
    const links = new Map<string, HTMLElement>();
    root.querySelectorAll<HTMLElement>("[data-toc]").forEach((a) => {
      const id = a.getAttribute("data-toc");
      if (id) links.set(id, a);
    });

    const setCurrent = (id: string) => {
      links.forEach((a, key) => a.setAttribute("aria-current", key === id ? "true" : "false"));
    };

    const sections = Array.from(root.querySelectorAll<HTMLElement>("[data-section]"));

    // A scroll listener rather than an IntersectionObserver. The scroller here
    // is the resume layer itself, not the window, and "which heading did I last
    // pass" is a position question, not a visibility one — an observer answers
    // it only indirectly, through rootMargin percentages that have to be
    // retuned whenever the viewport changes shape.
    const READ_LINE = 96; // just under the sticky bar
    let queued = false;

    const update = () => {
      queued = false;
      const top = root.getBoundingClientRect().top + READ_LINE;
      let current = sections[0]?.id ?? "";
      for (const s of sections) {
        if (s.getBoundingClientRect().top <= top) current = s.id;
        else break;
      }
      // At the very bottom the last section may never reach the read line.
      if (root.scrollTop + root.clientHeight >= root.scrollHeight - 4) {
        current = sections[sections.length - 1]?.id ?? current;
      }
      setCurrent(current);
    };

    const onScroll = () => {
      if (queued) return;
      queued = true;
      // setTimeout rather than rAF: this only has to beat the eye, and it keeps
      // working in backgrounded tabs where frame callbacks are suspended.
      window.setTimeout(update, 60);
    };

    root.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll, { passive: true });
    update();

    /* ── Ledger filter ─────────────────────────────────────────────────── */
    const onClick = (event: MouseEvent) => {
      const f = (event.target as HTMLElement).closest<HTMLElement>("[data-filter]");
      if (!f) return;
      const mode = f.getAttribute("data-filter");
      const relOnly = mode === "rel";

      root.querySelectorAll<HTMLElement>("[data-filter]").forEach((b) => {
        b.setAttribute("aria-pressed", b === f ? "true" : "false");
      });
      root.querySelectorAll<HTMLElement>("tr[data-rel]").forEach((tr) => {
        tr.hidden = relOnly && tr.getAttribute("data-rel") !== "1";
      });
      // A theme whose rows are all filtered out should not keep its heading.
      root.querySelectorAll<HTMLElement>("[data-theme-head]").forEach((head) => {
        const theme = head.getAttribute("data-theme-head");
        const rows = Array.from(root.querySelectorAll<HTMLElement>("tr[data-rel]")).filter(
          (tr) => tr.querySelector(".rs-theme")?.textContent === theme,
        );
        const shown = rows.filter((tr) => !tr.hidden).length;
        head.hidden = shown === 0;
        const count = head.querySelector<HTMLElement>(`[data-theme-count]`);
        if (count) count.textContent = String(shown);
      });
    };
    root.addEventListener("click", onClick);

    return () => {
      root.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      root.removeEventListener("click", onClick);
    };
  }, []);

  return null;
}
