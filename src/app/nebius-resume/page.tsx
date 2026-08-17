import type { Metadata } from "next";
import "./resume.css";
import ResumeDoc from "./ResumeDoc";
import ResumeRuntime from "./runtime";

/**
 * Server component on purpose. A "use client" page cannot export metadata, and
 * losing robots: noindex would publish this to search.
 */
export const metadata: Metadata = {
  title: "Jared Werba — Forward Deployed Engineer, Nebius",
  description:
    "A technical brief: what I built, what I owned, what came of it, and what I would have to learn.",
  robots: { index: false, follow: false },
};

export default function NebiusResumePage() {
  return (
    <>
      <ResumeDoc />
      <ResumeRuntime />
    </>
  );
}
