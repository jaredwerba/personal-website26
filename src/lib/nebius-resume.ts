/**
 * Copy for /nebius-resume.
 *
 * Everything checkable — projects, the capability map, the ledger, the Oracle
 * background — is imported from nebius-projects.ts, so the console page and this
 * one can never disagree about a fact. This file holds only what is specific to
 * the document form: the summary, the honest-gaps section, and the section map.
 */

export type ResumeSection = {
  id: string;
  label: string;
  /** Shown under the heading. One line. */
  blurb?: string;
};

export const SECTIONS: ResumeSection[] = [
  { id: "summary", label: "In one minute" },
  { id: "bar", label: "Against your bar", blurb: "The five areas in your job posting, in your order, and what I have built against each one." },
  { id: "honest", label: "What I would have to learn", blurb: "The gaps, named before you find them." },
  { id: "work", label: "Selected work", blurb: "Eighteen projects. What the problem was, what I built, what came of it." },
  { id: "record", label: "The public record", blurb: "153 dated posts. The interconnect thread runs seven years." },
  { id: "background", label: "Background", blurb: "Ten years at Oracle, on the other side of this conversation." },
  { id: "verify", label: "How to check any of this" },
];

export const HEADER = {
  name: "Jared Werba",
  role: "Forward Deployed Engineer — AI R&D",
  preparedFor: "Chris Mulder, Head of Engineering — AI R&D",
  location: "Boston, MA",
  email: "werba@protonmail.com",
  site: "https://www.jwerba.com",
  github: "https://github.com/jaredwerba",
  linkedin: "https://www.linkedin.com/in/jwerba",
  x: "https://x.com/jaredwerba",
};

/** The elevator version. Every claim below is linked further down the page. */
export const SUMMARY: string[] = [
  "I spent ten years at Oracle selling and architecting cloud infrastructure — every OCI IaaS and PaaS product, including GPU compute for training and inference. I ran discovery, architecture reviews, live demos and POC scoping myself. My title was account executive and solutions engineer, combined. I escalated to specialists only when the scope demanded it. That is the customer-facing half of this job, and I have done it for a decade.",
  "I rented a Nebius H200, served two models on it, and measured what it actually delivered. Model 1 is an uncensored Qwen 27B, on vLLM. Model 2 is an abliterated Qwen 35B, on SGLang. I needed two servers, because vLLM refused the second checkpoint.",
  "I have been interested in high performance computing since before it was an industry, and I have a public track record that shows it. InfiniBand in 2019. RDMA in 2020. RoCE in 2024. That is why I want this job at Nebius, and not simply an AI job.",
];

/**
 * The gaps. This section exists because a brief that only argues in one
 * direction is not worth reading, and because every one of these will come up
 * anyway. Each is stated plainly, then answered with the nearest real thing.
 */
export type Gap = {
  gap: string;
  /** What is actually true, without stretching. */
  standing: string;
  /** What closing it would take. No promises about timelines. */
  plan: string;
};

export const GAPS_LEAD =
  "I teach myself things. That is the pattern in my whole record, and it is why I want this job. Below are the five gaps I know about. I put them here because I would rather name them than have you find them.";

