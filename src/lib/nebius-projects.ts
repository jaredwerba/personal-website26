export type ProjectLink = {
  label: string;
  href: string;
  /** Running software — rendered as a filled soft key and surfaced in the top bar. */
  primary?: boolean;
  /** Shown beneath the key, e.g. an access code for a gated deployment. */
  note?: string;
  /** Overrides the host shown in the live-systems bar, for unwieldy preview URLs. */
  display?: string;
};

export type NebiusProject = {
  id: string;
  name: string;
  tagline: string;
  tier: 1 | 2 | 3;
  stack: string[];
  status: string;
  /** Brightness step — hierarchy is luminance, never hue. */
  accent: "orange" | "cyan" | "green";
  /**
   * "built" — I wrote it. "operates" — someone else's tool that I run daily;
   * the middle block becomes "What it does" and the last "How I use it".
   */
  kind?: "built" | "operates";
  problem: string;
  built: string[];
  outcome: string[];
  links?: ProjectLink[];
};

/**
 * Ordered by what an AI-engineering interviewer is most likely to probe,
 * not chronology. Tier 1 gets the full problem/built/outcome treatment.
 */
export const NEBIUS_PROJECTS: NebiusProject[] = [
  {
    id: "01",
    name: "NEBIUS-XWORD",
    tagline: "A tool-calling agent that solves crosswords — and an eval harness that proves it.",
    tier: 1,
    accent: "orange",
    status: "LIVE",
    stack: [
      "Python",
      "LangGraph",
      "langchain-openai",
      "FastAPI",
      "Nebius Token Factory",
      "Vercel",
    ],
    problem:
      "The assignment asked for three things: an agent that solves crossword puzzles, a method to evaluate its solutions, and a repo with clear instructions. Solving puzzles is the easy part. The hard parts are proving the agent is actually good rather than lucky, and making it structurally impossible for a wrong answer to become a corrupt grid.",
    built: [
      "Split authority deliberately: a deterministic Python engine owns the grid — slots, numbering, crossing validation — and the model owns only the answers. A hallucinated answer gets rejected with a reason the model can read and retry against. It can fail, but it can never corrupt state.",
      "Hand-built the LangGraph StateGraph instead of using the prebuilt agent, because my stop condition is different: the run must end on a submit tool call, not when the model goes quiet. Three nodes — agent, tools, and a nudge node that pushes models back to tool-calling when they answer in prose, bounded to 3 so a model that never calls tools still terminates.",
      "Bounded the context window after measuring the cost of not doing it: resending full history every turn made token cost grow with the square of the turn count — 1.09M tokens for a single 40-turn solve. The window keeps the system prompt and the initial grid, plus the most recent messages. It also drops orphaned tool results after the cut, because an OpenAI-style API rejects a tool message whose assistant call is missing.",
      "Built an eval harness that validates itself. Four solvers run through identical scoring code: empty must score 0% (if not, the scorer is broken), oracle must score 100% (same test, other direction), backtrack fills real interlocking words while ignoring every clue and scores ~9% — so anything above that line is what the language model actually contributed by understanding clues.",
      "Chose models by measurement, not reputation. Read the live catalog, found that DeepSeek-V4-Flash silently lacks tool support and cannot drive the agent at all, screened thirteen candidates, then ran the survivors through 5 models x 2 services x 4 puzzles x 2 runs. The README publishes the failures alongside the winners.",
      "Measured the prompt itself. Instructing the agent to call get_state first wasted a turn, since the first message already contains the grid; a confirm-before-submit step cost 200 seconds re-checking a grid the engine had already validated. Removing both took one solve from 420s to 153s.",
    ],
    outcome: [
      "Pointed it at a real newspaper 13x13 with 60 interlocking entries. DeepSeek V4 Pro on Nebius completed and submitted the full grid — 60 of 60, every crossing verified — in 98 turns, 16.6 minutes, 2.44M tokens, about $4.40.",
      "That run produced two improvements that went back into the agent: the history window, and the nudge step that recovers a model which answers in prose.",
      "Racing the same weights across providers, Nebius averaged 17.5s against the gateway's 53.7s. Labelled n=4 on the page rather than dressed up as a benchmark.",
      "Firing both providers at once surfaced a bug single-provider tests could not: on a cold start the env loaded late, and the fallback chain handed the gateway request the Nebius key. Fixed, with a regression test.",
      "55 tests, none requiring an API key or network — a scripted fake model drives the whole graph offline.",
    ],
    links: [
      { label: "LIVE.DEMO", href: "https://nebius-xword.vercel.app", primary: true },
      { label: "SOURCE", href: "https://github.com/jaredwerba/Nebius-XWord" },
    ],
  },
  {
    id: "02",
    name: "BRAINSTORM.AI",
    tagline:
      "EEG to attention, in real time — first place at an MIT-hosted neurotech hackathon.",
    tier: 1,
    accent: "green",
    status: "1ST PLACE // AUGHACKS 2025",
    stack: [
      "OpenBCI Ultracortex",
      "NeuroLM",
      "Seeed XIAO ESP32S3",
      "Python",
      "C++",
      "TypeScript",
    ],
    problem:
      "Our digital selves are connected to everything on the internet except our own cognitive and emotional state. If a system could read attention directly rather than inferring it from clicks, it could recommend what you actually engage with instead of what you merely opened — and tell a student which material is genuinely landing.",
    built: [
      "A pipeline taking continuous 6-channel, 250Hz EEG from an OpenBCI Ultracortex headset through the NeuroLM neural network, producing attention and engagement scores plus a 512-dimensional embedding for every 1-10 second window.",
      "Content recall mapping: embeddings from a live session are compared against embeddings previously generated from other videos, so the system can recommend the material that maximises a given person's attention and engagement.",
      "A wearable camera on a Seeed XIAO ESP32S3 board that captures a snapshot of the moment whenever attention or engagement crosses threshold — pairing the neural signal with what the person was actually looking at.",
      "brain-storm.ai — I built and shipped the public product site solo in the six days after the event: 28 commits, the v0.0/v1.0 roadmap, form capture, analytics, animation, and the mobile-responsive pass.",
      "The hard problems were physical, not just software: EEG readings corrupting mid-capture, unreliable capture software, wiring model output into a live frontend, and getting WiFi up on the XIAO board.",
    ],
    outcome: [
      "First place, Long Track — AugHacks 2025, hosted by Augmentation Lab at MIT in Cambridge.",
      "Judged by a panel including two MIT Media Lab researchers, alongside founders from PRISM, LONG, and MorphoAI. Sponsors included Meta and AWS.",
      "Winners were invited to exhibit at the MIT Media Lab Augmentation Summit.",
      "A working BCI prototype in 24 hours, built by a team of three, none of whom had a neuroscience background going in.",
    ],
    links: [
      { label: "LIVE.SITE", href: "https://www.brain-storm.ai", primary: true },
      { label: "DEVPOST", href: "https://devpost.com/software/brainstorm-jcko3f" },
      { label: "SOURCE", href: "https://github.com/jaredwerba/aughacks" },
    ],
  },
  {
    id: "03",
    name: "VENUS",
    tagline:
      "A multi-agent planner that researches vendors in parallel and emails them on your behalf.",
    tier: 1,
    accent: "cyan",
    status: "BUILT // DRY-RUN BY DEFAULT",
    stack: [
      "TypeScript",
      "eve",
      "Vercel AI Gateway",
      "claude-sonnet-5",
      "Zod",
      "Tavily",
      "Resend",
      "Upstash",
    ],
    problem:
      "Planning a wedding is a research problem disguised as an emotional one: four separate vendor categories, each needing its own search, shortlist, and outreach, with the couple as the bottleneck on every thread. I wanted to know whether an agent could own the whole loop — research, contact, follow up, and interpret the replies — without ever inventing a vendor or a price.",
    built: [
      "Parallel specialist sub-agents for venue, photography, catering, and florals/music, capped at four concurrent. Each runs with no shared history, which forces every brief to be self-packing rather than quietly depending on context it cannot see.",
      "Reply classification as structured output: a Zod schema through generateObject returning intent, availability, price info, questions and sentiment — wrapped so that a model or parse failure degrades to a keyword heuristic and records which path ran, rather than silently guessing.",
      "The classifier prompt encodes real failures I hit: conditional business language ('we're not taking a deposit until you confirm the date') is not a decline, and quoted text below an 'On ... wrote:' line is the couple speaking, not the vendor.",
      "Replaced the framework's provider-managed web search with a Tavily-backed tool on purpose — built-in search couples research ability to the model vendor, so swapping models would silently break research. Backing it with Tavily keeps the capability model-independent.",
      "Layered safety on the one tool with real-world side effects. Approval is graduated rather than blanket: interactive sessions pause for a human, unattended ones resolve against pre-authorisation and caps so the agent can never park an unanswerable prompt. Sends re-validate at dispatch time, because approval is a gate, not authorisation. Three-mode outreach (dry run / test inbox / live), per-vendor and daily caps, and atomic leases with idempotency keys because cron dispatch is at-least-once.",
      "Inbound replies arrive through an svix-verified webhook; a daily cron sweep chases non-responders and handles bounces and complaints.",
    ],
    outcome: [
      "A complete agentic loop — research, outreach, reply interpretation, follow-up — built in a four-day sprint.",
      "Commit history tracks real failure-mode engineering: bounce and complaint handling, a post-research stall fixed by gating before archive, and a start-fresh race where an unload flush was resurrecting the cleared session.",
      "Deliberately gated: access-code protected, and outreach mode defaults to dry run. Built and architected for live sending; not turned loose at scale.",
    ],
    links: [
      {
        label: "LIVE.DEMO",
        href: "https://vendor-scout-jwerba-jared-werbas-projects.vercel.app",
        primary: true,
        note: "Vercel password: fernwood2027",
        display: "vendor-scout",
      },
    ],
  },
  {
    id: "04",
    name: "LINKEDIN-AUTOMATOR",
    tagline:
      "A local-first LLM agent that ran real outreach against live LinkedIn, and knew when to stop.",
    tier: 1,
    accent: "orange",
    status: "RAN IN PRODUCTION",
    stack: [
      "Python",
      "FastAPI",
      "Playwright",
      "Ollama llama3.1:8b",
      "WebSockets",
      "Vanilla JS",
    ],
    problem:
      "Prospecting is high-volume, low-leverage repetition, and every commercial tool for it is SaaS that wants your LinkedIn credentials and your prospect data on someone else's servers. I set a constraint that made the problem harder on purpose: everything local. The operator's own Chrome session, a model running on the operator's own machine, and no data leaving it. No headless scraping, no unofficial APIs.",
    built: [
      "Removed the company name from the connection-note prompt to eliminate a whole class of hallucination. The model was inventing facts about companies it knew nothing about; role alone produces an honest opener. The parameter is still threaded through the function signature — it just never reaches the prompt.",
      "Budgeted temperature and tokens per task instead of using one default. Title scoring runs at temperature 0.1 with max_tokens 5, because it wants a single integer; message generation runs at 0.8 with 120. One model, used as four different tools.",
      "A complete output-safety loop for generated text: generate, validate against a curated blocklist of AI tells, retry up to three times, fall back to a deterministic safe string, then hard-constrain length on a word boundary so a note can never exceed LinkedIn's limit.",
      "Two-tier scoring that degrades silently. The LLM scores seniority; if it errors or is unavailable, a deterministic keyword scorer takes over and the run continues. Which scorer made each call is persisted per row, so every decision stays auditable after the fact.",
      "Reply detection as a stopping condition: query both message-bubble classes in one selector so DOM order is preserved, take the last element, and read which class it carries. They spoke last means they replied, which means stop contacting them.",
      "Anti-detection as architecture, not a hack: the real Chrome binary with a persistent logged-in profile, AutomationControlled disabled, the enable-automation flag stripped, navigator.webdriver masked at page init, interpolated mouse movement and per-character typing jitter. Never headless.",
      "Safety enforced at three levels — per run, per day, per week — plus cooperative pause and stop, CAPTCHA detection at every stage, sixteen distinct named skip paths so no single failure can crash a run, and a WebSocket disconnect that stops the automation when the operator closes the tab.",
      "Discovered that LLM latency was itself a source of automation bugs: the compose box went stale during the model call and the element handle died. The fix was re-querying after the model returns — not something you learn without shipping an agent against a live DOM.",
    ],
    outcome: [
      "Ran end-to-end against live LinkedIn across 20 logged runs over 8 days, with a full step-by-step trace on disk.",
      "Reply detection worked autonomously in production: of five messaged prospects, it correctly identified two who had replied and suppressed their follow-ups. The recorded reply timestamps match the run header to the minute. The agent's most consequential decision was the decision not to act.",
      "89 profile interactions logged over six weeks, with a 47/89 action success rate against a hostile, constantly-changing DOM.",
      "Grew from a personal script into a packaged tool with a one-click launcher for non-technical users — the commit history shows the arc from 'fix' and 'working' to scoped conventional commits.",
      "The acceptance-rate tracker is the honest failure: I built it, the scraper's selectors broke, and it reported zero. Knowing which of your own metrics to trust is part of the job.",
    ],
    links: [
      { label: "SOURCE", href: "https://github.com/jaredwerba/linkedin-automator" },
    ],
  },
  {
    id: "05",
    name: "COVE",
    tagline: "Grounded generation — a conversational assistant that cannot make up its facts.",
    tier: 1,
    accent: "cyan",
    status: "LIVE",
    stack: ["TypeScript", "gpt-4o", "Upstash Redis", "Next.js", "WebAuthn", "Leaflet"],
    problem:
      "A conversational assistant for a regulated market has to be useful without speculating. Vermont cannabis retail has real inventory, real licensed locations, and real legal limits on what anyone can advise — so the interesting engineering is not the chat, it is guaranteeing the model only ever speaks from data that is actually true right now.",
    built: [
      "Three context layers assembled per request: a live inventory snapshot from Redis, the user's stored preferences and favourites, and — if location is shared — the three nearest licensed dispensaries computed by haversine distance, so recommendations cite real mileage instead of guessing.",
      "Each enrichment is individually error-isolated, so an unreachable Redis degrades the answer instead of taking the assistant down.",
      "A deliberately sectioned system prompt — persona, style, format, safety, data — so tuning one axis does not disturb the others. The comment in the file explains the rule: keep sections short and testable, because bloat in one weakens the rest.",
      "Safety constraints enforced in the prompt: 21+, no medical or dosing advice, and no speculation beyond the injected data.",
      "Temperature pinned at 0.7, tighter than the default, for consistency; max_tokens capped at 800 to prevent runaway generations.",
      "Around the assistant: a QR-code passport trail, a dispensary map, a B2B dashboard, and real WebAuthn passkey auth.",
    ],
    outcome: [
      "211 commits — the most sustained project I have built, developed over roughly three months.",
      "Deployed and running, with the retrieval layer, auth, and B2B surface all live.",
      "Worth being precise about what this is: context engineering and grounded retrieval done carefully. It is not an agent, and I would not describe it as one.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://www.covebud.com", primary: true }],
  },

  // ── Tier 2 — shipped products ──
  {
    id: "06",
    name: "GO DOGS BOSTON",
    tagline: "Runners matched with high-energy dogs who need the miles.",
    tier: 2,
    accent: "green",
    status: "LIVE // rundog.boston",
    stack: ["Next.js", "Neon Postgres", "WebAuthn", "Leaflet", "three.js", "Resend"],
    problem:
      "Shelter dogs need exercise; runners want company. Nothing existed to match them and handle the logistics.",
    built: [
      "Group run scheduling and booking, Leaflet route pages, participant management, in-app messaging with unread state, weather integration, calendar export, and a dog-miles tracker.",
      "Passkey authentication over iron-session, Neon serverless Postgres, transactional email via Resend.",
      "Wrote an end-to-end booking test harness after auditing my own booking flow and finding five production bugs.",
    ],
    outcome: [
      "Live on a custom domain with real pre-launch work done: terms, privacy, branded 404, social share image, sitemap, and self-serve account deletion.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://rundog.boston", primary: true }],
  },
  {
    id: "07",
    name: "TRAIN247",
    tagline: "Multi-tenant coaching SaaS — a personal trainer's whole business in one app.",
    tier: 2,
    accent: "orange",
    status: "LIVE // train247.fit",
    stack: ["Next.js", "Prisma", "Postgres", "Stripe Connect", "WebAuthn", "Vercel Blob"],
    problem:
      "Independent trainers pay per-seat for tools built for gyms. I wanted to know what it takes to build the whole surface a solo trainer actually needs, and whether the economics of a take-rate model work at that scale.",
    built: [
      "31,000 lines across 33 data models: workout building, program assignment, set and rep logging, meal and water tracking, habits, body stats, forms, messaging, and appointments.",
      "Stripe Connect take-rate payment rails, and a solo mode that deploys N branded single-trainer instances from one repo.",
      "Migrations run as part of the build, so schema changes ship with the deploy rather than beside it.",
    ],
    outcome: [
      "The largest codebase I have written, live on a custom domain.",
      "The roadmap includes an honest feature-gap audit against the incumbent — including where their conversational AI builder beats my deterministic one. Worth knowing precisely where you lose.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://train247.fit", primary: true }],
  },
  {
    id: "08",
    name: "SUNDAY ENERGY",
    tagline: "A residential solar proposal, generated from an address in about a minute.",
    tier: 2,
    accent: "cyan",
    status: "BUILT IN 2 DAYS",
    stack: ["Google Solar API", "NREL API", "Neon Postgres", "Vercel Functions"],
    problem:
      "Getting a solar quote means a sales visit and a wait. Every input needed to model the decision — roof geometry, sun exposure, local rates, incentive structure — is available programmatically.",
    built: [
      "Google Solar API integration for precise roof geometry, panel placement, and an annual solar-flux heatmap overlaid on live satellite imagery.",
      "NREL utility rate lookup, plus 25-year ROI modelling including SMART 3.0, net metering, and state tax credits — generalised from Massachusetts-specific to all 50 states.",
      "Nine serverless endpoints, Neon Postgres persistence, shareable proposal links, and an admin view.",
      "Moved a hardcoded Google API key out of the client and behind serverless proxies — the kind of thing worth fixing before anyone else finds it.",
    ],
    outcome: [
      "A working proposal engine, built over a weekend, that turns a street address into a costed 25-year financial model.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://sunday-energy.vercel.app", primary: true }],
  },
  {
    id: "09",
    name: "GOALSRUN",
    tagline: "Booking platform for an elite Boston runner's coaching and brand work.",
    tier: 2,
    accent: "green",
    status: "LIVE",
    stack: ["Next.js", "Drizzle", "Postgres", "better-auth", "Vercel Cron"],
    problem:
      "A coach taking bookings by DM loses sessions to scheduling friction and has no view of their own pipeline.",
    built: [
      "Slot generation across multiple locations maintained by a daily cron that keeps a rolling 180-day horizon.",
      "Passkey auth, a partners and sponsors surface, and a role-split admin — operator view for running the day, owner view for the business.",
    ],
    outcome: [
      "73 commits on a real feature-branch workflow, with commit messages that name the production bugs they fix.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://www.goalslopes.run", primary: true }],
  },
  {
    id: "10",
    name: "JWERBA.COM",
    tagline: "This site — and more third-party integration than it looks like.",
    tier: 2,
    accent: "orange",
    status: "LIVE // you are here",
    stack: ["Next.js 16", "React 19", "Drizzle", "better-auth", "Resend", "Vercel Cron"],
    problem:
      "A portfolio is a good excuse to build the unglamorous parts properly rather than reaching for a service that hides them.",
    built: [
      "A hand-rolled Whoop OAuth 2.0 client — six scopes, authorise, code exchange, and refresh written directly against their API rather than wrapped by an SDK.",
      "WebAuthn passkeys alongside magic-link auth, including the origin-binding work to make passkeys behave correctly across preview and production domains.",
      "An RFC 5545 ICS generator written from scratch, with correct line endings and text escaping, so accepted ride invites land properly in Apple, Google, and Outlook calendars.",
      "Drizzle and Postgres across eight tables, two production cron jobs, and transactional email that degrades gracefully instead of crashing when unconfigured.",
    ],
    outcome: [
      "Running in production on a custom domain, with the booking flow, auth, and scheduled jobs all live.",
    ],
  },
  {
    id: "11",
    name: "TRAINER SITE TEMPLATE",
    tagline: "One client site, productised — second client onboarded in two days.",
    tier: 2,
    accent: "cyan",
    status: "2 DEPLOYMENTS",
    stack: ["Next.js", "Drizzle", "better-auth", "Postgres"],
    problem:
      "Having built a booking site for one personal trainer, the second one should not cost the same as the first.",
    built: [
      "Extracted the first build into a reusable template with an onboarding guide, then onboarded a second client — identity, branding, and copy swapped — in two days.",
      "Real WebAuthn production debugging along the way: forcing the platform authenticator for registration, fixing trusted origins on a custom domain, and tracking down a trailing newline in an environment variable that was breaking auth.",
    ],
    outcome: ["Two live client deployments from one codebase."],
    links: [
      { label: "DAVIDWILLFIT.COM", href: "https://www.davidwillfit.com", primary: true },
      { label: "NICKSCALIHEALTH.COM", href: "https://www.nickscalihealth.com", primary: true },
    ],
  },

  // ── Tier 3 — brief mentions ──
  {
    id: "12",
    name: "CAREER-OPS",
    tagline: "Open-source contributions to a multi-agent job-search system.",
    tier: 3,
    accent: "green",
    status: "OSS // #3 CONTRIBUTOR",
    stack: ["Node.js", "Playwright", "launchd"],
    problem:
      "An open-source AI job-search project I use daily had a parallel scanner that was slower than running it sequentially.",
    built: [
      "33 commits to santifer/career-ops as its third-largest contributor: metro-region seed discovery, five enterprise-VC portfolio fetchers, a parser that took one source from 0 to 855 companies, and a two-tier scan schedule.",
      "Diagnosed and fixed a worker-pool starvation bug with a measurement, not a hunch: one seed held 6 of 40 workers for 1h17m while 34 slots sat idle, and the sequential run at 20 workers finished the same work in 28 minutes. Replaced the fixed split with a shared pool where finished seeds hand their slots back.",
      "Extracted one shared fit-scoring model so the terminal shortlist and the web dashboard could not drift apart, and moved candidate facts out of the public repo.",
    ],
    outcome: [
      "Running on a schedule via launchd since July — 7,598 job rows across 2,220 companies and 28 ATS portals.",
      "The scheduling fix has its own story: an 8am-only trigger silently lost any day the machine was asleep, which cost six days before I caught it.",
    ],
  },
  {
    id: "13",
    name: "RESUME AUDIT GATE",
    tagline: "A deterministic validator that fails the build when a model's output drifts.",
    tier: 3,
    accent: "orange",
    status: "TOOLING",
    stack: ["Python", "Claude Agent Skill"],
    problem:
      "A generation pipeline where the model both held the facts and the rules produced different output every run. Two files each thought they were in charge, and on the questions that mattered they disagreed.",
    built: [
      "Separated facts from rules so there is nothing to adjudicate at generation time, then added a deterministic pre-flight script that runs after generation and exits non-zero on failure — checking voice, length caps, and identity leaks.",
      "The script documents its own regression: an earlier version substring-matched across the whole page and hard-failed builds for legitimately naming a stack.",
    ],
    outcome: [
      "Non-deterministic output became a build that either passes a checkable contract or stops.",
    ],
  },
  {
    id: "14",
    name: "WHOOP-MCP",
    tagline: "Model Context Protocol server that puts my own biometrics in front of an LLM.",
    tier: 3,
    accent: "green",
    kind: "operates",
    status: "DAILY DRIVER",
    stack: ["TypeScript", "MCP SDK", "Zod", "WHOOP API", "OAuth 2.0"],
    problem:
      "Recovery, sleep and strain data sits locked inside a phone app. I wanted it queryable in natural language, in the same session as everything else I am working on.",
    built: [
      "Exposes six tools over MCP — recovery, sleep, cycles, workouts, profile, and body measurement — each with a Zod-validated schema.",
      "Runs a full OAuth 2.0 flow against the real WHOOP API, with a local callback server and a persisted token store handling refresh.",
    ],
    outcome: [
      "I run it as a connected MCP server most days, which is where a lot of my practical feel for the protocol comes from — how tool schemas shape what a model will actually call, how much description a tool needs before it gets used correctly, and what token lifecycle management looks like when an agent is the consumer.",
      "It also set the bar for my own Whoop OAuth client on jwerba.com — having used someone else's implementation daily made the tradeoffs in mine much more obvious.",
    ],
    links: [
      { label: "SOURCE", href: "https://github.com/shashankswe2020-ux/whoop-mcp" },
    ],
  },
  {
    id: "15",
    name: "DEXTER",
    tagline: "A LangGraph research agent I run in the terminal.",
    tier: 3,
    accent: "cyan",
    kind: "operates",
    status: "DAILY DRIVER",
    stack: ["TypeScript", "LangGraph", "LangChain", "Ink TUI", "OpenRouter"],
    problem:
      "I wanted a working, non-toy agent in my daily rotation — something with subagents, an eval harness and multi-model routing that I could actually use rather than just read about.",
    built: [
      "A financial research agent built on LangChain and LangGraph, with delegated subagents, an evaluation harness, OpenRouter routing across model providers, and an Ink-based terminal interface.",
    ],
    outcome: [
      "Running it daily is a large part of how I formed opinions about LangGraph before I built my own graph for the Nebius take-home — particularly around where the prebuilt agent stops being the right abstraction, and why an eval harness needs baselines rather than a single score.",
      "Reading and operating other people's agent code is underrated. Most of what I know about failure modes came from watching someone else's agent hit them first.",
    ],
    links: [{ label: "SOURCE", href: "https://github.com/virattt/dexter" }],
  },
  {
    id: "16",
    name: "LUNARFORGE",
    tagline: "A WebGL showcase disguised as a landing page.",
    tier: 3,
    accent: "cyan",
    status: "LIVE",
    stack: ["three.js", "GSAP", "Zustand", "Next.js"],
    problem: "An excuse to build a cinematic real-time graphics pipeline in the browser.",
    built: [
      "A PBR render pipeline, a ballistic regolith ejecta particle simulation, and a GSAP-driven scroll sequence that assembles a reactor from dust, with an orbit camera and hand-built animated SVG scenes using no image assets.",
    ],
    outcome: [
      "Pure front-end graphics craft. The company is fictional and the site says so.",
    ],
    links: [
      { label: "LIVE.SITE", href: "https://space-forge-taupe.vercel.app/eb", primary: true },
    ],
  },
];

export const TIER_1 = NEBIUS_PROJECTS.filter((p) => p.tier === 1);
export const TIER_2 = NEBIUS_PROJECTS.filter((p) => p.tier === 2);
export const TIER_3 = NEBIUS_PROJECTS.filter((p) => p.tier === 3);
