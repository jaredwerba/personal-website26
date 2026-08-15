import type { Metadata } from "next";
import { VT323, Silkscreen } from "next/font/google";
import "./amber-console.css";
import NebiusConsole from "./NebiusConsole";
import ConsoleRuntime from "./console-runtime";

/**
 * Fonts load per-route, so only /nebius pays for them and the rest of the site
 * keeps its own typography.
 */
const term = VT323({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ac-term",
  display: "swap",
});
const micro = Silkscreen({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-ac-micro",
  display: "swap",
});

/**
 * Server component on purpose. A "use client" page cannot export metadata, and
 * losing robots: noindex would publish this page to search.
 */
export const metadata: Metadata = {
  title: "Technical Brief — Jared Werba",
  description: "Projects, what I owned, and what came out of them.",
  robots: { index: false, follow: false },
};

export default function NebiusPage() {
  return (
    <div
      className={`${term.variable} ${micro.variable} ac-root -mx-4 md:-mx-8 px-4 md:px-6 py-4`}
      data-ac-tech="crt"
      data-ac-emitter="p3"
    >
      <NebiusConsole />
      <ConsoleRuntime />
    </div>
  );
}