export const GAPS: Gap[] = [
  {
    gap: "Kubernetes and Docker, hands on",
    standing:
      "I architected Kubernetes for named accounts at Oracle. I sold it for years. That is architecture work, not operations. I have not run a cluster. I have not written a Helm chart. Nobody has paged me for one. My own serving work runs on a bare Ubuntu VM, not in a container.",
    plan:
      "This is the most mechanical gap on the list. I know the objects and why they exist. I do not have the practice of operating them.",
  },
  {
    gap: "Serving for other people",
    standing:
      "I have measured the batching now. I swept one H200 from 1 to 64 concurrent requests. My first configuration capped the card at four sequences and about 375 tokens a second. One flag took that to 2,128 tokens a second at 32 concurrent, and cut time to first token from 21.1 seconds to 3.8. What I have still not done is serve anyone but myself. No authentication. No rate limits. No tenancy. Nobody has ever paged me about it.",
    plan:
      "The measurement gap is closed, and the numbers are on this page. The operational gap is not, and that is the half I would be learning from your team.",
  },
  {
    gap: "Distributed systems at real scale",
    standing:
      "My best concurrency work is a worker-pool fix I found with a measurement. One task held 6 of 40 workers for an hour and seventeen minutes while 34 sat idle. A sequential run at 20 workers did the same work in 28 minutes. That is one machine. The closest I get to distributed is two Mac minis on RDMA, splitting one model with EXO. Right shape, toy scale.",
    plan:
      "I would learn this on the job, from people who have done it. I am saying so instead of borrowing the word.",
  },
  {
    gap: "Shipping an SDK or a developer platform",
    standing:
      "I write reusable interfaces. One connector contract put three dispensary menu platforms behind one shape. One client template onboarded a second client in two days. Neither is a published library. No outside developer depends on my code.",
    plan:
      "The instinct to build the pattern is there. The practice of maintaining something other people rely on is not.",
  },
  {
    gap: "Years with the title engineer",
    standing:
      "Ten years of my resume says account executive. The work was technical: architecture reviews, POC scoping, live demos, Oracle Cloud Architect certified twice, the first AE at Oracle to earn it. The title was not technical, and I will not pretend it was.",
    plan: "",
  },
];

/** Where a reader should start, and why. Three, not eighteen. */
export const START_HERE: { id: string; name: string; why: string }[] = [
  {
    id: "01",
    name: "Nebius-XWord — start with the eval harness",
    why: "I built the harness before I chose a model. Four solvers run through one scorer. An empty solver must score 0% and an oracle solver must score 100%, or the scorer itself is broken. A third solver fills real interlocking words while ignoring every clue, and scores about 9% — that is the floor, and anything above it is what the model contributed by reading. Then the agent: a hand-built LangGraph, four tools, and a stop rule that fires on a submit call rather than on silence. Measuring first also found a gap in your catalog: DeepSeek V4 Flash advertises no tool support, so it cannot drive a tool-calling agent at all.",
  },
  {
    id: "18",
    name: "H200 Model Serve",
    why: "Two models on one rented Nebius H200. vLLM for the 27B, SGLang for the 35B after vLLM refused its vision-tower weights. Five of the ten things that stopped me were platform friction, not model problems, and each one is written down with its cause and its fix.",
  },
  {
    id: "04",
    name: "LinkedIn-Automator",
    why: "The one that ran in production, against a live third-party site built to resist automation. Its most consequential decision was the decision not to act: it detected replies and suppressed its own follow-ups.",
  },
];

export const VERIFY: { label: string; detail: string; href?: string }[] = [
  {
    label: "Source code",
    detail: "Nebius-XWord, LinkedIn-Automator, BrainStorm.ai and the career-ops contributions are public.",
    href: "https://github.com/jaredwerba",
  },
  {
    label: "Running software",
    detail: "Twelve deployments are live right now. Every one is linked from its project below.",
  },
  {
    label: "Software a business runs on",
    detail:
      "GoalsRun is in commercial use by a Boston running coach. I built it and I still run it. He sells sessions through it.",
    href: "https://www.goalslopes.run",
  },
  {
    label: "The hackathon result",
    detail: "First place, Augmentation Lab at MIT, AugHacks 2025 Long Track. Judged externally, by MIT Media Lab researchers. Presented to Stephen Wolfram.",
    href: "https://devpost.com/software/brainstorm-jcko3f",
  },
  {
    label: "The dated posts",
    detail: "153 of them, oldest 2017. Every row links to the original, and X shows the exact timestamp on the status page.",
    href: "https://x.com/jaredwerba",
  },
  {
    label: "The console version of this page",
    detail: "Same content, built as a CRT terminal. It is the version that shows what I think good UI is.",
    href: "/nebius",
  },
];

