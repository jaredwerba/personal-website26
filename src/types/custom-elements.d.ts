import type { DetailedHTMLProps, HTMLAttributes } from "react";

/**
 * JSX declarations for the /nebius console elements. React 19 passes unknown
 * attributes straight through to the DOM, so these only need to exist for
 * TypeScript.
 */
type AcElement<T = Record<string, unknown>> = DetailedHTMLProps<
  HTMLAttributes<HTMLElement>,
  HTMLElement
> &
  T;

declare module "react" {
  namespace JSX {
    interface IntrinsicElements {
      "ac-console": AcElement<{ "default-doc"?: string }>;
      "ac-index": AcElement;
      "ac-search": AcElement;
      "ac-doc": AcElement<{ "doc-id"?: string; hidden?: boolean }>;
      "ac-tweet-modal": AcElement;
    }
  }
}

export {};
