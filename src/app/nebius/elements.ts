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

/** The shell. Owns which document is showing, and the URL that reflects it. */
class AcConsole extends HTMLElement {
  connectedCallback() {
    this.addEventListener("click", this.#onClick);
    window.addEventListener("hashchange", this.#onHashChange);

    // Upgrade from the no-JS state: everything is visible until now.
    this.#select(this.#docIdFromHash() ?? this.getAttribute("default-doc") ?? "", {
      push: false,
      focus: false,
    });
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

  #select(docId: string, opts: { push: boolean; focus: boolean }) {
    const docs = Array.from(this.querySelectorAll<HTMLElement>("ac-doc"));
    if (docs.length === 0) return;

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
  }
}

/**
 * Opens a post in a dialog instead of sending the reader to X.
 *
 * Deliberately does NOT embed X's iframe. Their embed endpoint serves a shell
 * that needs their widget script to fill in, and it renders blank — verified
 * standalone, not just here. A modal whose body is an empty black box is worse
 * than the plain link it replaced.
 *
 * So the card is built from the row that was clicked: date, title, why it
 * matters, and links out to both the post and the original article. Always
 * correct, no third-party request, and nothing leaves the page.
 */
class AcTweetModal extends HTMLElement {
  #dialog: HTMLDialogElement | null = null;

  connectedCallback() {
    this.#dialog = this.querySelector("dialog");
    document.addEventListener("click", this.#onDocClick);
    this.addEventListener("click", this.#onModalClick);
    this.#dialog?.addEventListener("close", this.#onClose);
    this.#dialog?.addEventListener("cancel", this.#onClose);
  }

  disconnectedCallback() {
    document.removeEventListener("click", this.#onDocClick);
    this.removeEventListener("click", this.#onModalClick);
    this.#dialog?.removeEventListener("close", this.#onClose);
    this.#dialog?.removeEventListener("cancel", this.#onClose);
  }

  static tweetId(href: string): string | null {
    return href.match(/(?:twitter|x)\.com\/[^/]+\/status\/(\d+)/)?.[1] ?? null;
  }

  #onDocClick = (event: MouseEvent) => {
    // Let modified clicks through — someone asking for a new tab should get one.
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.button !== 0) return;

    const link = (event.target as HTMLElement).closest<HTMLAnchorElement>("a[href]");
    if (!link || this.contains(link)) return;

    const id = AcTweetModal.tweetId(link.href);
    if (!id || !this.#dialog) return;

    event.preventDefault();
    this.#open(id, link);
  };

  #onModalClick = (event: MouseEvent) => {
    const target = event.target as HTMLElement;
    if (target.closest("[data-tweet-close]")) {
      this.#close();
      return;
    }
    // Click on the backdrop — i.e. the dialog element itself, not its content.
    if (target === this.#dialog) this.#close();
  };

  /** Single close path. The dialog's own `close` event proved unreliable, so
   *  cleanup does not depend on it. */
  #close = () => {
    this.#clearRow();
    if (this.#dialog?.open) this.#dialog.close();
  };

  #clearRow = () => {
    this.querySelectorAll("[data-open-row]").forEach((el) =>
      el.removeAttribute("data-open-row"),
    );
    document
      .querySelectorAll("[data-open-row]")
      .forEach((el) => el.removeAttribute("data-open-row"));
    this.#lastRow = null;
  };

  #open(id: string, link: HTMLAnchorElement) {
    const dialog = this.#dialog;
    if (!dialog) return;

    // Prefer the row's own title cell. The link itself only reads "OPEN", and
    // its textContent also picks up the visually-hidden new-tab note.
    const row = link.closest("tr");
    const cells = row ? Array.from(row.querySelectorAll("td")) : [];
    const date = cells[0]?.textContent?.trim() ?? "";
    const rowTitle = cells[1]?.textContent?.trim() ?? "";

    const linkText = Array.from(link.childNodes)
      .filter((n) => n.nodeType === Node.TEXT_NODE)
      .map((n) => n.textContent ?? "")
      .join("")
      .trim();

    const title = rowTitle || linkText || "Post";
    const why = cells[2]?.textContent?.trim() ?? "";
    const sourceLink = cells[4]?.querySelector("a");

    const set = (sel: string, text: string) => {
      const el = this.querySelector<HTMLElement>(sel);
      if (el) el.textContent = text;
    };
    set("[data-tweet-title]", title);
    set("[data-tweet-date]", date);

    const whyEl = this.querySelector<HTMLElement>("[data-tweet-why]");
    if (whyEl) {
      whyEl.textContent = why;
      whyEl.hidden = !why || why === "—";
    }

    const out = this.querySelector<HTMLAnchorElement>("[data-tweet-out]");
    if (out) out.href = link.href;

    const src = this.querySelector<HTMLAnchorElement>("[data-tweet-source]");
    if (src) {
      const href = sourceLink?.getAttribute("href");
      if (href) {
        src.href = href;
        src.hidden = false;
      } else {
        src.hidden = true;
      }
    }

    // Mark the row so it is obvious which one is open behind the dialog.
    this.#clearRow();
    row?.setAttribute("data-open-row", "");
    this.#lastRow = row;

    if (typeof dialog.showModal === "function") dialog.showModal();
    else dialog.setAttribute("open", "");
  }

  #lastRow: HTMLElement | null = null;

  #onClose = () => {
    this.#clearRow();
  };
}

let registered = false;

export function registerConsoleElements() {
  if (registered || typeof window === "undefined") return;
  registered = true;
  if (!customElements.get("ac-doc")) customElements.define("ac-doc", AcDoc);
  if (!customElements.get("ac-index")) customElements.define("ac-index", AcIndex);
  if (!customElements.get("ac-search")) customElements.define("ac-search", AcSearch);
  if (!customElements.get("ac-console")) customElements.define("ac-console", AcConsole);
  if (!customElements.get("ac-tweet-modal"))
    customElements.define("ac-tweet-modal", AcTweetModal);
}
