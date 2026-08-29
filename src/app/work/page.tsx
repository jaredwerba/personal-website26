import type { Metadata } from "next";
import "../nebius-resume/resume.css";
import ResumeDoc from "../nebius-resume/ResumeDoc";
import ResumeRuntime from "../nebius-resume/runtime";

export const metadata: Metadata = {
  title: "Jared Werba — Case studies",
  description:
    "Technical case studies: what I built, what I owned, and what came of it.",
};

export default function WorkPage() {
  return (
    <>
      <ResumeDoc />
      <ResumeRuntime />
    </>
  );
}
