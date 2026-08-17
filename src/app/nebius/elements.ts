/**
 * Custom elements for the /nebius console.
 *
 * Light DOM on purpose — a shadow root would cut these off from the vendored
 * Amber Console stylesheet.
 *
 * The one architectural rule: **no element ever adds or removes a DOM node.**
 * Everything is server-rendered and these only toggle attributes. React owns
 * the tree; if we mutated its structure the two would fight on any re-render.
 */

const ACTIVE_ATTR = "data-active";

/** Document panel. Shows or hides itself; nothing else. */
class AcDoc extends HTMLElement {
  static get observedAttributes() {
    return [ACTIVE_ATTR];
  }

  attributeChangedCallback() {
    const active = this.hasAttribute(ACTIVE_ATTR);
    this.hidden = !active;
    // A hidden panel must leave the tab order, or keyboard users walk through
    // seventeen invisible documents.
    this.setAttribute("aria-hidden", active ? "false" : "true");
  }

  get docId(): string {
    return this.getAttribute("doc-id") ?? "";
  }
}

/** Index rail. Owns keyboard traversal and the mobile collapse. */
class AcIndex extends HTMLElement {
  connectedCallback() {
    this.addEventListener("keydown", this.#onKeydown);
  }

  disconnectedCallback() {
    this.removeEventListener("keydown", this.#onKeydown);
  }

  /** Only entries the search has left visible. */
  get items(): HTMLButtonElement[] {
    return Array.from(
      this.querySelectorAll<HTMLButtonElement>("[data-doc-target]"),
    ).filter((el) => !el.hidden && el.offsetParent !== null);
  }

  #onKeydown = (event: KeyboardEvent) => {
    const keys = ["ArrowDown", "ArrowUp", "Home", "End"];
    if (!keys.includes(event.key)) return;

    const items = this.items;
    if (items.length === 0) return;

    const current = document.activeElement as HTMLElement | null;
    const index = items.findIndex((el) => el === current);
    if (index === -1 && event.key !== "Home" && event.key !== "End") return;

    event.preventDefault();
    let next = 0;
    if (event.key === "ArrowDown") next = (index + 1) % items.length;
    else if (event.key === "ArrowUp") next = (index - 1 + items.length) % items.length;
    else if (event.key === "End") next = items.length - 1;

    items[next]?.focus();
  };

  setCurrent(docId: string) {
    this.querySelectorAll<HTMLElement>("[data-doc-target]").forEach((el) => {
      const match = el.getAttribute("data-doc-target") === docId;
      el.setAttribute("aria-current", match ? "true" : "false");
    });
  }
}

/** Search box. Filters the index; never touches document content. */
class AcSearch extends HTMLElement {
  #input: HTMLInputElement | null = null;

