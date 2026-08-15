"use client";

import { useEffect } from "react";

/**
 * Registers the console's custom elements and renders nothing.
 *
 * This exists so page.tsx can stay a server component. If the page itself were
 * "use client" it could not export metadata, and /nebius would lose its
 * robots: noindex — see /sales and /software for that failure mode.
 *
 * The element module is imported inside the effect, not at the top of the file.
 * "use client" still gets server-rendered, and `class X extends HTMLElement`
 * evaluates at module load — which throws on the server, where HTMLElement
 * does not exist.
 */
export default function ConsoleRuntime() {
  useEffect(() => {
    let cancelled = false;
    import("./elements").then((mod) => {
      if (!cancelled) mod.registerConsoleElements();
    });
    return () => {
      cancelled = true;
    };
  }, []);

  return null;
}
