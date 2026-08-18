/**
 * Resume-voice copy for /nebius-resume.
 *
 * The console page (/nebius) keeps its copy in nebius-projects.ts, unchanged.
 * This file carries the same facts and the same links in the register Jared
 * actually speaks in — the voice pass he approved for the resume page only.
 * Structure, ids, links and claim levels match the console file one for one,
 * so the two pages describe identical work.
 */

import type { Capability, NebiusProject } from "@/lib/nebius-projects";

export const RESUME_CAPABILITIES: Capability[] = [
  // ── AI Applications ──────────────────────────────────────────────────────
  {
    group: "AI Applications",
    label: "Evaluation",
    proof:
      "The eval harness runs four solvers through one scorer. An empty solver must score 0% and an oracle solver must score 100% — if either misses, the scorer itself is broken. The resume orchestrator's gate is a different thing: rule-based, reports document defects, doesn't judge quality. I built a model self-score into it once and deleted it after watching it grade its own output.",
    links: [
      { label: "XWORD.SOURCE", href: "https://github.com/jaredwerba/Nebius-XWord" },
    ],
  },
  {
    group: "AI Applications",
    label: "Agentic systems and tool calling",
    proof:
      "Nebius-XWord is a hand-built LangGraph agent with four tools and a stop rule that fires on a submit call instead of on silence. LinkedIn-Automator ran in production against a live third-party site and stopped messaging anyone who replied. career-ops and my resume skills give a model a defined tool surface and hold it to it.",
    links: [
      { label: "NEBIUS-XWORD", href: "https://nebius-xword.vercel.app", primary: true },
    ],
  },
  {
    group: "AI Applications",
    label: "Sub-agent fan-out, and cutting it back",
    proof:
      "My resume orchestrator fans work out to specialist agents. I cut it from five waves to three stages once I saw the handoffs costing more than they saved. Venus runs four specialist sub-agents in parallel.",
    links: [
      {
        label: "VENUS",
        href: "https://vendor-scout-xi.vercel.app",
        primary: true,
        note: "Vercel password: fernwood2027",
      },
      {
        label: "CAREER-OPS.DASHBOARD",
        href: "https://careerops-jobboard-public.vercel.app",
      },
    ],
  },
  {
    group: "AI Applications",
    label: "RAG and retrieval",
    proof:
      "COVE is RAG end to end over live dispensary menus. Live inventory menus from Leafly are saved to a database first, and answers are grounded in that data once it's integrated — a trimmed slice, strain-matched and deduped to eight per shop, goes into the prompt at request time. I also sold Cohere ReRank at Oracle as a retrieval solution, which is where I learned what re-ranking changes about the text that reaches a prompt.",
    links: [
      { label: "COVEBUD.COM", href: "https://www.covebud.com", primary: true },
      { label: "COHERE.RERANK", href: "https://cohere.com/rerank" },
    ],
  },
  {
    group: "AI Applications",
    label: "MCP",
    proof:
      "I run whoop-mcp as a connected server. It pulls my own health metrics, and the result's live on my site. Daily use is where my feel for the protocol comes from — how much description a tool schema needs before a model calls it right, and what token lifecycle looks like when the consumer is an agent instead of a person.",
    links: [{ label: "SEE.IT.LIVE", href: "https://www.jwerba.com/health", primary: true }],
  },
  {
    group: "AI Applications",
    label: "LLM APIs",
    proof:
      "I build against five providers: Nebius Token Factory, Vercel AI Gateway, OpenAI, Anthropic, and Cohere.",
  },

  // ── Software Engineering ─────────────────────────────────────────────────
  {
    group: "Software Engineering",
    label: "Python",
    proof:
      "Python runs all of it. Nebius-XWord is Python end to end — the LangGraph agent, the FastAPI service, the grid engine, and the eval harness, with 55 tests that run offline. LinkedIn-Automator too: FastAPI, Playwright browser control, WebSockets, and the local model loop. The resume orchestrator's audit gate and PDF layout are Python as well.",
    links: [
      { label: "AUTOMATOR.SOURCE", href: "https://github.com/jaredwerba/linkedin-automator" },
    ],
  },
  {
    group: "Software Engineering",
    label: "Data services",
    proof:
      "For COVE I wrote connectors against three dispensary menu platforms, normalized them into one product model, matched names to a strain catalog, and stored the result in Redis.",
  },

  // ── Infrastructure ───────────────────────────────────────────────────────
  {
    group: "Infrastructure",
    label: "Cloud and GPU platform",
    proof:
      "Ten years at Oracle. I sold and architected every OCI IaaS and PaaS product, including GPU compute for AI training and inference: A100 80GB, H100, and A10. I ran Kubernetes architecture for named accounts, I'm Oracle Cloud Architect certified, and I run my own RDMA cluster at home.",
  },
  {
    group: "Infrastructure",
    label: "Deployment automation",
    proof:
      "career-ops runs on a two-tier scheduler I wrote and still operate. It holds a real lock, recovers a stale one by age, catches up after the machine sleeps, and ends in a guarded production deploy. It's run daily since July and publishes a public dashboard.",
    links: [
      {
        label: "CAREER-OPS.DASHBOARD",
        href: "https://careerops-jobboard-public.vercel.app",
        primary: true,
      },
    ],
  },

  // ── Inference ────────────────────────────────────────────────────────────
  {
    group: "Inference",
    label: "vLLM, SGLang, and sizing the GPU to the model",
    proof:
      "I served two models on one Nebius H200. Model 1 is an uncensored Qwen 27B on vLLM 0.27.1. Model 2 is an abliterated Qwen 35B mixture of experts on SGLang. I sized the GPU before renting it: 55.6 GB of weights, 70 to 80 GB with the KV cache, so one H200 with 141 GB was enough — not the 8-GPU shape, and not the L40S with 48 GB. I set every option myself instead of taking defaults: BF16, a 16384-token context, four concurrent sequences, 0.85 GPU memory use. Model 2 is why there are two servers — vLLM refused its vision-tower weights and SGLang loaded the same repository without a change. Then I measured the serving. A concurrency sweep from 1 to 64 showed my first configuration capping the card at four sequences and 381 tokens a second. Raising that one flag gave 2,128 tokens a second at 32 concurrent, with time to first token down from 21.1 seconds to 3.8.",
  },
  {
    group: "Inference",
    label: "Self-hosted and local serving",
    proof:
      "My home cluster is two Mac minis on RDMA with 48GB of unified memory. It runs MLX and EXO, and it serves Qwen locally to my Hermes agent and to OpenClaw, my always-on outreach agent. LinkedIn-Automator serves llama3.1:8b through Ollama on my own machine, tuned per call: title scoring at temperature 0.1 with a 5-token cap because that job wants one integer, message writing at 0.8.",
  },
  {
    group: "Inference",
    label: "Hosted inference and provider comparison",
    proof:
      "I tested 13 models across two providers, then raced the same weights on both — comparing the providers, not the models. The race runs on the live Nebius-XWord page.",
    links: [{ label: "RUN.THE.RACE", href: "https://nebius-xword.vercel.app", primary: true }],
  },
  {
    group: "Inference",
    label: "Edge and embedded",
    proof:
      "On BrainStorm.ai I embedded NeuroLM, an EEG foundation model, onto OpenBCI hardware. It reads 6-channel EEG at 250Hz.",
    links: [{ label: "NEUROLM.SOURCE", href: "https://github.com/935963004/NeuroLM" }],
  },

  // ── Integrations ─────────────────────────────────────────────────────────
  {
    group: "Integrations",
    label: "OAuth and webhooks, built",
    proof:
      "I knew to use OAuth 2.0 and webhooks. I wrote OAuth 2.0 on jwerba.com and against the WHOOP API. I built signed inbound webhooks in Venus. I integrated Google Solar, NREL, and Stripe Connect in Train247 and Sunday Energy.",
    links: [
      { label: "SUNDAY-ENERGY", href: "https://sunday-energy.vercel.app", primary: true },
    ],
  },
  {
    group: "Integrations",
    label: "Oracle integration stack, sold and architected",
    proof:
      "I sold and architected Oracle Integration Cloud, Oracle GoldenGate, GraphQL, and Apache Kafka.",
  },

  // ── Signals ──────────────────────────────────────────────────────────────
  {
    group: "Signals",
    label: "Hackathons won",
    proof:
      "First place at Augmentation Lab, MIT — AugHacks 2025, Long Track, for BrainStorm.ai.",
    links: [
      { label: "BRAIN-STORM.AI", href: "https://www.brain-storm.ai", primary: true },
    ],
  },
  {
    group: "Signals",
    label: "Open source",
    proof:
      "33 commits in career-ops; I'm the third-largest contributor. The worker-pool fix started with a measurement.",
    links: [
      {
        label: "CAREER-OPS.DASHBOARD",
        href: "https://careerops-jobboard-public.vercel.app",
      },
      { label: "MY.FORK", href: "https://github.com/jaredwerba/career-ops" },
    ],
  },
  {
    group: "Signals",
    label: "Technical writing",
    proof:
      "The Nebius-XWord README runs 550 lines and says plainly what it doesn't measure. The LinkedIn-Automator architecture set runs nine documents, generated from the tool's own logging integration.",
    links: [
      { label: "READ.THE.README", href: "https://github.com/jaredwerba/Nebius-XWord" },
    ],
  },
  {
    group: "Signals",
    label: "Dated public record",
    proof:
      "I've posted what I was reading since 2017, public and dated. The record section below has the full ledger; these four are the ones to open first.",
    links: [
      { label: "INFINIBAND.2019", href: "https://x.com/jaredwerba/status/1170785178681315331" },
      { label: "RDMA.2020", href: "https://x.com/jaredwerba/status/1282138164153536512" },
      { label: "GPT-3.2020", href: "https://x.com/jaredwerba/status/1295451720626188290" },
      { label: "ROCE.2024", href: "https://x.com/jaredwerba/status/1820550430667276400" },
    ],
  },
  {
    group: "Signals",
    label: "Public demos",
    proof:
      "Twelve public demos are live right now: a dog-running community, a coaching platform, two trainer sites, a solar proposal engine, and a WebGL showcase.",
    links: [
      { label: "DAVIDWILLFIT.COM", href: "https://www.davidwillfit.com", primary: true },
      { label: "NICKSCALIHEALTH.COM", href: "https://www.nickscalihealth.com", primary: true },
      { label: "LUNARFORGE", href: "https://space-forge-taupe.vercel.app/eb", primary: true },
      { label: "COVEBUD.COM", href: "https://www.covebud.com", primary: true },
      { label: "TRAIN247.FIT", href: "https://train247.fit", primary: true },
      { label: "GOALSRUN", href: "https://www.goalslopes.run", primary: true },
    ],
  },
];

