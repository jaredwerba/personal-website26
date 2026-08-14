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
 *
 * Copy style: ASD-STE100 (Simplified Technical English) plus Zinsser's four
 * rules — simplicity, brevity, clarity, humanity. Short sentences. One idea
 * per sentence. Active voice. First person kept throughout, since that is
 * where the humanity lives.
 */
export const NEBIUS_PROJECTS: NebiusProject[] = [
  {
    id: "01",
    name: "NEBIUS-XWORD",
    tagline: "A crossword agent, plus a test harness that proves it is good.",
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
      "The task had three parts. Build an agent that solves crosswords. Build a way to test it. Write clear instructions. Solving a puzzle is the easy part. The hard part is proof: how do I know the agent is good, not lucky? And how do I stop one wrong answer from breaking the whole grid?",
    built: [
      "I split the work in two. A Python engine owns the grid: the slots, the numbers, the crossing rules. The model owns only the answers. If the model gives a wrong answer, the engine rejects it and gives a reason. The model can fail. It can never break the grid.",
      "I built my own LangGraph, not the standard prebuilt agent. My stop rule is different: the run must end on a submit call, not on silence. The graph has three nodes — agent, tools, and a nudge node. The nudge node pushes the model back to tool calls if it answers in plain text. It nudges at most three times, so the run always ends.",
      "I capped the context window. Without a cap, each turn resends the full history, and cost grows with the square of the turn count — one 40-turn solve used 1.09 million tokens. My cap keeps the system prompt, the first grid, and the newest messages. It also drops any orphan tool result, since the API rejects a tool message with no matching call.",
      "I built a test harness that checks itself. Four solvers run through the same scoring code. An empty solver must score 0%. If it does not, the scorer is broken. An oracle solver must score 100%. A backtrack solver fills real words but ignores every clue — it scores about 9%. Any score above that line is the model's real skill at reading clues.",
      "I chose models by testing, not by name. I read the live model catalog first, and found that DeepSeek V4 Flash has no tool support at all. I screened 13 candidates, then ran the rest through 5 models, 2 services, 4 puzzles, 2 runs each. The README lists every failure next to every win.",
      "I measured the prompt itself. One rule told the agent to call get_state first — that wasted a turn, since the first message already has the grid. Another rule made the agent confirm before it submits — that cost 200 seconds to recheck a grid the engine had already checked. I removed both rules. One solve dropped from 420 seconds to 153.",
    ],
    outcome: [
      "I pointed the agent at a real newspaper crossword: a 13x13 grid, 60 entries. DeepSeek V4 Pro on Nebius filled and submitted the whole grid. All 60 entries were correct. Every crossing checked out. It took 98 turns, 16.6 minutes, and 2.44 million tokens — about $4.40.",
      "That one run led to two fixes in the agent: the context window, and the nudge step that recovers a model stuck in plain text.",
      "I raced the same model on two providers. Nebius averaged 17.5 seconds. The other gateway averaged 53.7 seconds. The page marks this n=4 — a small sample, not a full benchmark.",
      "Running both providers at once found a real bug. On a cold start, the environment loaded late, and a fallback chain sent the wrong key to the wrong provider. I fixed the bug and added a test to catch it again.",
      "The project has 55 tests. None needs an API key or a network. A fake model drives the whole graph offline.",
    ],
    links: [
      { label: "LIVE.DEMO", href: "https://nebius-xword.vercel.app", primary: true },
      { label: "SOURCE", href: "https://github.com/jaredwerba/Nebius-XWord" },
    ],
  },
  {
    id: "02",
    name: "BRAINSTORM.AI",
    tagline: "Brain signals, read as attention, in real time. First place at an MIT hackathon.",
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
      "Our online lives connect to almost everything, but not to our own mind. Most apps guess your interest from your clicks. A system that reads real attention could do better. It could show you what actually holds your focus, not just what you opened. For a student, it could show which lesson is really landing.",
    built: [
      "A pipeline that reads brain signals and scores attention. It takes 6-channel EEG at 250Hz from an OpenBCI Ultracortex headset. It runs the signal through the NeuroLM neural network. For each 1 to 10 second window, it outputs an attention score, an engagement score, and a 512-number embedding.",
      "A way to recommend content. The system compares a live embedding to embeddings from past videos, then suggests the content that best holds that person's attention.",
      "A wearable camera on a Seeed XIAO ESP32S3 board. It takes a photo the moment attention or engagement crosses a threshold. This pairs the brain signal with what the person was really looking at.",
      "The public site, brain-storm.ai. I built and shipped it alone, in the six days after the hackathon: 28 commits, a v0.0/v1.0 roadmap, a signup form, analytics, animation, and a full mobile pass.",
      "The hardest problems were physical, not just code. EEG readings would corrupt mid-capture. The capture software was unreliable. Wiring the model output into a live frontend took real work. Getting WiFi running on the XIAO board took real work too.",
    ],
    outcome: [
      "First place, Long Track, at AugHacks 2025. Hosted by Augmentation Lab at MIT in Cambridge.",
      "Judges included two MIT Media Lab researchers, plus founders from PRISM, LONG, and MorphoAI. Sponsors included Meta and AWS.",
      "The organizers invited us to show our work at the MIT Media Lab Augmentation Summit.",
      "A working brain-computer interface, built in 24 hours, by a team of three. None of us had a neuroscience background going in.",
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
    tagline: "Agents that research wedding vendors at once, then email them for you.",
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
      "Planning a wedding feels emotional. Underneath, it is a research problem. There are four vendor types. Each needs its own search, its own shortlist, its own outreach. The couple becomes the bottleneck on every thread. I wanted to test one thing: can an agent own the whole loop — research, contact, follow-up, and reading the replies — without ever inventing a vendor or a price?",
    built: [
      "Four specialist sub-agents, one each for venue, photography, catering, and florals/music. They run in parallel, up to four at once. Each agent gets no shared history. This forces each brief to carry all the context it needs, since it cannot rely on context it cannot see.",
      "A reply classifier with structured output. A Zod schema, run through generateObject, returns intent, availability, price info, questions, and sentiment. If the model fails or the output fails to parse, the system falls back to a keyword check. It logs which path ran. It never silently guesses.",
      "The classifier prompt encodes real mistakes I made. A line like 'we're not taking a deposit until you confirm the date' is not a decline — the prompt says so. Quoted text below an 'On ... wrote:' line is the couple speaking, not the vendor — the prompt says that too.",
      "I replaced the framework's built-in web search with a Tavily-backed tool. The built-in search ties research to one model vendor. Swap the model, and research breaks with no warning. A Tavily-backed tool keeps research working no matter which model runs the agent.",
      "I put layered safety on the one tool with real-world side effects: sending email. Approval is graded, not all-or-nothing. A human in the loop pauses the send for approval. An unattended run checks a pre-set authorization and a cap instead, so it never sits stuck on a question no one can answer. Every send is re-checked right before it goes out, since approval is a gate, not a blank check. Outreach runs in three modes: dry run, test inbox, or live. Sends are capped per vendor and per day. A cron job can fire more than once, so each send carries a lock and an ID to stop duplicates.",
      "Inbound replies arrive through a webhook, checked with svix. A daily cron job follows up with vendors who have not replied. It also handles bounces and complaints.",
    ],
    outcome: [
      "A full agent loop: research, outreach, reply reading, follow-up. Built in a four-day sprint.",
      "The commit history shows real bug fixes. One added bounce and complaint handling. One fixed a stall after research, by gating a step before archiving. One fixed a race bug: closing the tab was bringing back a session I had just cleared.",
      "The demo is gated on purpose. It needs an access code, and outreach defaults to dry run. I built it to send live email. I have not turned it loose at scale.",
    ],
    links: [
      {
        label: "LIVE.DEMO",
        href: "https://vendor-scout-xi.vercel.app",
        primary: true,
        note: "Vercel password: fernwood2027",
      },
    ],
  },
  {
    id: "04",
    name: "LINKEDIN-AUTOMATOR",
    tagline: "A local LLM agent that ran real outreach on LinkedIn — and knew when to stop.",
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
      "Prospecting is a lot of low-value, repeat work. Every commercial tool for it is SaaS, and each one wants your LinkedIn password and your prospect data on their servers. I set myself a harder rule on purpose: keep it all local. Use my own Chrome session. Run the model on my own machine. Let no data leave it. No headless scraping. No private APIs.",
    built: [
      "I removed the company name from the connection-note prompt. This killed a whole class of made-up facts — the model was inventing details about companies it did not know. Role alone gives an honest opening line. The company name still exists as a function argument. It just never reaches the prompt.",
      "I set temperature and token limits per task, not one default for all. Title scoring runs at temperature 0.1 with a 5-token limit, since it needs one number. Message writing runs at 0.8 with a 120-token limit. One model does the work of four different tools.",
      "A full safety loop for every generated message. First, generate the text. Then check it against a list of common AI tells. If it fails, retry, up to three times. If it still fails, fall back to a fixed safe line. Last, cut the text at a word boundary, so it never breaks LinkedIn's length limit.",
      "A two-step score for seniority. The LLM scores it first. If the LLM fails or is down, a keyword scorer takes over, and the run keeps going. Each row logs which scorer made the call, so I can check every score later.",
      "A stop rule based on replies. One query reads both message-bubble types in DOM order and checks the last message. If the last message is theirs, they replied. If they replied, the agent stops contacting them.",
      "I built anti-detection into the design, not bolted it on after. The agent uses the real Chrome binary with a real, logged-in profile. It disables the AutomationControlled flag and strips the enable-automation flag. It hides navigator.webdriver at page load. Mouse moves follow a real path, not a straight line. Typing has small random delays, letter by letter. It never runs headless.",
      "Safety limits apply at three levels: per run, per day, per week. I can pause or stop the run at any point. The agent checks for a CAPTCHA at every stage. It has 16 named skip paths, so one failure never crashes the whole run. If I close the browser tab, the WebSocket drops, and the run stops.",
      "I found that model delay itself caused bugs. While the model call ran, the compose box would go stale, and the page handle would die. The fix was to re-query the box after the model returned. I only learned this by running an agent against a real, live web page.",
    ],
    outcome: [
      "I ran it end to end on live LinkedIn: 20 logged runs over 8 days. Every step is traced to disk.",
      "Reply detection worked on its own, in production. Of 5 people I messaged, 2 replied. The agent caught both and stopped their follow-ups on its own. The reply timestamps match the run log to the minute. The agent's most important choice was the choice to do nothing.",
      "89 profile actions logged over 6 weeks. 47 of 89 actions succeeded, against a page that changes often and is built to resist automation.",
      "It grew from a personal script into a packaged tool, with a one-click launcher for non-technical users. The commit history shows the change: early commits just say 'fix' and 'working'; later ones follow a clear commit format.",
      "One part failed, and I own it. I built an acceptance-rate tracker. Its scraper broke, and it reported zero every time. Knowing which of your own numbers to trust is part of the job.",
    ],
    links: [
      { label: "SOURCE", href: "https://github.com/jaredwerba/linkedin-automator" },
    ],
  },
  {
    id: "05",
    name: "COVE",
    tagline: "A chat assistant that cannot make up its facts.",
    tier: 1,
    accent: "cyan",
    status: "LIVE",
    stack: ["TypeScript", "gpt-4o", "Upstash Redis", "Next.js", "WebAuthn", "Leaflet"],
    problem:
      "A chat assistant for a regulated market must help without guessing. Vermont cannabis retail has real stock, real licensed stores, and real legal limits on advice. The hard engineering here is not the chat. It is making sure the model only ever speaks from data that is true right now.",
    built: [
      "Three layers of context, built fresh for each request. A live stock snapshot from Redis. The user's saved preferences and favorites. And, if the user shares location, the three nearest licensed stores, by real distance. This lets the assistant give a real mileage, not a guess.",
      "Each layer fails on its own, without breaking the rest. If Redis goes down, the answer gets weaker. The assistant still works.",
      "A system prompt split into clear sections: persona, style, format, safety, data. I can tune one section without breaking the rest. A comment in the file states the rule: keep each section short and testable, since a bloated section weakens all the others.",
      "The prompt enforces three safety rules. Users must be 21 or older. No medical or dosing advice. No guessing beyond the real data given to it.",
      "Temperature is fixed at 0.7, below the default, for a more consistent answer. Token output is capped at 800, to stop a runaway reply.",
      "Around the assistant sit four more features: a QR-code passport trail, a store map, a B2B dashboard, and real WebAuthn passkey login.",
    ],
    outcome: [
      "211 commits. This is the project I have worked on the longest, over about three months.",
      "It is deployed and live. The retrieval layer, the login, and the B2B side all run in production.",
      "I want to be precise here. This is careful context engineering and grounded retrieval. It is not an agent. I would not call it one.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://www.covebud.com", primary: true }],
  },

  // ── Tier 2 — shipped products ──
  {
    id: "06",
    name: "GO DOGS BOSTON",
    tagline: "Runners, matched with high-energy dogs that need the miles.",
    tier: 2,
    accent: "green",
    status: "LIVE // rundog.boston",
    stack: ["Next.js", "Neon Postgres", "WebAuthn", "Leaflet", "three.js", "Resend"],
    problem:
      "Shelter dogs need exercise. Runners want company on a run. No tool matched the two, or handled the logistics.",
    built: [
      "Group run scheduling and booking. Route pages built on Leaflet. A way to manage who is running. In-app messages, with an unread marker. A weather check. Calendar export. A tracker for dog miles run.",
      "Passkey login, built on iron-session. A serverless Postgres database from Neon. Transactional email through Resend.",
      "I audited my own booking flow and found five bugs in production. I then wrote a full end-to-end test for the booking flow.",
    ],
    outcome: [
      "Live on its own domain, with real pre-launch work done: terms, privacy policy, a branded 404 page, a social share image, a sitemap, and self-serve account deletion.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://rundog.boston", primary: true }],
  },
  {
    id: "07",
    name: "TRAIN247",
    tagline: "Coaching software for many trainers — one app that runs a trainer's whole business.",
    tier: 2,
    accent: "orange",
    status: "LIVE // train247.fit",
    stack: ["Next.js", "Prisma", "Postgres", "Stripe Connect", "WebAuthn", "Vercel Blob"],
    problem:
      "Independent trainers pay per seat for tools built for gyms, not for them. I wanted to know two things. What does a solo trainer really need? And does a take-rate business model work at that scale?",
    built: [
      "31,000 lines of code, across 33 data models. It covers workout building, program assignment, set and rep logging, meal and water tracking, habit tracking, body stats, forms, messages, and appointments.",
      "Stripe Connect payment rails, with a take rate. A solo mode that deploys many branded, single-trainer copies from one codebase.",
      "Database migrations run as part of the build. A schema change ships with the deploy, not beside it.",
    ],
    outcome: [
      "The largest codebase I have written. Live on its own domain.",
      "The roadmap includes an honest gap check against the market leader. It states where their chat-based AI builder beats my rule-based one. It is worth knowing exactly where you lose.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://train247.fit", primary: true }],
  },
  {
    id: "08",
    name: "SUNDAY ENERGY",
    tagline: "A home solar proposal, built from just an address, in about a minute.",
    tier: 2,
    accent: "cyan",
    status: "BUILT IN 2 DAYS",
    stack: ["Google Solar API", "NREL API", "Neon Postgres", "Vercel Functions"],
    problem:
      "A solar quote today means a sales visit and a wait. Every input needed to model the decision is available through an API: roof shape, sun exposure, local rates, and incentives.",
    built: [
      "A Google Solar API integration. It gives exact roof shape, panel placement, and a year of sun exposure, drawn as a heatmap over live satellite imagery.",
      "A rate lookup through NREL. A 25-year return model, covering SMART 3.0, net metering, and state tax credits. It started built for Massachusetts. I made it work for all 50 states.",
      "Nine serverless endpoints. A Postgres database on Neon. Shareable links for each proposal. An admin view.",
      "I found a Google API key hardcoded in the client. I moved it behind serverless proxies. This is the kind of bug worth fixing before someone else finds it.",
    ],
    outcome: [
      "A working proposal engine, built over one weekend. It turns a street address into a full 25-year cost model.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://sunday-energy.vercel.app", primary: true }],
  },
  {
    id: "09",
    name: "GOALSRUN",
    tagline: "A booking platform for an elite Boston runner's coaching and brand deals.",
    tier: 2,
    accent: "green",
    status: "LIVE",
    stack: ["Next.js", "Drizzle", "Postgres", "better-auth", "Vercel Cron"],
    problem:
      "A coach who takes bookings by DM loses sessions to scheduling trouble. They also have no clear view of their own pipeline.",
    built: [
      "Time slots across several locations. A daily cron job keeps a rolling 180-day window open.",
      "Passkey login. A page for partners and sponsors. Two admin views: one for running the day, one for running the business.",
    ],
    outcome: [
      "73 commits, on a real feature-branch workflow. Each commit message names the exact production bug it fixes.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://www.goalslopes.run", primary: true }],
  },
  {
    id: "10",
    name: "JWERBA.COM",
    tagline: "This site. More real integration work than it looks like.",
    tier: 2,
    accent: "orange",
    status: "LIVE // you are here",
    stack: ["Next.js 16", "React 19", "Drizzle", "better-auth", "Resend", "Vercel Cron"],
    problem:
      "A portfolio is a good excuse to build the unglamorous parts myself, instead of hiring a service to hide them.",
    built: [
      "A Whoop OAuth 2.0 client, written by hand. It covers six scopes: authorize, code exchange, and refresh. I wrote it against their raw API, not through an SDK.",
      "WebAuthn passkeys, next to magic-link login. This included origin-binding work, so passkeys work right across preview and production domains.",
      "An RFC 5545 calendar file generator, written from scratch. It gets the line endings and text escaping right, so ride invites open cleanly in Apple, Google, and Outlook calendars.",
      "Drizzle and Postgres, across eight tables. Two cron jobs run in production. Transactional email fails gracefully, not with a crash, when it is not set up.",
    ],
    outcome: [
      "Running in production, on its own domain. The booking flow, the login, and the cron jobs are all live.",
    ],
  },
  {
    id: "11",
    name: "TRAINER SITE TEMPLATE",
    tagline: "One client site, turned into a product. A second client onboarded in two days.",
    tier: 2,
    accent: "cyan",
    status: "2 DEPLOYMENTS",
    stack: ["Next.js", "Drizzle", "better-auth", "Postgres"],
    problem:
      "I built a booking site for one personal trainer. The second trainer should not cost the same amount of work as the first.",
    built: [
      "I turned the first build into a reusable template, with an onboarding guide. I then onboarded a second client in two days: new identity, new branding, new copy.",
      "I hit real WebAuthn bugs in production along the way. I forced the platform authenticator at registration. I fixed trusted origins on a custom domain. I tracked down a broken login caused by a trailing newline in an environment variable.",
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
    tagline: "Open-source work on a multi-agent job-search system.",
    tier: 3,
    accent: "green",
    status: "OSS // #3 CONTRIBUTOR",
    stack: ["Node.js", "Playwright", "launchd"],
    problem:
      "I use an open-source AI job-search tool every day. Its parallel scanner ran slower than doing the same work one step at a time.",
    built: [
      "33 commits to santifer/career-ops. I am its third-largest contributor. I built metro-region seed discovery, five fetchers for enterprise VC portfolios, a parser that took one data source from 0 to 855 companies, and a two-tier scan schedule.",
      "I found and fixed a worker-pool bug, backed by real numbers, not a guess. One task held 6 of 40 workers for 1 hour 17 minutes, while 34 slots sat idle. A sequential run with just 20 workers finished the same work in 28 minutes. I replaced the fixed split with a shared pool, so a finished task now hands its slots back right away.",
      "I pulled the fit-scoring logic into one shared model. Now the terminal shortlist and the web dashboard can never drift apart. I also moved private candidate facts out of the public repo.",
    ],
    outcome: [
      "It has run on a schedule, through launchd, since July. So far: 7,598 job rows, across 2,220 companies and 28 job-board systems.",
      "The scheduling fix has its own story. The job ran once at 8am. If the machine was asleep, the run just did not happen, with no warning. This cost six lost days before I caught it.",
    ],
  },
  {
    id: "13",
    name: "RESUME AUDIT GATE",
    tagline: "A rule-based check that fails the build when a model's output drifts.",
    tier: 3,
    accent: "orange",
    status: "TOOLING",
    stack: ["Python", "Claude Agent Skill"],
    problem:
      "My pipeline let one model hold both the facts and the rules. It gave a different answer every run. Two files each thought they were in charge. On the questions that mattered, they disagreed.",
    built: [
      "I split facts from rules, so there is nothing left to argue about at run time. I then added a fixed pre-flight script. It runs after generation and stops the build on failure. It checks voice, length limits, and leaked identity details.",
      "The script's own history shows a real mistake. An earlier version matched any substring on the whole page, and failed builds that just named a real tech stack, by mistake.",
    ],
    outcome: [
      "Output that once varied by run now must pass a fixed set of checks. If it fails, the build stops.",
    ],
  },
  {
    id: "14",
    name: "WHOOP-MCP",
    tagline: "An MCP server that puts my own body data in front of an LLM.",
    tier: 3,
    accent: "green",
    kind: "operates",
    status: "DAILY DRIVER",
    stack: ["TypeScript", "MCP SDK", "Zod", "WHOOP API", "OAuth 2.0"],
    problem:
      "Recovery, sleep, and strain data sit locked inside a phone app. I wanted to ask for this data in plain language, in the same session as my other work.",
    built: [
      "It exposes six tools over MCP: recovery, sleep, cycles, workouts, profile, and body measurement. Each tool has a schema checked by Zod.",
      "It runs a full OAuth 2.0 flow against the real WHOOP API. A local callback server handles the login. A saved token store handles the refresh.",
    ],
    outcome: [
      "I run it as a connected MCP server most days. This is where I learned the real feel of the protocol. I learned how a tool's schema shapes what a model will call. I learned how much a tool description needs before a model uses it right. I learned what token lifecycle management looks like when an agent, not a human, is the user.",
      "It also set the bar for my own Whoop OAuth client on jwerba.com. Using someone else's version every day made the tradeoffs in my own version much clearer.",
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
      "I wanted a real agent in daily use, not a toy. Something with subagents, an eval harness, and multi-model routing — something I could actually use, not just read about.",
    built: [
      "A financial research agent, built on LangChain and LangGraph. It has subagents that take on delegated work, an eval harness, OpenRouter routing across model providers, and a terminal interface built with Ink.",
    ],
    outcome: [
      "Running it every day shaped my views on LangGraph, before I built my own graph for the Nebius take-home. I learned where the prebuilt agent stops being the right tool. I learned why an eval harness needs baselines, not just one score.",
      "Reading and running other people's agent code is underrated. Most of what I know about failure modes, I learned by watching someone else's agent hit them first.",
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
    problem: "A reason to build a real-time graphics pipeline in the browser.",
    built: [
      "A PBR render pipeline. A particle simulation of flying lunar dust. A GSAP scroll sequence that builds a reactor out of dust as you scroll. An orbit camera. Hand-built animated SVG scenes, with no image files at all.",
    ],
    outcome: [
      "Pure front-end graphics work. The company is fictional. The site says so.",
    ],
    links: [
      { label: "LIVE.SITE", href: "https://space-forge-taupe.vercel.app/eb", primary: true },
    ],
  },
];

export const TIER_1 = NEBIUS_PROJECTS.filter((p) => p.tier === 1);
export const TIER_2 = NEBIUS_PROJECTS.filter((p) => p.tier === 2);
export const TIER_3 = NEBIUS_PROJECTS.filter((p) => p.tier === 3);
