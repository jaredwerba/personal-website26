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

const READABLE_KEY = "nebius:readable";

/** The shell. Owns which document is showing, and the URL that reflects it. */
class AcConsole extends HTMLElement {
  #root: HTMLElement | null = null;

  connectedCallback() {
    this.addEventListener("click", this.#onClick);
    window.addEventListener("hashchange", this.#onHashChange);

    this.#root = this.closest(".ac-root");

    // Restore the reader's choice before the first paint of the upgraded view,
    // so someone who switched to plain text does not get a flash of console.
    let stored = false;
    try {
      stored = window.localStorage.getItem(READABLE_KEY) === "1";
    } catch {
      // Private mode or storage disabled. The toggle still works, it just does
      // not persist, which is not worth failing the page over.
    }
    if (stored) this.#applyReadable(true);

    // Upgrade from the no-JS state: everything is visible until now.
    this.#select(this.#docIdFromHash() ?? this.getAttribute("default-doc") ?? "", {
      push: false,
      focus: false,
    });
    this.setAttribute("data-ready", "");
  }

  get #readable(): boolean {
    return this.#root?.hasAttribute("data-readable") ?? false;
  }

  /** Attribute + button state only. Document visibility is #select's job. */
  #applyReadable(on: boolean) {
    if (on) this.#root?.setAttribute("data-readable", "");
    else this.#root?.removeAttribute("data-readable");

    const btn = this.querySelector<HTMLElement>("[data-readability-toggle]");
    btn?.setAttribute("aria-pressed", on ? "true" : "false");
    if (btn) btn.textContent = on ? "CONSOLE VIEW" : "READABILITY";
  }

  #toggleReadable() {
    const next = !this.#readable;
    this.#applyReadable(next);
    try {
      window.localStorage.setItem(READABLE_KEY, next ? "1" : "0");
    } catch {
      /* see above */
    }
    // Re-run selection so the documents match the mode: plain view shows the
    // whole brief in one scroll, console view goes back to one at a time.
    const current =
      this.querySelector<HTMLElement>("ac-doc[data-active]")?.getAttribute("doc-id") ??
      this.getAttribute("default-doc") ??
      "";
    this.#select(current, { push: false, focus: false });
    if (next) {
      // Land the reader at the top of the brief, not partway down whichever
      // document happened to be open.
      this.#root?.scrollIntoView({ block: "start" });
    }
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

    if (el.closest("[data-readability-toggle]")) {
      event.preventDefault();
      this.#toggleReadable();
      return;
    }

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

  #select(docId: string, opts: { push: boolean; focus: boolean }) {
    const docs = Array.from(this.querySelectorAll<HTMLElement>("ac-doc"));
    if (docs.length === 0) return;

    const wanted =
      docs.find((d) => d.getAttribute("doc-id") === docId) ?? docs[0];
    const id = wanted.getAttribute("doc-id") ?? "";

    // Plain view is the whole brief in one scroll, so nothing is hidden. The
    // active attribute is still tracked, so switching back restores the same
    // document. Hiding is done here rather than in CSS because a CSS-only hide
    // would leave aria-hidden="true" behind and keep the text away from a
    // screen reader in the one mode built for reading.
    const readable = this.#readable;

    // Set `hidden` directly rather than leaning on attributeChangedCallback:
    // that only fires on a *change*, so panels that never carried the attribute
    // would never be told to hide. This also frees us from child-upgrade order.
    for (const doc of docs) {
      const active = doc === wanted;
      if (active) doc.setAttribute(ACTIVE_ATTR, "");
      else doc.removeAttribute(ACTIVE_ATTR);
      doc.hidden = readable ? false : !active;
      doc.setAttribute("aria-hidden", readable || active ? "false" : "true");
    }

    const index = this.querySelector("ac-index") as AcIndex | null;
    index?.setCurrent?.(id);

    // Collapse the mobile drawer once a choice is made.
    this.removeAttribute("data-index-open");

    if (opts.push && window.location.hash !== `#doc-${id}`) {
      window.history.pushState(null, "", `#doc-${id}`);
    }

    if (readable) {
      // Nothing was hidden, so there is no panel to reset. The index and the
      // START HERE keys become a table of contents instead — without this they
      // are controls that visibly do nothing.
      if (opts.push) wanted.scrollIntoView({ block: "start", behavior: "smooth" });
    } else {
      const scroller = this.querySelector<HTMLElement>("[data-content-scroll]");
      if (scroller) scroller.scrollTop = 0;
    }

    if (opts.focus) {
      const heading = wanted.querySelector<HTMLElement>("[data-doc-heading]");
      heading?.focus();
    }
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
}