/** Technical background. No quota figures. */
export const RESUME_BACKGROUND: string[] = [
  "Ten years at Oracle. I sold and architected every OCI IaaS and PaaS product over that span.",
  "GPU compute for AI training and inference: A100 80GB, H100, and A10. Plus HPC and managed databases.",
  "Kubernetes architecture for named enterprise accounts, including Systems & Software in Vermont, on their Enquesta CIS platform.",
  "I ran discovery, architecture reviews, live demos, and POC scoping on my own, as a combined account executive and solutions engineer. I escalated to specialists only when scope demanded it.",
  "Oracle Cloud Architect Associate, 2018 and 2021. I was the first account executive at Oracle to earn it.",
  "The point for this role: I've spent a decade on the other side of the conversation a Nebius FDE has. I've scoped GPU workloads with CTOs, and I know what the buyer is weighing.",
];

export const RESUME_PROJECTS: NebiusProject[] = [
  {
    id: "01",
    name: "NEBIUS-XWORD",
    tagline: "A tool-calling agent, and the eval harness I built to judge it.",
    tier: 1,
    accent: "orange",
    status: "LIVE",
    signals: ["Agentic systems", "Tool calling", "Evaluation", "LLM APIs", "Python", "Platform gap found"],
    stack: [
      "Python",
      "LangGraph",
      "langchain-openai",
      "FastAPI",
      "Nebius Token Factory",
      "Vercel",
    ],
    problem:
      "The task had three parts: build an agent that solves crosswords, build a way to test it, and write clear instructions. Solving the puzzle turned out to be the easy part. The hard questions were how to know the agent is good rather than lucky, and how to stop one wrong answer from corrupting the whole grid.",
    built: [
      "Split the authority. A Python engine owns the grid — slots, numbering, crossing rules — and the model owns only the answers. A wrong answer gets rejected with a reason and the model tries again. The model can fail, but it can't corrupt state.",
      "Wrote the graph myself in LangGraph instead of using its prebuilt agent, because my stop condition is different: the run has to end on a submit tool call, not on the model going quiet. Three nodes — agent, tools, and a nudge node that pushes the model back to tool calls when it answers in prose. The nudge is capped at three, so a model that never calls a tool still terminates.",
      "Built the eval harness before choosing anything. Four solvers run through one scorer. An empty solver must score 0% and an oracle solver must score 100% — if either misses, the scorer itself is broken. A third solver fills real interlocking words while ignoring every clue; it scores about 9%. Anything above that line is what the model contributed by reading clues instead of fitting the grid.",
      "Chose models by measurement. Reading the live Nebius catalog first turned up a gap: DeepSeek V4 Flash advertises no tool support, so it can't drive a tool-calling agent at all. I screened 13 candidates, then ran the survivors through 5 models across 2 services, 4 puzzles, 2 runs each. The README publishes every failure beside every pass.",
      "Capped the context window after measuring what it cost not to. Resending the whole history each turn makes token cost grow with the square of the turn count — one 40-turn solve burned 1.09 million tokens. The cap keeps the system prompt, the opening grid, and the most recent messages. It also drops any tool result whose matching call fell outside the window, because the API rejects a tool message with no call attached.",
      "Measured the prompt itself. One instruction told the agent to call get_state first, which wasted a turn — the opening message already contains the grid. Another made it confirm before submitting, which spent 200 seconds rechecking a grid the engine had already validated. Removing both took one solve from 420 seconds to 153.",
    ],
    outcome: [
      "A real newspaper crossword, 13x13, 60 entries. DeepSeek V4 Pro on Nebius filled and submitted the whole grid. All 60 entries correct, every crossing verified, in 98 turns, 16.6 minutes and 2.44 million tokens — about $4.40.",
      "That run produced two fixes: the context window, and the nudge step that recovers a model stuck in prose.",
      "Same model raced on two providers: Nebius averaged 17.5 seconds, the other gateway 53.7, at n=4.",
      "Running both providers at once exposed a bug single-provider tests couldn't. On a cold start the environment loaded late and a fallback chain sent the wrong key to the wrong provider. Fixed, with a regression test.",
      "55 tests. None needs an API key or a network — a fake model drives the whole graph offline.",
      "The harness takes any puzzle set, the model matrix records which models can and can't drive a tool loop, and the race is a repeatable way to compare two providers on identical weights.",
    ],
    links: [
      { label: "LIVE.DEMO", href: "https://nebius-xword.vercel.app", primary: true },
      { label: "SOURCE", href: "https://github.com/jaredwerba/Nebius-XWord" },
    ],
  },
  {
    id: "02",
    name: "BRAINSTORM.AI",
    tagline: "A model running on live EEG hardware. First place at an MIT-hosted hackathon.",
    tier: 1,
    accent: "green",
    status: "1ST PLACE // AUGHACKS 2025",
    signals: ["Edge inference", "Model deployment", "Hardware integration", "Python"],
    stack: [
      "OpenBCI Ultracortex",
      "NeuroLM",
      "Seeed XIAO ESP32S3",
      "Python",
      "C++",
      "TypeScript",
    ],
    problem:
      "Apps infer your interest from clicks, and clicks are a poor proxy. A system that reads attention directly could recommend what actually holds your focus rather than what you happened to open — and could tell a student which material is really landing. Nobody on the team had a neuroscience background, and we had 24 hours.",
    built: [
      "Embedded the NeuroLM model onto the OpenBCI hardware. This was the core of the build: getting a real model to run against a live sensor rather than a saved file.",
      "A pipeline that reads 6-channel EEG at 250Hz from an OpenBCI Ultracortex headset, runs it through NeuroLM, and outputs an attention score, an engagement score and a 512-number embedding for every 1 to 10 second window.",
      "Content matching. The system compares a live embedding against embeddings from past videos and suggests the content that best holds that person's attention.",
      "A wearable camera on a Seeed XIAO ESP32S3 board. It takes a photo the moment attention or engagement crosses a threshold, pairing the neural signal with what the person was actually looking at.",
      "brain-storm.ai, the public site. I built the entire site in six hours, right after we got the POC working: signup, analytics, animation and a full mobile pass. The UI was a driving factor in why it blew out the competition.",
      "The hard problems were physical. EEG readings corrupted mid-capture, the capture software was unreliable, and wiring model output into a live frontend took real work — so did getting WiFi up on the XIAO board.",
    ],
    outcome: [
      "First place, Long Track, AugHacks 2025 — hosted by Augmentation Lab at MIT in Cambridge, judged by people who weren't us.",
      "I presented the work to Stephen Wolfram.",
      "Judges included two MIT Media Lab researchers plus founders from PRISM, LONG and MorphoAI. Sponsors included Meta and AWS.",
      "The organizers invited us to show the work at the MIT Media Lab Augmentation Summit.",
      "A working brain-computer interface in 24 hours, by a team of three.",
    ],
    links: [
      { label: "LIVE.SITE", href: "https://www.brain-storm.ai", primary: true },
      { label: "LIVE.DEMO", href: "https://www.brain-storm.ai/upload" },
      { label: "DEVPOST", href: "https://devpost.com/software/brainstorm-jcko3f" },
      { label: "SOURCE", href: "https://github.com/jaredwerba/aughacks" },
    ],
  },
  {
    id: "03",
    name: "VENUS",
    tagline:
      "Parallel sub-agents that research wedding vendors, then email each one from my own domain under a safety gate.",
    tier: 1,
    accent: "cyan",
    status: "BUILT // DRY-RUN BY DEFAULT",
    signals: ["Agentic systems", "Tool calling", "Structured output", "Webhooks", "At-least-once dispatch"],
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
      "Planning a wedding looks emotional and is really a research problem. Four vendor types, each needing its own search, shortlist and outreach, with the couple as the bottleneck on every thread. I wanted to answer one question: can an agent own the whole loop — research, contact, follow-up, and reading the replies — without ever inventing a vendor or a price?",
    built: [
      "Four specialist sub-agents — venue, photography, catering, florals and music — running up to four at once. Each gets no shared history, which forces every brief to carry its own context instead of depending on context it can't see.",
      "Reply classification as structured output. A Zod schema through generateObject returns intent, availability, price info, questions and sentiment. If the model fails or the output won't parse, it degrades to a keyword check and logs which path ran. It never silently guesses.",
      "The classifier prompt encodes mistakes I made myself. 'We're not taking a deposit until you confirm the date' is not a decline. Quoted text below an 'On ... wrote:' line is the couple speaking, not the vendor. Both are written into the prompt.",
      "Replaced the framework's built-in web search with a Tavily-backed tool. Built-in search ties research ability to one model vendor, so swapping models would break research with no warning. Backing it with Tavily keeps the capability model-independent.",
      "Layered safety on the one tool with real-world side effects. Approval is graded rather than all-or-nothing: an interactive run pauses for a human, an unattended run resolves against pre-authorization and caps so it never parks on a question nobody can answer. Every send re-checks at dispatch. Three modes — dry run, test inbox, live. Caps per vendor and per day. Cron dispatch fires more than once, so each send carries a lock and an idempotency key.",
      "Outbound is wired to Resend and it sends real email. Each vendor gets its own generated message — a venue gets a venue enquiry, a florist gets a florist enquiry — written from that vendor's brief rather than from one template. It sends from wedding@jwerba.com, on my own domain, so replies come back to a mailbox I control.",
      "Inbound replies arrive through an svix-verified webhook. A daily cron chases non-responders and handles bounces and complaints.",
    ],
    outcome: [
      "A complete agent loop — research, outreach, reply interpretation, follow-up — built in a four-day sprint.",
      "A property test asserts the idempotency design: a second sweep over the same records must find nothing to send.",
      "Commit history tracks real failure-mode work: bounce and complaint handling, a post-research stall fixed by gating before archive, and a race where an unload flush was resurrecting a session I'd just cleared.",
      "It's gated: an access code, and outreach defaults to dry run. It can send live email — I haven't turned it loose at scale.",
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
    tagline: "A locally-served LLM agent that ran in production, and knew when to stop.",
    tier: 1,
    accent: "orange",
    status: "RAN IN PRODUCTION",
    signals: ["Agentic systems", "Self-hosted inference", "Python", "Failure isolation"],
    stack: [
      "Python",
      "FastAPI",
      "Playwright",
      "Ollama llama3.1:8b",
      "WebSockets",
      "Vanilla JS",
    ],
    problem:
      "Prospecting is high-volume repeat work, and every commercial tool for it is SaaS that wants your LinkedIn credentials and your prospect data on someone else's servers. I set a harder constraint on purpose: everything local. My own Chrome session, the model on my own machine, no data leaving it, no headless scraping and no private APIs.",
    built: [
      "Serve the model myself. Ollama runs llama3.1:8b on my machine inside a live loop, with no API call leaving the box. The agent uses it to find cloud infrastructure decision makers and write the first message to each one.",
      "Removed the company name from the connection-note prompt, which killed a whole class of invented facts — the model was making up details about companies it didn't know. Role alone produces an honest opener. The company name still exists as a function argument; it just never reaches the prompt.",
      "Set temperature and token limits per task rather than one default. Title scoring runs at temperature 0.1 with a 5-token cap because it needs a single integer. Message writing runs at 0.8 with 120. One model doing the work of four tools.",
      "A full output-safety loop: generate, check against a list of common AI tells, retry up to three times, fall back to a fixed safe line, then cut at a word boundary so it can never breach LinkedIn's length limit.",
      "Two-step seniority scoring. The LLM scores first; if it errors or is down, a keyword scorer takes over and the run continues. Each row logs which scorer made the call, so every decision stays auditable.",
      "A stop rule based on replies. One query reads both message-bubble types in DOM order and checks the last message. If the last message is theirs, they replied — and the agent stops contacting them.",
      "Anti-detection built into the architecture: real Chrome binary with a real logged-in profile, AutomationControlled disabled, the enable-automation flag stripped, navigator.webdriver hidden at page load, interpolated mouse paths and per-character typing delays. Never headless.",
      "Limits at three levels — per run, per day, per week — plus pause and stop at any point, CAPTCHA checks at every stage, 16 named skip paths so one failure never crashes a run, and a closed browser tab that drops the WebSocket and halts the run.",
      "Found that model latency itself caused bugs. During the model call the compose box went stale and the page handle died. The fix was re-querying after the model returned.",
    ],
    outcome: [
      "Ran end to end against live LinkedIn: 20 logged runs over 8 days, every step traced to disk.",
      "Reply detection worked autonomously in production. Of 5 people messaged, 2 replied; the agent caught both and suppressed their follow-ups on its own. Reply timestamps match the run log to the minute.",
      "89 profile actions logged over 6 weeks, 47 of them succeeding against a page that changes often and is built to resist automation.",
      "It grew from a personal script into a packaged tool with a one-click launcher for non-technical users. The commit history shows the arc: early messages read 'fix' and 'working', later ones follow a scoped format.",
      "One part failed: I built an acceptance-rate tracker, its scraper broke, and it reported zero every time.",
    ],
    links: [
      { label: "WATCH.THE.DEMO", href: "https://www.jwerba.com/software" },
      { label: "SOURCE", href: "https://github.com/jaredwerba/linkedin-automator" },
    ],
  },
  {
    id: "05",
    name: "COVE",
    tagline: "RAG over dispensary menus that were never meant to be read by anyone else.",
    tier: 1,
    accent: "cyan",
    status: "LIVE // INGESTION PAUSED",
    signals: ["RAG", "Connector interface", "Deployment automation", "Failure isolation"],
    stack: [
      "TypeScript",
      "gpt-4o",
      "Upstash Redis",
      "Next.js",
      "Vercel Cron",
      "WebAuthn",
    ],
    problem:
      "A chat assistant for a regulated market has to help without guessing. Vermont cannabis retail has real stock, real licensed stores and real legal limits on advice. The chat isn't the hard part. Getting true, current data in front of the model is — and the menus live behind e-commerce platforms with no public API.",
    built: [
      "Found Leafly's embedded-menu JSON endpoint by reading the embed script on a shop's own site, then wrote a connector against it: sequential pagination, 50 items per page because the server rejects anything larger, and a user agent that identifies the crawler and links to my own policy page.",
      "Made the connector an interface rather than a one-off. Leafly returns JSON. Tymber ships state inside a Next.js data blob. Maui hides it in a Remix context object. Three different extraction problems behind one contract, so adding a platform never touches the pipeline.",
      "Every platform maps into one product model — name, type, brand, size, THC, CBD, price, stock. Two mapping decisions took real thought. Leafly buckets grinders and rolling papers as 'Other', so I re-derive product type from the name when the category is useless. And I only store THC as a percentage when the source says percent: edibles report milligrams, and storing 100mg as '100%' would be a lie on the card, so the card omits it instead.",
      "Product names match a canonical strain list through an alias table and fuzzy comparison at a 0.85 threshold. About 80% of items match nothing — small growers use their own SKU names.",
      "A nightly cron syncs every shop, writes one blob per shop to Redis with a 90-day expiry, and isolates failures per shop: one dead menu records an error against that shop and the run continues.",
      "Only a trimmed slice reaches the model — strain-matched items, deduped to the cheapest price per strain, capped at eight per shop. A 700-item menu contributes about a line of text. The rest of the context is the user's saved preferences and the three nearest licensed stores by real distance when location is shared.",
      "Every read is wrapped so a failure returns empty rather than throwing. If Redis is unreachable the assistant loses stock data and keeps answering.",
      "The system prompt is sectioned — persona, style, format, safety, data — so one can be tuned without disturbing the others. Safety is enforced there, and the system prompt adheres to all Vermont state regulations: 21 or older, no medical or dosing advice, no speculation beyond the injected data. Temperature pinned at 0.7, output capped at 800 tokens.",
    ],
    outcome: [
      "At peak the pipeline held about 2,055 products across 10 dispensaries, roughly 1,439 of them through the Leafly connector. Verified end to end: a sync run reporting 681 normalized products, trail badges showing count and sync age, and the assistant answering 'where can I find Blue Dream right now' with two named shops and their prices.",
      "211 commits, the longest-running project I've built. The connector layer is about 2,080 lines of the 15,000.",
      "Ingestion is paused right now. A roster migration in June replaced the dispensary list and dropped the platform tags the sync depends on, so the nightly job skips every shop. The connectors still work and the upstream endpoint still answers — it needs the tags restored, not a rewrite.",
      "It's RAG, not an agent: retrieval, then generation constrained to what was retrieved.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://www.covebud.com", primary: true }],
  },

  // ── Tier 2 — shipped products ──
  {
    id: "06",
    name: "GO DOGS BOSTON",
    tagline:
      "A non-profit idea built as a multi-tenant SaaS: match runners with shelter dogs that need the miles.",
    tier: 2,
    accent: "green",
    status: "LIVE // rundog.boston",
    signals: ["Multi-tenant SaaS", "Matchmaking", "Platform messaging", "WebAuthn"],
    stack: ["Next.js", "Neon Postgres", "WebAuthn", "Leaflet", "three.js", "Resend"],
    problem:
      "I started this as a non-profit. Shelter dogs need exercise, and some people want a dog before they commit to owning one. Both sides gain, and the logistics stop it: who's running, when, from where, and did anyone confirm. Nothing existed that matched the two sides and handled the scheduling.",
    built: [
      "Group run scheduling and booking, Leaflet route pages, participant management, in-app messaging with unread state, weather, calendar export, and a dog-miles tracker.",
      "Passkey login over iron-session, serverless Postgres on Neon, transactional email through Resend.",
      "Audited my own booking flow, found five bugs in production, then wrote a full end-to-end test for it.",
    ],
    outcome: [
      "A real multi-tenant SaaS, not a demo — the matchmaking, the platform messaging and the booking flow are all mine.",
      "Live on its own domain with real pre-launch work done: terms, privacy policy, branded 404, social share image, sitemap and self-serve account deletion.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://rundog.boston", primary: true }],
  },
  {
    id: "07",
    name: "TRAIN247",
    tagline: "Multi-tenant coaching SaaS — a trainer's whole business in one app.",
    tier: 2,
    accent: "orange",
    status: "LIVE // train247.fit",
    signals: ["Payments integration", "Multi-tenant", "Deployment automation"],
    stack: ["Next.js", "Prisma", "Postgres", "Stripe Connect", "WebAuthn", "Vercel Blob"],
    problem:
      "Independent trainers pay per seat for software built for gyms, not for them. I wanted two answers: what does a solo trainer actually need in one app, and does a take-rate model work at that scale?",
    built: [
      "31,000 lines across 33 data models: workout building, program assignment, set and rep logging, meal and water tracking, habits, body stats, forms, messaging and appointments.",
      "Stripe Connect payment rails with a take rate, and a solo mode that deploys many branded single-trainer instances from one codebase.",
      "Migrations run as part of the build, so a schema change ships with the deploy rather than beside it.",
    ],
    outcome: [
      "The largest codebase I've written, live on its own domain.",
      "The roadmap carries a gap check against the market leader, including where their chat-based AI builder beats my rule-based one.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://train247.fit", primary: true }],
  },
  {
    id: "08",
    name: "SUNDAY ENERGY",
    tagline: "A costed 25-year solar proposal from nothing but a street address.",
    tier: 2,
    accent: "cyan",
    status: "BUILT IN 2 DAYS",
    signals: ["Enterprise APIs", "Serverless", "Security fix"],
    stack: ["Google Solar API", "NREL API", "Neon Postgres", "Vercel Functions"],
    problem:
      "Getting a solar quote means a sales visit and a wait, even though every input needed to model the decision is already available through an API: roof geometry, sun exposure, local utility rates and incentive structure.",
    built: [
      "Google Solar API integration for exact roof geometry, panel placement and a year of sun exposure, drawn as a heatmap over live satellite imagery.",
      "NREL rate lookup, plus a 25-year return model covering SMART 3.0, net metering and state tax credits. It started Massachusetts-specific; I generalized it to all 50 states.",
      "Nine serverless endpoints, Postgres on Neon, and shareable proposal links.",
      "A management dashboard behind a password. It collects every address anyone has run, with the economic model that came back for each one, so the operator can see demand and results in one place.",
      "Found a Google API key hardcoded in the client and moved it behind serverless proxies.",
    ],
    outcome: [
      "A working proposal engine built over one weekend, turning a street address into a full 25-year cost model.",
      "I proposed it to a real solar business.",
    ],
    links: [
      { label: "LIVE.SITE", href: "https://sunday-energy.vercel.app", primary: true },
      {
        label: "ADMIN.DASHBOARD",
        href: "https://sunday-energy.vercel.app/admin",
        note: "Password: seaport",
      },
    ],
  },
  {
    id: "09",
    name: "GOALSRUN",
    tagline:
      "Booking and pipeline for an elite Boston runner's coaching business. He sells sessions through it.",
    tier: 2,
    accent: "green",
    status: "LIVE // IN COMMERCIAL USE",
    signals: ["In commercial use", "Scheduled jobs", "WebAuthn"],
    stack: ["Next.js", "Drizzle", "Postgres", "better-auth", "Vercel Cron"],
    problem:
      "A coach taking bookings by DM loses sessions to scheduling friction and has no view of his own pipeline. Slots also have to exist far enough ahead that someone can plan around them.",
    built: [
      "Slot generation across several locations, with a daily cron holding a rolling 180-day window open.",
      "Passkey login, a partners and sponsors surface, and two admin views: one for running the day, one for running the business.",
    ],
    outcome: [
      "A working coach runs his business on it, and the sessions it books are sessions he gets paid for. He collects payment directly over Venmo rather than in the app, because a processor's percentage matters at his volume.",
      "I take no cut — the revenue is his. It's the one thing on this page that somebody else's income depends on.",
      "I've shipped the in-app payment model too — Stripe Connect with a take rate, in Train247. For his volume, keeping payments outside the app was the right call.",
      "73 commits on a real feature-branch workflow. Each commit message names the exact production bug it fixes.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://www.goalslopes.run", primary: true }],
  },
  {
    id: "10",
    name: "JWERBA.COM",
    tagline: "This site — hand-written OAuth, passkeys and calendar invites.",
    tier: 2,
    accent: "orange",
    status: "LIVE // you are here",
    signals: ["OAuth 2.0", "WebAuthn", "Scheduled jobs", "Integrations"],
    stack: ["Next.js 16", "React 19", "Drizzle", "better-auth", "Resend", "Vercel Cron"],
    problem:
      "A portfolio is a good excuse to build the unglamorous parts myself instead of reaching for a service that hides them. I wanted to know what OAuth, passkeys and calendar interop actually cost when nobody abstracts them for you.",
    built: [
      "A Whoop OAuth 2.0 client written by hand across six scopes — authorize, code exchange and refresh — against their raw API rather than through an SDK.",
      "WebAuthn passkeys alongside magic-link login, including the origin-binding work that makes passkeys behave correctly across preview and production domains.",
      "An RFC 5545 calendar generator written from scratch, with correct line endings and text escaping, so ride invites open cleanly in Apple, Google and Outlook.",
      "Drizzle and Postgres across eight tables, two production cron jobs, and transactional email that degrades gracefully instead of crashing when unconfigured.",
    ],
    outcome: [
      "Running in production on its own domain, with the booking flow, auth and scheduled jobs all live.",
      "The Whoop client came from running someone else's Whoop MCP server daily. Using their implementation made the tradeoffs in mine obvious.",
    ],
  },
  {
    id: "11",
    name: "PERSONAL TRAINER TEMPLATE",
    tagline: "One client site turned into a reusable template. Second client live in two days.",
    tier: 2,
    accent: "cyan",
    status: "2 DEPLOYMENTS",
    signals: ["Reusable pattern", "WebAuthn debugging"],
    stack: ["Next.js", "Drizzle", "better-auth", "Postgres"],
    problem:
      "I'd built a booking site for one personal trainer. The second one shouldn't cost the same amount of work as the first, or the work doesn't compound.",
    built: [
      "Extracted the first build into a reusable template with an onboarding guide, then onboarded a second client — new identity, branding and copy — in two days.",
      "Real WebAuthn production debugging on the way: forcing the platform authenticator at registration, fixing trusted origins on a custom domain, and tracking down a login broken by a trailing newline in an environment variable.",
    ],
    outcome: [
      "Two live client deployments from one codebase.",
      "The second deployment took two days, which is what the template was for.",
    ],
    links: [
      { label: "DAVIDWILLFIT.COM", href: "https://www.davidwillfit.com", primary: true },
      { label: "NICKSCALIHEALTH.COM", href: "https://www.nickscalihealth.com", primary: true },
    ],
  },

  // ── Tier 3 — contributions, tooling, daily drivers ──
  {
    id: "12",
    name: "CAREER-OPS",
    tagline: "Open-source contributions to a multi-agent job-search system.",
    tier: 3,
    accent: "green",
    status: "OSS // #3 CONTRIBUTOR",
    signals: ["Open source", "Concurrency", "Deployment automation"],
    stack: ["Node.js", "Playwright", "launchd"],
    problem:
      "I use an open-source AI job-search tool every day. Its parallel scanner ran slower than doing the same work sequentially, which meant the concurrency was costing more than it returned.",
    built: [
      "33 commits to santifer/career-ops as its third-largest contributor: metro-region seed discovery, five fetchers for enterprise VC portfolios, a parser that took one source from 0 to 855 companies, and a two-tier scan schedule.",
      "Found and fixed a worker-pool bug by measuring it. One task held 6 of 40 workers for 1 hour 17 minutes while 34 slots sat idle; a sequential run at 20 workers finished the same work in 28 minutes. I replaced the fixed split with a shared pool, so a finished task hands its slots back immediately.",
      "Pulled fit-scoring into one shared model so the terminal shortlist and the web dashboard can never drift apart, and moved private candidate facts out of the public repo.",
    ],
    outcome: [
      "Running on a schedule through launchd since July: 7,598 job rows across 2,220 companies and 28 job-board systems.",
      "I use my home AI lab, with Hermes, to crawl new job postings.",
      "The scheduling fix has its own story. The job ran once at 8am, and if the machine was asleep the run simply didn't happen, with no warning. That cost six days before I caught it.",
    ],
    links: [
      {
        label: "LIVE.DASHBOARD",
        href: "https://careerops-jobboard-public.vercel.app",
        primary: true,
      },
      { label: "SOURCE", href: "https://github.com/santifer/career-ops" },
      { label: "MY.FORK", href: "https://github.com/jaredwerba/career-ops" },
    ],
  },
  {
    id: "13",
    name: "RESUME ORCHESTRATOR",
    tagline: "An orchestrator that fans work to specialist agents, then gates the result.",
    tier: 3,
    accent: "orange",
    status: "TOOLING // I RUN IT",
    signals: ["Agentic systems", "Deterministic gating", "Reusable pattern"],
    stack: [
      "Claude Agent Skills",
      "Multi-agent orchestration",
      "Python",
      "WeasyPrint",
    ],
    problem:
      "Tailoring a resume to a posting is three jobs at once: read the posting, pull the employer's real brand, and lay out exactly two pages. One model doing all three did each one worse. It also gave a different answer every run, because one model held both the facts and the rules, and on the questions that mattered they disagreed.",
    built: [
      "An orchestrator that splits the work and fans it out. Specialist agents run in parallel, each on one job — extract the posting's requirements, pull the employer's brand and vocabulary, select and order the facts, build the page — and spawn their own sub-agents when a job splits again.",
      "Split facts from rules so there's nothing left to adjudicate at run time. One file holds every fact the system may print. A separate file holds the rules for choosing among them. Neither holds both.",
      "A rule-based gate that runs after generation and stops the build on failure, checking voice, length limits and leaked identity details. It's plain code, not a model, so its answer never varies.",
      "The gate documents its own regression. An earlier version substring-matched across the whole page and failed builds that had simply named a real tech stack.",
    ],
    outcome: [
      "I removed a scoring step I'd built — the first version asked the model to rate its own output out of 10 against the posting. I deleted it, and the gate now reports mechanical facts and says nothing about quality.",
      "I also made the system smaller. The first pipeline ran five waves of agents; it runs three stages now. The handoffs between waves cost more than they bought.",
      "Output that once varied by run now has to pass a fixed set of checks, or the build stops rather than shipping something wrong.",
    ],
  },
  {
    id: "14",
    name: "WHOOP-MCP",
    tagline: "An MCP server I run daily, putting my own biometrics in front of a model.",
    tier: 3,
    accent: "green",
    kind: "operates",
    status: "DAILY DRIVER",
    signals: ["MCP", "OAuth 2.0", "Tool schema design"],
    stack: ["TypeScript", "MCP SDK", "Zod", "WHOOP API", "OAuth 2.0"],
    problem:
      "Recovery, sleep and strain data sit locked inside a phone app. I wanted to query it in plain language in the same session as everything else I'm working on — and I wanted hands-on time with MCP rather than a reading knowledge of it.",
    built: [
      "It exposes six tools over MCP — recovery, sleep, cycles, workouts, profile and body measurement — each with a Zod-validated schema.",
      "It runs a full OAuth 2.0 flow against the real WHOOP API, with a local callback server for login and a persisted token store handling refresh.",
    ],
    outcome: [
      "I run it as a connected MCP server most days, and that's where my practical feel for the protocol comes from: how a tool's schema shapes what a model will actually call, how much description a tool needs before it gets used correctly, and what token lifecycle management looks like when an agent rather than a human is the consumer.",
      "It set the bar for my own Whoop OAuth client on jwerba.com.",
    ],
    links: [
      { label: "SOURCE", href: "https://github.com/shashankswe2020-ux/whoop-mcp" },
    ],
  },
  {
    id: "15",
    name: "DEXTER",
    tagline:
      "A LangGraph research agent I ran daily at Oracle to read public company financials and write outbound from them.",
    tier: 3,
    accent: "cyan",
    kind: "operates",
    status: "DAILY DRIVER",
    signals: ["Agentic systems", "Evaluation", "Multi-model routing"],
    stack: ["TypeScript", "LangGraph", "LangChain", "Ink TUI", "OpenRouter"],
    problem:
      "I wanted a real agent in daily rotation rather than a toy — something with subagents, an eval harness and multi-model routing that I'd actually use, because reading about agent architecture teaches you much less than operating one.",
    built: [
      "A financial research agent on LangChain and LangGraph, with delegated subagents, an evaluation harness, OpenRouter routing across model providers, and a terminal interface built with Ink.",
    ],
    outcome: [
      "I ran this at Oracle on my own accounts. It analysed publicly traded companies and generated outbound outreach from their financial data, so the first line of an email came from a filing rather than from a guess.",
      "Running it daily shaped my views on LangGraph before I built my own graph for the Nebius take-home. I learned where the prebuilt agent stops being the right abstraction, and why an eval harness needs baselines rather than a single score.",
      "Most of what I know about agent failure modes I learned watching someone else's agent hit them first.",
    ],
    links: [{ label: "SOURCE", href: "https://github.com/virattt/dexter" }],
  },
  {
    id: "16",
    name: "LUNARFORGE",
    tagline:
      "A weekend WebGPU experiment: a scroll-reveal landing page with PS3-era real-time graphics.",
    tier: 3,
    accent: "cyan",
    status: "LIVE",
    signals: ["Real-time graphics"],
    stack: ["three.js", "GSAP", "Zustand", "Next.js"],
    problem:
      "A weekend project. I wanted hands-on time with WebGPU and the current front-end release wave, and I wanted to know where the frame budget actually goes. The look I aimed for is PS3-era real-time graphics. A landing page was the excuse.",
    built: [
      "A PBR render pipeline, a particle simulation of flying lunar dust, a GSAP scroll sequence that assembles a reactor out of that dust, an orbit camera, and hand-built animated SVG scenes using no image files at all.",
    ],
    outcome: [
      "A scroll-reveal sequence that holds its frame rate, built on the newest tooling I could find. Pure front-end graphics work, over a weekend. The company is fictional and the site says so.",
    ],
    links: [
      { label: "LIVE.SITE", href: "https://space-forge-taupe.vercel.app/eb", primary: true },
    ],
  },
  {
    id: "18",
    name: "H200 MODEL SERVE",
    tagline:
      "I rented an H200 from Nebius with my own money and ran two versions of Qwen on it.",
    tier: 1,
    accent: "cyan",
    status: "SERVED // VM DELETED",
    signals: ["vLLM", "SGLang", "GPU sizing", "Model serving", "Nebius AI Cloud"],
    stack: [
      "Nebius AI Cloud",
      "H200 SXM",
      "vLLM 0.27.1",
      "SGLang",
      "CUDA 13",
      "Ubuntu 24.04",
      "BF16",
    ],
    links: [
      {
        label: "MODEL.1.UNCENSORED",
        href: "https://huggingface.co/AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16",
        note: "AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 — dense 27B, served with vLLM",
      },
      {
        label: "MODEL.2.ABLITERATED",
        href: "https://huggingface.co/Youssofal/Qwen3.6-35B-A3B-Abliterated-Heretic-BF16",
        note: "Youssofal/Qwen3.6-35B-A3B-Abliterated-Heretic-BF16 — 35B mixture of experts, served with SGLang",
      },
    ],
    problem:
      "I wanted to run two open-weight Qwen models. One is uncensored, one is abliterated — both have their refusal behaviour removed, and that's a class of model you can only run yourself. My laptop can't load either one, so I rented a GPU from Nebius and paid for it out of my own pocket.",
    built: [
      "I worked out the GPU before I rented anything. The weights are 55.6 GB; with the KV cache the model needs 70 to 80 GB. One H200 has 141 GB, so one card was enough — I didn't need a cluster and I didn't need the eight-GPU shape. One calculation, and it saved most of the bill.",
      "I served the first model with vLLM. That's the usual choice and it worked.",
      "vLLM wouldn't serve the second model. It pulled down 65 GiB, then stopped with an error about a module named visual. The checkpoint carries a vision tower, and the text loader takes the language experts and refuses the vision weights. I served the same model with SGLang instead, on the same GPU and the same port. It loaded with no change at all.",
      "The first model kept cutting its answers off in the middle. I raised the output token cap and the answers finished.",
      "Before I deleted the machine I spent an hour making it fast. I changed one setting: how many requests the server keeps in flight at once. I had it at four. I put it at sixty-four.",
    ],
    outcome: [
      "Both models served, and both answered.",
      "The speed change was larger than I expected. With 32 people asking at once, the server went from 381 tokens a second to 2,128, and the wait before the first word dropped from 21 seconds to under 4. Usually you trade one for the other. Both improved here because the old setting was leaving the card idle.",
      "Then I deleted the VM and the disk. The weights are a public download.",
      "Half of what slowed me down wasn't the models — it was the platform. An address that only works inside the VPC, a machine built with no public IP, a key comment pasted into a username box. I wrote each one down with the cause and the fix.",
      "The write-up is a runbook: a numbered list of failures, and a small benchmark script that needs nothing installed.",
    ],
  },
  {
    id: "17",
    name: "HOME INFERENCE CLUSTER",
    tagline: "Two Mac minis on RDMA, serving one model split across both.",
    tier: 3,
    accent: "orange",
    status: "RUNNING // SELF-HOSTED",
    signals: ["Self-hosted inference", "Distributed serving", "RDMA interconnect"],
    stack: ["MLX", "EXO", "Hermes", "RDMA", "macOS"],
    problem:
      "I wanted to run a real model on hardware I own rather than through an API, and to learn what actually happens when one model doesn't fit on one machine. An API hides exactly the parts I wanted to see.",
    built: [
      "Two Mac minis networked over RDMA. RDMA moves data between the machines with very little CPU overhead, which is what makes splitting a model across them worth doing at all.",
      "MLX runs the model on Apple silicon. EXO splits one model across both machines, so the pair can hold a model neither node could run alone.",
      "It serves Hermes as my own agent, at home, every day.",
      "The files aren't on my work machine; the cluster stays separate.",
    ],
    outcome: [
      "This is the closest thing I own to Nebius's own product shape, at very small scale: one model, split across nodes, over a fast interconnect.",
      "It taught me the parts an API hides — how the interconnect becomes the limit, and how a model behaves when it doesn't fit on a single machine.",
    ],
  },
];