  connectedCallback() {
    this.#input = this.querySelector("input");
    this.#input?.addEventListener("input", this.#run);
    this.addEventListener("click", this.#onChipClick);
    document.addEventListener("keydown", this.#onGlobalKey);
  }

  disconnectedCallback() {
    this.#input?.removeEventListener("input", this.#run);
    this.removeEventListener("click", this.#onChipClick);
    document.removeEventListener("keydown", this.#onGlobalKey);
  }

  #onChipClick = (event: Event) => {
    const chip = (event.target as HTMLElement).closest<HTMLElement>("[data-hint]");
    if (!chip || !this.#input) return;
    event.preventDefault();
    this.#input.value = chip.getAttribute("data-hint") ?? "";
    this.#run();
    this.#input.focus();
  };

  /** "/" focuses search, Escape clears it — the affordances that make it feel native. */
  #onGlobalKey = (event: KeyboardEvent) => {
    const target = event.target as HTMLElement | null;
    const typing =
      target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement;

    if (event.key === "/" && !typing) {
      event.preventDefault();
      this.#input?.focus();
      return;
    }
    if (event.key === "Escape" && this.#input && this.#input.value) {
      this.#input.value = "";
      this.#run();
    }
  };

  #run = () => {
    const query = (this.#input?.value ?? "").trim().toLowerCase();
    const console_ = this.closest("ac-console");
    const entries = Array.from(
      console_?.querySelectorAll<HTMLElement>("[data-search]") ?? [],
    );

    let matches = 0;
    for (const entry of entries) {
      const hit = query === "" || (entry.getAttribute("data-search") ?? "").includes(query);
      entry.hidden = !hit;
      if (hit) matches += 1;
    }

    // Hide a section heading when everything under it is filtered out.
    console_?.querySelectorAll<HTMLElement>("[data-section]").forEach((section) => {
      const visible = section.querySelectorAll<HTMLElement>("[data-search]:not([hidden])");
      section.hidden = visible.length === 0;
    });

    const count = console_?.querySelector<HTMLElement>("[data-match-count]");
    if (count) count.textContent = query === "" ? `${entries.length}` : `${matches}`;

    const empty = console_?.querySelector<HTMLElement>("[data-no-match]");
    if (empty) empty.hidden = !(query !== "" && matches === 0);
  };
}

/**
 * The ledger. Sorts by relevance, date or theme, and groups by whatever it
 * sorted on.
 *
 * This is the one element that moves nodes rather than only toggling
 * attributes. It is safe here because it only ever calls appendChild on rows
 * that already exist — a move, never a create or a destroy — and the table is
 * server-rendered into a subtree that never re-renders, so React has nothing
 * to reconcile against. The row and group counts are fixed at build time.
 */
type SortMode = "rel" | "year" | "theme";

class AcLedger extends HTMLElement {
  #dir: 1 | -1 = 1;
  #mode: SortMode = "theme";

  connectedCallback() {
    this.addEventListener("click", this.#onClick);
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.#onClick);
  }

  #onClick = (event: MouseEvent) => {
    const btn = (event.target as HTMLElement).closest<HTMLElement>("[data-sort]");
    if (!btn) return;
    const mode = btn.getAttribute("data-sort") as SortMode | null;
    if (!mode) return;
    // Re-clicking the active column reverses it. A new column starts ascending,
    // because "oldest first" and "most relevant first" are the useful defaults.
    this.#dir = mode === this.#mode ? ((this.#dir * -1) as 1 | -1) : 1;
    this.#mode = mode;
    this.#apply();
  };

  #apply() {
    const body = this.querySelector("tbody");
    if (!body) return;

    const rows = Array.from(body.querySelectorAll<HTMLElement>("[data-row]"));
    const groups = Array.from(body.querySelectorAll<HTMLElement>("[data-group]"));

    const keyOf = (r: HTMLElement) =>
      this.#mode === "theme"
        ? (r.getAttribute("data-theme") ?? "")
        : this.#mode === "year"
          ? (r.getAttribute("data-year") ?? "")
          : (r.getAttribute("data-rel") ?? "0");

    // Group order follows the order the boundary rows were rendered in, which
    // for themes is the curated TWEET_THEMES order rather than the alphabet.
    const order: string[] = [];
    for (const g of groups) {
      if (g.getAttribute("data-group") !== this.#mode) continue;
      const k = g.getAttribute("data-key");
      if (k !== null) order.push(k);
    }
    if (this.#dir === -1) order.reverse();

    const buckets = new Map<string, HTMLElement[]>(order.map((k) => [k, []]));
    for (const r of rows) buckets.get(keyOf(r))?.push(r);

    const date = (r: HTMLElement) => r.getAttribute("data-date") ?? "";
    for (const list of buckets.values()) {
      list.sort((a, b) => (date(a) < date(b) ? -1 : date(a) > date(b) ? 1 : 0));
      if (this.#dir === -1) list.reverse();
    }

    for (const g of groups) g.hidden = g.getAttribute("data-group") !== this.#mode;

    const frag = document.createDocumentFragment();
    for (const k of order) {
      const head = groups.find(
        (g) => g.getAttribute("data-group") === this.#mode && g.getAttribute("data-key") === k,
      );
      if (head) frag.appendChild(head);
      for (const r of buckets.get(k) ?? []) frag.appendChild(r);
    }
    // Boundary rows for the other two modes stay in the DOM, parked and hidden.
    for (const g of groups) {
      if (g.getAttribute("data-group") !== this.#mode) frag.appendChild(g);
    }
    body.appendChild(frag);

    this.querySelectorAll<HTMLElement>("[data-sort-col]").forEach((th) => {
      const active = th.getAttribute("data-sort-col") === this.#mode;
      th.setAttribute(
        "aria-sort",
        active ? (this.#dir === 1 ? "ascending" : "descending") : "none",
      );
    });
    this.setAttribute("data-mode", this.#mode);
    this.setAttribute("data-dir", this.#dir === 1 ? "asc" : "desc");
  }
}

/** The shell. Owns which document is showing, and the URL that reflects it. */
class AcConsole extends HTMLElement {
  connectedCallback() {
    this.addEventListener("click", this.#onClick);
    window.addEventListener("hashchange", this.#onHashChange);

    // Upgrade from the no-JS state: everything is visible until now.
    const fromHash = this.#docIdFromHash();
    const id = this.#select(fromHash ?? this.getAttribute("default-doc") ?? "", {
      push: false,
      focus: false,
    });
    // A bare /nebius resolves to the default doc, so name it in the URL. replace,
    // not push: the landing view is not a history entry of its own, and back
    // should leave the page rather than cycle through the opening panel.
    if (!fromHash && id) {
      window.history.replaceState(null, "", `#doc-${id}`);
    }
    this.setAttribute("data-ready", "");
  }

  disconnectedCallback() {
    this.removeEventListener("click", this.#onClick);
    window.removeEventListener("hashchange", this.#onHashChange);
  }

  #docIdFromHash(): string | null {
    const hash = window.location.hash.replace(/^#/, "");
    if (!hash.startsWith("doc-")) return null;
    const id = hash.slice(4);
    return this.querySelector(`ac-doc[doc-id="${CSS.escape(id)}"]`) ? id : null;
  }

  #onHashChange = () => {
    const id = this.#docIdFromHash();
    if (id) this.#select(id, { push: false, focus: true });
  };

  #onClick = (event: MouseEvent) => {
    const el = event.target as HTMLElement;

    // Mobile index drawer.
    if (el.closest("[data-index-toggle]")) {
      event.preventDefault();
      const open = this.hasAttribute("data-index-open");
      if (open) this.removeAttribute("data-index-open");
      else this.setAttribute("data-index-open", "");
      const toggle = this.querySelector<HTMLElement>("[data-index-toggle]");
      toggle?.setAttribute("aria-expanded", open ? "false" : "true");
      return;
    }

    const target = el.closest<HTMLElement>("[data-doc-target]");
    if (!target) return;
    event.preventDefault();
    const id = target.getAttribute("data-doc-target");
    if (id) this.#select(id, { push: true, focus: true });
  };

  /** Returns the doc id it settled on, which may not be the one asked for. */
  #select(docId: string, opts: { push: boolean; focus: boolean }): string | null {
    const docs = Array.from(this.querySelectorAll<HTMLElement>("ac-doc"));
    if (docs.length === 0) return null;

    const wanted =
      docs.find((d) => d.getAttribute("doc-id") === docId) ?? docs[0];
    const id = wanted.getAttribute("doc-id") ?? "";

    // Set `hidden` directly rather than leaning on attributeChangedCallback:
    // that only fires on a *change*, so panels that never carried the attribute
    // would never be told to hide. This also frees us from child-upgrade order.
    for (const doc of docs) {
      const active = doc === wanted;
      if (active) doc.setAttribute(ACTIVE_ATTR, "");
      else doc.removeAttribute(ACTIVE_ATTR);
      doc.hidden = !active;
      doc.setAttribute("aria-hidden", active ? "false" : "true");
    }

    const index = this.querySelector("ac-index") as AcIndex | null;
    index?.setCurrent?.(id);

    // Collapse the mobile drawer once a choice is made.
    this.removeAttribute("data-index-open");

    if (opts.push && window.location.hash !== `#doc-${id}`) {
      window.history.pushState(null, "", `#doc-${id}`);
    }

    const scroller = this.querySelector<HTMLElement>("[data-content-scroll]");
    if (scroller) scroller.scrollTop = 0;

    if (opts.focus) {
      const heading = wanted.querySelector<HTMLElement>("[data-doc-heading]");
      heading?.focus();
    }

    return id;
  }
}

let registered = false;

export function registerConsoleElements() {
  if (registered || typeof window === "undefined") return;
  registered = true;
  if (!customElements.get("ac-doc")) customElements.define("ac-doc", AcDoc);
  if (!customElements.get("ac-index")) customElements.define("ac-index", AcIndex);
  if (!customElements.get("ac-search")) customElements.define("ac-search", AcSearch);
  if (!customElements.get("ac-console")) customElements.define("ac-console", AcConsole);
  if (!customElements.get("ac-ledger")) customElements.define("ac-ledger", AcLedger);
}
