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

export type Capability = {
  /**
   * Which of the role spec's five technical-bar areas this sits under, named
   * the way the spec names it. Consecutive rows sharing a group render under
   * one heading, so the order of this array is the order on the page.
   */
  group?: string;
  /** Their bar, as they name it. */
  label: string;
  /** What proves it. Project numbers tie back to the index. */
  proof: string;
  /** Optional supporting links — rendered as small keys under the row. */
  links?: ProjectLink[];
};

/**
 * Their bar has five named areas. This map uses those five, in their order,
 * then one group for the signals the posting itself calls out.
 *
 * The rule that shapes it: every row leads with a different thing. Jared's
 * strongest projects each bear on four or five of these areas, so a
 * capability-first list made the same three names appear over and over and
 * read as thinner than the work is. Each row here carries a fact no other row
 * uses, and no two consecutive rows open with the same noun.
 *
 * Claim level matters. "Sold and architected" for the Oracle work; "built and
 * ran" for his own code; "I run" for whoop-mcp, which is someone else's
 * server. Nothing here should fail a follow-up question.
 */
export const CAPABILITY_LEAD =
  "This map follows your five technical areas, in your order. My depth is AI applications. Three things here run rather than sit in a repository: career-ops has run daily since July, my home cluster serves Qwen to my own agents, and LinkedIn-Automator ran in production against a live third-party site.";

export const CAPABILITIES: Capability[] = [
  // ── AI Applications ──────────────────────────────────────────────────────
  {
    group: "AI Applications",
    label: "Agentic systems and tool calling",
    proof:
      "Nebius-XWord is a hand-built LangGraph agent. It has four tools, and a stop rule that fires on a submit call, not on silence. LinkedIn-Automator is the one that ran in production, against a live third-party site, and it stopped itself when it should have. career-ops and my resume skills give a model a defined tool surface, and they hold it to that surface.",
    links: [
      { label: "NEBIUS-XWORD", href: "https://nebius-xword.vercel.app", primary: true },
    ],
  },
  {
    group: "AI Applications",
    label: "Sub-agent fan-out, and cutting it back",
    proof:
      "My resume orchestrator fans work out to specialist agents. I cut it from five waves to three stages, because the handoffs cost more than they bought. Venus runs four specialist sub-agents in parallel.",
    links: [
      {
        label: "VENUS",
        href: "https://vendor-scout-xi.vercel.app",
        primary: true,
        note: "Vercel password: fernwood2027",
      },
    ],
  },
  {
    group: "AI Applications",
    label: "Evaluation",
    proof:
      "The eval harness runs four solvers through one scorer. An empty solver must score 0%. An oracle solver must score 100%. If either misses, the scorer is broken. The resume orchestrator gate is a different thing: it is rule-based, it reports document defects, and it refuses to judge quality. I built a model self-score into it once, then deleted it, because a model grading its own output is not a test.",
    links: [
      { label: "XWORD.SOURCE", href: "https://github.com/jaredwerba/Nebius-XWord" },
    ],
  },
  {
    group: "AI Applications",
    label: "RAG and retrieval",
    proof:
      "COVE is RAG end to end over live dispensary menus. A trimmed slice — strain-matched, deduped, eight per shop — goes into the prompt at request time. A separate retrieval pipeline uses Cohere ReRank, which reorders results by relevance after the first search returns them.",
    links: [
      { label: "COVEBUD.COM", href: "https://www.covebud.com", primary: true },
      { label: "COHERE.RERANK", href: "https://cohere.com/rerank" },
    ],
  },
  {
    group: "AI Applications",
    label: "MCP",
    proof:
      "I run whoop-mcp as a connected server. It pulls my own health metrics, and the result is live on my site. Daily use is where my feel for the protocol comes from: how much description a tool schema needs before a model calls it correctly, and what token lifecycle looks like when an agent rather than a person is the consumer.",
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
      "Python runs all of it. Nebius-XWord is Python end to end: the LangGraph agent, the FastAPI service, the grid engine, and the eval harness, with 55 tests that run offline. LinkedIn-Automator is Python too: FastAPI, Playwright browser control, WebSockets, and the local model loop. I use Python for the resume orchestrator's audit gate and its PDF layout.",
    links: [
      { label: "AUTOMATOR.SOURCE", href: "https://github.com/jaredwerba/linkedin-automator" },
    ],
  },
  {
    group: "Software Engineering",
    label: "Data services",
    proof:
      "For COVE I wrote connectors against three dispensary menu platforms. I normalized them into one product model, matched names to a strain catalog, and stored the result in Redis.",
  },

  // ── Infrastructure ───────────────────────────────────────────────────────
  {
    group: "Infrastructure",
    label: "Cloud and GPU platform",
    proof:
      "Ten years at Oracle. I sold and architected every OCI IaaS and PaaS product, including GPU compute for AI training and inference: A100 80GB, H100, and A10. I ran Kubernetes architecture for named accounts. I am Oracle Cloud Architect certified. I also run my own RDMA cluster at home.",
  },
  {
    group: "Infrastructure",
    label: "Deployment automation",
    proof:
      "career-ops is a two-tier scheduler I wrote and still run. It holds a real lock, recovers a stale lock by age, catches up after the machine sleeps, and ends in a guarded production deploy. It has run daily since July, and it publishes a public dashboard.",
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
      "I served two models on one Nebius H200. Model 1 is an uncensored Qwen 27B, and I served it with vLLM 0.27.1. Model 2 is an abliterated Qwen 35B mixture of experts, and I served it with SGLang. I sized the GPU before I rented it. Model 1 has 55.6 GB of weights, and it needs 70 to 80 GB with the KV cache. I selected one H200 with 141 GB. I did not select the 8-GPU shape or the L40S with 48 GB. I set each option and did not accept the defaults. These are BF16, a context of 16384 tokens, four concurrent sequences, and 0.85 GPU memory use. I also set the Triton prefill backend and MTP speculative decoding with three draft tokens. I listened on 127.0.0.1 behind an SSH tunnel, because vLLM listens on 0.0.0.0 by default. Model 2 is the reason I use two servers. vLLM refused its vision-tower weights, and SGLang loaded the same repository with no change.",
  },
  {
    group: "Inference",
    label: "Self-hosted and local serving",
    proof:
      "My home cluster is two Mac minis on RDMA, with 48GB of unified memory. It runs MLX and EXO, and it serves Qwen locally to my Hermes agent and to OpenClaw, my always-on outreach agent. LinkedIn-Automator serves llama3.1:8b through Ollama on my own machine, and I tune it per call: title scoring runs at temperature 0.1 with a 5-token cap, because that job wants one integer, and message writing runs at 0.8.",
  },
  {
    group: "Inference",
    label: "Hosted inference and provider comparison",
    proof:
      "I tested 13 models across two providers. I then raced the same weights on both, to compare the providers, not the models. The race runs on the live Nebius-XWord page.",
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
      "I wrote OAuth 2.0 by hand, on jwerba.com and against the WHOOP API. I built signed inbound webhooks in Venus. I integrated Google Solar, NREL, and Stripe Connect in Train247 and Sunday Energy.",
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
      "First place at Augmentation Lab, MIT — AugHacks 2025, Long Track, for BrainStorm.ai. I presented the work to Stephen Wolfram.",
    links: [
      { label: "BRAIN-STORM.AI", href: "https://www.brain-storm.ai", primary: true },
    ],
  },
  {
    group: "Signals",
    label: "Open source",
    proof:
      "I have 33 commits in career-ops, and I am the third-largest contributor. My worker-pool fix came from a measurement, not a hunch.",
    links: [
      {
        label: "CAREER-OPS.DASHBOARD",
        href: "https://careerops-jobboard-public.vercel.app",
      },
    ],
  },
  {
    group: "Signals",
    label: "Technical writing",
    proof:
      "I write in ASD-STE100, the Simplified Technical English standard, and this page is written in it. The Nebius-XWord README runs 550 lines, and it states plainly what it does not measure. The LinkedIn-Automator architecture set runs nine documents, written by the tool's own logging integration.",
    links: [
      { label: "READ.THE.README", href: "https://github.com/jaredwerba/Nebius-XWord" },
    ],
  },
  {
    group: "Signals",
    label: "Dated public record",
    proof:
      "I have posted what I was reading since 2017. The posts are public and dated: Oracle InfiniBand interconnects in 2019, RDMA and GPT-3 in 2020, RoCE for distributed training in 2024, and NVIDIA Quantum-2 InfiniBand in 2025.",
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
    ],
  },
];

/** Technical background. No quota figures. */
export const BACKGROUND: string[] = [
  "Ten years at Oracle. I sold and architected every OCI IaaS and PaaS product over that span.",
  "GPU compute for AI training and inference: A100 80GB, H100, and A10. Plus HPC and managed databases.",
  "Kubernetes architecture for named enterprise accounts, including Systems & Software in Vermont, on their Enquesta CIS platform.",
  "I ran discovery, architecture reviews, live demos, and POC scoping on my own, as a combined account executive and solutions engineer. I escalated to specialists only when scope demanded it.",
  "Oracle Cloud Architect Associate, 2018 and 2021. I was the first account executive at Oracle to earn it.",
  "The point for this role: I have spent a decade on the other side of the conversation a Nebius FDE has. I have scoped GPU workloads with CTOs, and I know what the buyer is weighing.",
];

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
  /** Which lines of the FDE technical bar this project actually evidences. */
  signals?: string[];
  problem: string;
  built: string[];
  outcome: string[];
  links?: ProjectLink[];
};

/** Top framing. What this page is, and where the strongest evidence sits. */
export const OVERVIEW: string[] = [
  "This is a technical brief for one conversation. Eighteen projects, ordered by how much they bear on the Forward Deployed Engineer role, not by date. Every entry answers the same three questions: what problem I was solving, what I personally built, and what came of it.",
  "Where the strongest evidence sits, if you only read three: Nebius-XWord is the agent and the eval harness I built to judge it, and it found a gap in the Nebius model catalog along the way. BrainStorm.ai took first place at an MIT-hosted hackathon, running a real model on real hardware. LinkedIn-Automator is the one that ran in production against a live third-party site, and stopped itself when it should have.",
  "One of these ran on your hardware. I sized and rented an H200, and I served two models on it. I served an uncensored Qwen 27B with vLLM, and an abliterated Qwen 35B with SGLang, because the second checkpoint stopped the first server. I wrote down each place where I stopped. Half of the problems came from the platform, not from the models. That record is under H200 Model Serve.",
  "There is also a public trail. I have posted what I was reading since 2017. InfiniBand in 2019. RDMA and GPT-3 in 2020. The dated posts sit under Public Record.",
  "Everything with a live link is running now. Opening one is faster than reading about it.",
];

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
      "The task had three parts: build an agent that solves crosswords, build a way to test it, and write clear instructions. Solving a puzzle is the easy part. Two things are hard. How do I know the agent is good rather than lucky? And how do I stop one wrong answer from corrupting the whole grid?",
    built: [
      "Split the authority. A Python engine owns the grid — slots, numbering, crossing rules. The model owns only the answers. A wrong answer gets rejected with a reason, and the model tries again. The model can fail. It cannot corrupt state.",
      "Wrote the graph myself in LangGraph instead of using its prebuilt agent, because my stop condition is different: the run has to end on a submit tool call, not on the model going quiet. Three nodes — agent, tools, and a nudge node that pushes the model back to tool calls when it answers in prose. The nudge is capped at three, so a model that never calls a tool still terminates.",
      "Built the eval harness before choosing anything. Four solvers run through one scorer. An empty solver must score 0% and an oracle solver must score 100% — if either misses, the scorer itself is broken. A third solver fills real interlocking words while ignoring every clue; it scores about 9%. Anything above that line is what the model contributed by reading clues rather than by fitting the grid.",
      "Chose models by measurement. Reading the live Nebius catalog first turned up a gap: DeepSeek V4 Flash advertises no tool support, so it cannot drive a tool-calling agent at all. I screened 13 candidates, then ran the survivors through 5 models across 2 services, 4 puzzles, 2 runs each. The README publishes every failure beside every pass.",
      "Capped the context window after measuring what it cost not to. Resending the whole history each turn makes token cost grow with the square of the turn count — one 40-turn solve burned 1.09 million tokens. The cap keeps the system prompt, the opening grid, and the most recent messages. It also drops any tool result whose matching call fell outside the window, because the API rejects a tool message with no call attached.",
      "Measured the prompt itself. One instruction told the agent to call get_state first, which wasted a turn — the opening message already contains the grid. Another made it confirm before submitting, which spent 200 seconds rechecking a grid the engine had already validated. Removing both took one solve from 420 seconds to 153.",
    ],
    outcome: [
      "A real newspaper crossword, 13x13, 60 entries. DeepSeek V4 Pro on Nebius filled and submitted the whole grid. All 60 entries correct, every crossing verified, in 98 turns, 16.6 minutes and 2.44 million tokens — about $4.40.",
      "That run produced two fixes: the context window, and the nudge step that recovers a model stuck in prose.",
      "Same model raced on two providers: Nebius averaged 17.5 seconds, the other gateway 53.7. Marked n=4 on the page. That is a small sample, not a benchmark.",
      "Running both providers at once exposed a bug single-provider tests could not. On a cold start the environment loaded late and a fallback chain sent the wrong key to the wrong provider. Fixed, with a regression test.",
      "55 tests. None needs an API key or a network — a fake model drives the whole graph offline.",
      "What outlasts the puzzle: the harness takes any puzzle set, the model matrix records which models can and cannot drive a tool loop, and the race is a repeatable way to compare two providers on identical weights.",
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
      "Apps infer your interest from clicks. Clicks are a poor proxy. A system that reads attention directly could recommend what actually holds your focus rather than what you happened to open — and could tell a student which material is really landing. Nobody on the team had a neuroscience background, and we had 24 hours.",
    built: [
      "Embedded the NeuroLM model onto the OpenBCI hardware. This was the core of the build: getting a real model to run against a live sensor rather than a saved file.",
      "A pipeline that reads 6-channel EEG at 250Hz from an OpenBCI Ultracortex headset, runs it through NeuroLM, and outputs an attention score, an engagement score and a 512-number embedding for every 1 to 10 second window.",
      "Content matching. The system compares a live embedding against embeddings from past videos and suggests the content that best holds that person's attention.",
      "A wearable camera on a Seeed XIAO ESP32S3 board. It takes a photo the moment attention or engagement crosses a threshold, pairing the neural signal with what the person was actually looking at.",
      "brain-storm.ai, the public site. I built and shipped it alone in the six days after the event: 28 commits, the v0.0/v1.0 roadmap, signup, analytics, animation and a full mobile pass.",
      "The hard problems were physical. EEG readings corrupted mid-capture. The capture software was unreliable. Wiring model output into a live frontend took real work, and so did getting WiFi up on the XIAO board.",
    ],
    outcome: [
      "First place, Long Track, AugHacks 2025 — hosted by Augmentation Lab at MIT in Cambridge. External judging, which is the only evaluation here that is not my own.",
      "I presented the work to Stephen Wolfram.",
      "Judges included two MIT Media Lab researchers plus founders from PRISM, LONG and MorphoAI. Sponsors included Meta and AWS.",
      "The organizers invited us to show the work at the MIT Media Lab Augmentation Summit.",
      "A working brain-computer interface in 24 hours, by a team of three.",
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
    tagline: "Parallel sub-agents that research vendors, then email them under a safety gate.",
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
      "Four specialist sub-agents — venue, photography, catering, florals and music — running up to four at once. Each gets no shared history, which forces every brief to carry its own context instead of depending on context it cannot see.",
      "Reply classification as structured output. A Zod schema through generateObject returns intent, availability, price info, questions and sentiment. If the model fails or the output will not parse, it degrades to a keyword check and logs which path ran. It never silently guesses.",
      "The classifier prompt encodes mistakes I actually made. 'We're not taking a deposit until you confirm the date' is not a decline. Quoted text below an 'On ... wrote:' line is the couple speaking, not the vendor. Both are written into the prompt.",
      "Replaced the framework's built-in web search with a Tavily-backed tool. Built-in search ties research ability to one model vendor, so swapping models would break research with no warning. Backing it with Tavily keeps the capability model-independent.",
      "Layered safety on the one tool with real-world side effects. Approval is graded, not all-or-nothing: an interactive run pauses for a human, an unattended run resolves against pre-authorization and caps so it never parks on a question nobody can answer. Every send re-checks at dispatch, because approval is a gate and not a blank cheque. Three modes — dry run, test inbox, live. Caps per vendor and per day. Cron dispatch fires more than once, so each send carries a lock and an idempotency key.",
      "Inbound replies arrive through an svix-verified webhook. A daily cron chases non-responders and handles bounces and complaints.",
    ],
    outcome: [
      "A complete agent loop — research, outreach, reply interpretation, follow-up — built in a four-day sprint.",
      "A property test asserts the idempotency design: a second sweep over the same records must find nothing to send.",
      "Commit history tracks real failure-mode work: bounce and complaint handling, a post-research stall fixed by gating before archive, and a race where an unload flush was resurrecting a session I had just cleared.",
      "Gated on purpose. It needs an access code and outreach defaults to dry run. I built it to send live email and have not turned it loose at scale.",
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
      "Removed the company name from the connection-note prompt, which killed a whole class of invented facts — the model was making up details about companies it did not know. Role alone produces an honest opener. The company name still exists as a function argument; it just never reaches the prompt.",
      "Set temperature and token limits per task rather than one default. Title scoring runs at temperature 0.1 with a 5-token cap because it needs a single integer. Message writing runs at 0.8 with 120. One model doing the work of four tools.",
      "A full output-safety loop: generate, check against a list of common AI tells, retry up to three times, fall back to a fixed safe line, then cut at a word boundary so it can never breach LinkedIn's length limit.",
      "Two-step seniority scoring. The LLM scores first; if it errors or is down, a keyword scorer takes over and the run continues. Each row logs which scorer made the call, so every decision stays auditable.",
      "A stop rule based on replies. One query reads both message-bubble types in DOM order and checks the last message. If the last message is theirs, they replied — and the agent stops contacting them.",
      "Anti-detection as architecture, not a bolt-on. Real Chrome binary with a real logged-in profile, AutomationControlled disabled, the enable-automation flag stripped, navigator.webdriver hidden at page load, interpolated mouse paths and per-character typing delays. Never headless.",
      "Limits at three levels — per run, per day, per week — plus pause and stop at any point, CAPTCHA checks at every stage, 16 named skip paths so one failure never crashes a run, and a closed browser tab that drops the WebSocket and halts the run.",
      "Found that model latency itself caused bugs. During the model call the compose box went stale and the page handle died. The fix was re-querying after the model returned — something I only learned by running an agent against a live, hostile DOM.",
    ],
    outcome: [
      "Ran end to end against live LinkedIn: 20 logged runs over 8 days, every step traced to disk.",
      "Reply detection worked autonomously in production. Of 5 people messaged, 2 replied; the agent caught both and suppressed their follow-ups on its own. Reply timestamps match the run log to the minute. Its most consequential decision was the decision not to act.",
      "89 profile actions logged over 6 weeks, 47 of them succeeding against a page that changes often and is built to resist automation.",
      "It grew from a personal script into a packaged tool with a one-click launcher for non-technical users. The commit history shows the arc: early messages read 'fix' and 'working', later ones follow a scoped format.",
      "One part failed and I own it. I built an acceptance-rate tracker, its scraper broke, and it reported zero every time. Knowing which of your own numbers to trust is part of the job.",
    ],
    links: [
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
      "A chat assistant for a regulated market has to help without guessing. Vermont cannabis retail has real stock, real licensed stores and real legal limits on advice. The chat is not the hard part. Getting true, current data in front of the model is — and the menus live behind e-commerce platforms with no public API.",
    built: [
      "Found Leafly's embedded-menu JSON endpoint by reading the embed script on a shop's own site, then wrote a connector against it: sequential pagination, 50 items per page because the server rejects anything larger, and a user agent that identifies the crawler and links to my own policy page.",
      "Made the connector an interface rather than a one-off. Leafly returns JSON. Tymber ships state inside a Next.js data blob. Maui hides it in a Remix context object. Three different extraction problems behind one contract, so adding a platform never touches the pipeline.",
      "Every platform maps into one product model — name, type, brand, size, THC, CBD, price, stock. Two mapping decisions took real thought. Leafly buckets grinders and rolling papers as 'Other', so I re-derive product type from the name when the category is useless. And I only store THC as a percentage when the source says percent: edibles report milligrams, and storing 100mg as '100%' would be a lie on the card, so the card omits it instead.",
      "Product names match a canonical strain list through an alias table and fuzzy comparison at a 0.85 threshold. About 80% of items match nothing, because small growers use their own SKU names. That number is a comment in the code, not something hidden.",
      "A nightly cron syncs every shop, writes one blob per shop to Redis with a 90-day expiry, and isolates failures per shop: one dead menu records an error against that shop and the run continues.",
      "Only a trimmed slice reaches the model — strain-matched items, deduped to the cheapest price per strain, capped at eight per shop. A 700-item menu contributes about a line of text. The rest of the context is the user's saved preferences and the three nearest licensed stores by real distance when location is shared.",
      "Every read is wrapped so a failure returns empty rather than throwing. If Redis is unreachable the assistant loses stock data and keeps answering.",
      "The system prompt is sectioned — persona, style, format, safety, data — so one can be tuned without disturbing the others. Safety is enforced there: 21 or older, no medical or dosing advice, no speculation beyond the injected data. Temperature pinned at 0.7, output capped at 800 tokens.",
    ],
    outcome: [
      "At peak the pipeline held about 2,055 products across 10 dispensaries, roughly 1,439 of them through the Leafly connector. Verified end to end: a sync run reporting 681 normalized products, trail badges showing count and sync age, and the assistant answering 'where can I find Blue Dream right now' with two named shops and their prices.",
      "211 commits, the longest-running project I have built. The connector layer is about 2,080 lines of the 15,000.",
      "Ingestion is paused and I would rather say so than imply otherwise. A roster migration in June replaced the dispensary list and dropped the platform tags the sync depends on, so the nightly job now skips every shop. The connectors still work and the upstream endpoint still answers. It needs the tags restored, not a rewrite.",
      "This is RAG, not an agent. Retrieval, then generation constrained to what was retrieved. I would not call it an agent.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://www.covebud.com", primary: true }],
  },

  // ── Tier 2 — shipped products ──
  {
    id: "06",
    name: "GO DOGS BOSTON",
    tagline: "A booking platform matching runners with shelter dogs that need the miles.",
    tier: 2,
    accent: "green",
    status: "LIVE // rundog.boston",
    signals: ["Integrations", "WebAuthn", "Testing"],
    stack: ["Next.js", "Neon Postgres", "WebAuthn", "Leaflet", "three.js", "Resend"],
    problem:
      "Shelter dogs need exercise and runners want company, but the logistics kill it: who is running, when, from where, and did anyone confirm. Nothing existed that matched the two sides and handled the scheduling.",
    built: [
      "Group run scheduling and booking, Leaflet route pages, participant management, in-app messaging with unread state, weather, calendar export, and a dog-miles tracker.",
      "Passkey login over iron-session, serverless Postgres on Neon, transactional email through Resend.",
      "Audited my own booking flow, found five bugs in production, then wrote a full end-to-end test for it.",
    ],
    outcome: [
      "Live on its own domain with real pre-launch work done: terms, privacy policy, branded 404, social share image, sitemap and self-serve account deletion.",
      "The end-to-end test exists because I broke my own flow first. Finding five bugs by audit is the reason the harness got written.",
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
      "Independent trainers pay per seat for software built for gyms, not for them. I wanted two answers. What does a solo trainer actually need in one app? And does a take-rate model work at that scale?",
    built: [
      "31,000 lines across 33 data models: workout building, program assignment, set and rep logging, meal and water tracking, habits, body stats, forms, messaging and appointments.",
      "Stripe Connect payment rails with a take rate, and a solo mode that deploys many branded single-trainer instances from one codebase.",
      "Migrations run as part of the build, so a schema change ships with the deploy rather than beside it.",
    ],
    outcome: [
      "The largest codebase I have written, live on its own domain.",
      "The roadmap carries an honest gap check against the market leader, including where their chat-based AI builder beats my rule-based one. Knowing exactly where you lose is worth writing down.",
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
      "Nine serverless endpoints, Postgres on Neon, shareable proposal links and an admin view.",
      "Found a Google API key hardcoded in the client and moved it behind serverless proxies. The kind of bug worth fixing before somebody else finds it.",
    ],
    outcome: [
      "A working proposal engine built over one weekend, turning a street address into a full 25-year cost model.",
    ],
    links: [{ label: "LIVE.SITE", href: "https://sunday-energy.vercel.app", primary: true }],
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
      "A coach taking bookings by DM loses sessions to scheduling friction and has no view of their own pipeline. Slots also have to exist far enough ahead that someone can plan around them.",
    built: [
      "Slot generation across several locations, with a daily cron holding a rolling 180-day window open.",
      "Passkey login, a partners and sponsors surface, and two admin views: one for running the day, one for running the business.",
    ],
    outcome: [
      "A working coach runs his business on it, and the sessions it books are sessions he gets paid for. He collects payment directly over Venmo rather than in the app, because a processor's percentage matters at his volume.",
      "I take no cut, so the revenue is his and not mine. What that makes this is the one thing on this page that somebody else's income depends on — which is a harder test than any number I could put next to it.",
      "The payment decision is worth one line: I built Stripe Connect with a take rate into Train247, so I have shipped the in-app model too. Knowing when a client is better off outside it is the same skill as knowing when to build it.",
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
      "The Whoop client is the direct product of running someone else's Whoop MCP server daily the Whoop MCP server. Using their implementation made the tradeoffs in mine obvious.",
    ],
  },
  {
    id: "11",
    name: "TRAINER SITE TEMPLATE",
    tagline: "One client site turned into a reusable template. Second client live in two days.",
    tier: 2,
    accent: "cyan",
    status: "2 DEPLOYMENTS",
    signals: ["Reusable pattern", "WebAuthn debugging"],
    stack: ["Next.js", "Drizzle", "better-auth", "Postgres"],
    problem:
      "I had built a booking site for one personal trainer. The second one should not cost the same amount of work as the first, or the work does not compound.",
    built: [
      "Extracted the first build into a reusable template with an onboarding guide, then onboarded a second client — new identity, branding and copy — in two days.",
      "Real WebAuthn production debugging on the way: forcing the platform authenticator at registration, fixing trusted origins on a custom domain, and tracking down a login broken by a trailing newline in an environment variable.",
    ],
    outcome: [
      "Two live client deployments from one codebase.",
      "The pattern is the artifact. The second deployment is what proves the first one was built right.",
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
      "Found and fixed a worker-pool bug with a measurement rather than a hunch. One task held 6 of 40 workers for 1 hour 17 minutes while 34 slots sat idle; a sequential run at 20 workers finished the same work in 28 minutes. I replaced the fixed split with a shared pool, so a finished task hands its slots back immediately.",
      "Pulled fit-scoring into one shared model so the terminal shortlist and the web dashboard can never drift apart, and moved private candidate facts out of the public repo.",
    ],
    outcome: [
      "Running on a schedule through launchd since July: 7,598 job rows across 2,220 companies and 28 job-board systems.",
      "The scheduling fix has its own story. The job ran once at 8am, and if the machine was asleep the run simply did not happen, with no warning. That cost six days before I caught it.",
    ],
    links: [
      {
        label: "LIVE.DASHBOARD",
        href: "https://careerops-jobboard-public.vercel.app",
        primary: true,
      },
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
      "Split facts from rules so there is nothing left to adjudicate at run time. One file holds every fact the system may print. A separate file holds the rules for choosing among them. Neither holds both.",
      "A rule-based gate that runs after generation and stops the build on failure, checking voice, length limits and leaked identity details. It is plain code, not a model, so its answer never varies.",
      "The gate documents its own regression. An earlier version substring-matched across the whole page and failed builds that had simply named a real tech stack.",
    ],
    outcome: [
      "I removed a scoring step I had built. The first version asked the model to rate its own output out of 10 against the posting. A model grading its own work is not a test, so I deleted it. The gate reports mechanical facts now and says nothing about quality.",
      "I also made the system smaller. The first pipeline ran five waves of agents; it runs three stages now. The handoffs between waves cost more than they bought.",
      "Output that once varied by run now has to pass a fixed set of checks, or the build stops rather than shipping something wrong.",
      "Two lessons I carry: put the deterministic check where a model cannot argue with it, and do not add an agent unless the work it saves exceeds the handoff it costs.",
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
      "Recovery, sleep and strain data sit locked inside a phone app. I wanted to query it in plain language in the same session as everything else I am working on — and I wanted hands-on time with MCP rather than a reading knowledge of it.",
    built: [
      "It exposes six tools over MCP — recovery, sleep, cycles, workouts, profile and body measurement — each with a Zod-validated schema.",
      "It runs a full OAuth 2.0 flow against the real WHOOP API, with a local callback server for login and a persisted token store handling refresh.",
    ],
    outcome: [
      "I run it as a connected MCP server most days, and that is where my practical feel for the protocol comes from: how a tool's schema shapes what a model will actually call, how much description a tool needs before it gets used correctly, and what token lifecycle management looks like when an agent rather than a human is the consumer.",
      "It set the bar for my own Whoop OAuth client on jwerba.com on jwerba.com. Using someone else's implementation daily made the tradeoffs in mine much clearer.",
    ],
    links: [
      { label: "SOURCE", href: "https://github.com/shashankswe2020-ux/whoop-mcp" },
    ],
  },
  {
    id: "15",
    name: "DEXTER",
    tagline: "A LangGraph research agent I run in the terminal every day.",
    tier: 3,
    accent: "cyan",
    kind: "operates",
    status: "DAILY DRIVER",
    signals: ["Agentic systems", "Evaluation", "Multi-model routing"],
    stack: ["TypeScript", "LangGraph", "LangChain", "Ink TUI", "OpenRouter"],
    problem:
      "I wanted a real agent in daily rotation rather than a toy — something with subagents, an eval harness and multi-model routing that I would actually use, because reading about agent architecture teaches you much less than operating one.",
    built: [
      "A financial research agent on LangChain and LangGraph, with delegated subagents, an evaluation harness, OpenRouter routing across model providers, and a terminal interface built with Ink.",
    ],
    outcome: [
      "Running it daily shaped my views on LangGraph before I built my own graph for the Nebius take-home for the take-home. I learned where the prebuilt agent stops being the right abstraction, and why an eval harness needs baselines rather than a single score.",
      "Reading and operating other people's agent code is underrated. Most of what I know about failure modes I learned by watching someone else's agent hit them first.",
    ],
    links: [{ label: "SOURCE", href: "https://github.com/virattt/dexter" }],
  },
  {
    id: "16",
    name: "LUNARFORGE",
    tagline: "A real-time WebGL pipeline in the browser, dressed as a landing page.",
    tier: 3,
    accent: "cyan",
    status: "LIVE",
    signals: ["Real-time graphics"],
    stack: ["three.js", "GSAP", "Zustand", "Next.js"],
    problem:
      "I wanted to build a cinematic real-time graphics pipeline in the browser and find out where the frame budget actually goes. A landing page was the excuse.",
    built: [
      "A PBR render pipeline, a particle simulation of flying lunar dust, a GSAP scroll sequence that assembles a reactor out of that dust, an orbit camera, and hand-built animated SVG scenes using no image files at all.",
    ],
    outcome: [
      "Pure front-end graphics work. The company is fictional and the site says so.",
    ],
    links: [
      { label: "LIVE.SITE", href: "https://space-forge-taupe.vercel.app/eb", primary: true },
    ],
  },
  {
    id: "18",
    name: "H200 MODEL SERVE",
    tagline:
      "An uncensored Qwen on vLLM, an abliterated Qwen on SGLang, one rented H200. Two servers, because vLLM would not load the second checkpoint.",
    tier: 1,
    accent: "cyan",
    status: "SERVED // VM STOPPED",
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
        note: "AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16 — dense 27B, BF16, served with vLLM 0.27.1",
      },
      {
        label: "MODEL.2.ABLITERATED",
        href: "https://huggingface.co/Youssofal/Qwen3.6-35B-A3B-Abliterated-Heretic-BF16",
        note: "Youssofal/Qwen3.6-35B-A3B-Abliterated-Heretic-BF16 — 35B mixture of experts, ~3B active, BF16, served with SGLang",
      },
    ],
    problem:
      "Two open-weight Qwen checkpoints with their refusal behaviour removed. Model 1 is the uncensored one: AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16, dense, 27B, 55.6 GB of weights. Model 2 is the abliterated one: Youssofal/Qwen3.6-35B-A3B-Abliterated-Heretic-BF16, a mixture of experts, 35B total with about 3B active per token. My MacBook Air M3 has 16 GB of unified memory and cannot load either one; model 1 alone needs 70 to 80 GB in BF16 once the KV cache counts. The smaller builds are not an escape: the 4-bit MLX build still wants 32 GB, and a 12 GB GGUF swaps to disk. So I rented a GPU from Nebius.",
    built: [
      "I sized the GPU before I rented anything. One card had to hold model 1 whole, so: gpu-h200-sxm, preset 1gpu-16vcpu-200gb, a single H200 with 141 GB, preemptible at about $2.45 an hour. I skipped the 8-GPU shape because one GPU holds this model, and the L40S because 48 GB is not close; the 80 GB H100 was second choice. The preset name is the trap — that 200 GB is system RAM, not GPU memory. Read it as GPU memory and you rent the wrong machine.",
      "Model 1, AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16, on vLLM 0.27.1. I set every flag and took no defaults — BF16, a 16384-token context, four concurrent sequences, 0.85 GPU memory utilization, the qwen3 reasoning parser, automatic tool choice with the qwen3_coder tool-call parser, the Triton prefill backend for Gated-DeltaNet, and MTP speculative decoding at three draft tokens. The server listened on 127.0.0.1 and I reached it over an SSH tunnel. vLLM binds 0.0.0.0 by default, and a model on a public address has no authentication in front of it.",
      "One error stopped model 1 three times, and it lied about itself: vLLM said it could not examine the Qwen3_5ForConditionalGeneration architecture, which reads like an unsupported model. It was not. Further down the same log, Triton failed to compile a CUDA helper — no Python.h on the machine. python3.12-dev and build-essential fixed it, and vLLM had supported model 1 the whole time.",
      "Model 2, Youssofal/Qwen3.6-35B-A3B-Abliterated-Heretic-BF16, on SGLang: a mixture of experts, 35B total, about 3B active per token, and faster than the dense 27B. I passed on a GGUF build in the same size class — a sidegrade, not a step up. vLLM pulled down 65.39 GiB and 20 of 21 shards, then quit: there is no module or parameter named visual in Qwen3_5Model. The checkpoint carries a vision tower, and vLLM's text loader takes the language experts and refuses the vision weights. SGLang loaded the same repository on the same GPU and the same port, unchanged, and I kept vLLM and model 1 in place as the fallback.",
      "I wrote the chat client too: Python standard library, no framework. It proxies through the tunnel, streams the reply, and appends every exchange to disk as JSONL and Markdown. It looked frozen the first time I ran it, because it painted only delta.content, and a reasoning model spends its opening tokens on reasoning_content.",
      "I wrote the record while the work was still moving: an overview, a status file to restart from, and one note per stretch of work. Its spine is a numbered failure list, and every entry carries a cause and a fix.",
    ],
    outcome: [
      "Both models served on the one H200 and answered through the tunnel. Model 1 settled at roughly 120 GB of the 144 GB the card reports, which is the number I sized for. The weights sit in the Hugging Face cache on the boot disk, so a restart reads them instead of downloading them again. Compile and warmup still take minutes: the second start is cheaper, not free.",
      "The serving stack is not a free choice. Same weights, same GPU, same port: vLLM refused model 2 and SGLang served it, over a vision tower riding along in a checkpoint you would file as text-only. Pick the server when you size the deployment, not after the download finishes.",
      "Five of my failures had nothing to do with the models: SSH to a 10.x address that exists only inside the VPC; a VM created with no public address; the SSH key comment pasted into the username field; a form that wrapped my public key onto two lines; and a bare serve command that quietly started Qwen/Qwen3-0.6B, vLLM's default, on 0.0.0.0. The dynamic public address also disappeared the moment I stopped the VM. A new customer can hit any of these before the GPU ever matters, which is why each one is written down with its cause and its fix.",
      "Both checkpoints have had their refusal behaviour removed, and that is a class of model you can only run yourself. It is the plainest answer I know to why anyone rents a GPU instead of calling a hosted API, and I got it by doing the work rather than arguing the point.",
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
      "I wanted to run a real model on hardware I own rather than through an API, and to learn what actually happens when one model does not fit on one machine. An API hides exactly the parts I wanted to see.",
    built: [
      "Two Mac minis networked over RDMA. RDMA moves data between the machines with very little CPU overhead, which is what makes splitting a model across them worth doing at all.",
      "MLX runs the model on Apple silicon. EXO splits one model across both machines, so the pair can hold a model neither node could run alone.",
      "It serves Hermes as my own agent, at home, every day.",
      "The files are not on my work machine. I keep the cluster separate on purpose.",
    ],
    outcome: [
      "This is the closest thing I own to Nebius's own product shape, at very small scale: one model, split across nodes, over a fast interconnect.",
      "It taught me the parts an API hides — how the interconnect becomes the limit, and how a model behaves when it does not fit on a single machine.",
    ],
  },
];

export const TIER_1 = NEBIUS_PROJECTS.filter((p) => p.tier === 1);
export const TIER_2 = NEBIUS_PROJECTS.filter((p) => p.tier === 2);
export const TIER_3 = NEBIUS_PROJECTS.filter((p) => p.tier === 3);

/**
 * Public X trail. Dated posts of what I was reading: AI, ML, GPU, memory,
 * and interconnect. Assembled from advanced search of @jaredwerba. Not a
 * guaranteed dump of every URL I ever posted — X search pages small, and
 * older tweets often store only a t.co short link.
 */
/**
 * Ledger theme groups, in render order. The four that bear hardest on the role
 * lead; the rest are the same decade of reading, filed honestly.
 */
export const TWEET_THEMES = [
  "AI & ML",
  "GPU & Silicon",
  "Networking",
  "Memory",
  "Cloud & HPC",
  "Data & Databases",
  "Security",
  "Software Engineering",
] as const;

export type TweetTheme = (typeof TWEET_THEMES)[number];

export type TweetLedgerEntry = {
  date: string;
  /** Which thread this post belongs to. Drives the grouping in Public Record. */
  theme: TweetTheme;
  title: string;
  tweetUrl: string;
  sourceUrl?: string;
  /** Short table at the top of Public Record. */
  receipt?: boolean;
  /** Inverse-video row. The four to send first. */
  star?: boolean;
  why?: string;
};

export const TWEET_LEDGER_INTRO: string[] = [
  "I have posted what I was reading since 2017. Most posts are a title and a link. The dates are public.",
  "This is not every tweet I have written. I pulled the whole retrievable timeline and kept the technical ones: AI, ML, GPU, memory, and interconnect. Older posts often store only a short t.co URL, so some are a title and a redirect.",
  "The starred rows are the ones to open first: what to ask an ML/AI company and EC2 bare metal, both in 2017; InfiniBand in 2019; RDMA in July 2020; GPT-3 in August 2020; and RoCE for distributed training in 2024.",
];

export const TWEET_LEDGER: TweetLedgerEntry[] = [
  {
    date: "2017-10-09",
    theme: "Cloud & HPC",
    title: "The rise of container orchestration storage standards",
    tweetUrl: "https://x.com/jaredwerba/status/917407469781086210",
    receipt: true,
    why: "Container orchestration, in 2017.",
  },
  {
    date: "2017-10-13",
    theme: "AI & ML",
    title: "Colorizing B&W photos with neural networks",
    tweetUrl: "https://x.com/jaredwerba/status/918973257344266240",
    receipt: true,
    why: "Neural nets as a working tool, five years before ChatGPT.",
  },
  {
    date: "2017-10-17",
    theme: "Cloud & HPC",
    title: "How to set up world-class continuous deployment using free hosted tools",
    tweetUrl: "https://x.com/jaredwerba/status/920371633004609536",
  },
  {
    date: "2017-10-23",
    theme: "AI & ML",
    title: "Andrew Ng has a chatbot that can help with depression",
    tweetUrl: "https://x.com/jaredwerba/status/922301869640290304",
    receipt: true,
    why: "Applied ML product reading in 2017.",
  },
  {
    date: "2017-10-24",
    theme: "Cloud & HPC",
    title: "HashiCorp raises $40M for its cloud infrastructure automation services",
    tweetUrl: "https://x.com/jaredwerba/status/922928773552590848",
  },
  {
    date: "2017-10-26",
    theme: "GPU & Silicon",
    title: "Introducing Amazon EC2 P3 instances",
    tweetUrl: "https://x.com/jaredwerba/status/923516497036750850",
    receipt: true,
    why: "NVIDIA GPU instances as soon as they shipped.",
  },
  {
    date: "2017-10-28",
    theme: "Security",
    title: "The OWASP Top 10 is killing me, and killing you!",
    tweetUrl: "https://x.com/jaredwerba/status/924414761802125313",
  },
  {
    date: "2017-11-01",
    theme: "Cloud & HPC",
    title: "10 Things to Consider when Securing Docker",
    tweetUrl: "https://x.com/jaredwerba/status/925711242903343104",
  },
  {
    date: "2017-11-04",
    theme: "Cloud & HPC",
    title: "Azure Functions Now Support Java",
    tweetUrl: "https://x.com/jaredwerba/status/926670669659635713",
  },
  {
    date: "2017-11-10",
    theme: "AI & ML",
    title: "Business questions engineers should ask when interviewing at ML/AI companies",
    tweetUrl: "https://x.com/jaredwerba/status/928829344113397760",
    receipt: true,
    star: true,
    why: "Explicit ML/AI career interest in 2017.",
  },
  {
    date: "2017-11-10",
    theme: "GPU & Silicon",
    title: "Observing the A11's Heterogenous Cores",
    tweetUrl: "https://x.com/jaredwerba/status/929044799889530880",
  },
  {
    date: "2017-11-16",
    theme: "Cloud & HPC",
    title: "Linux totally dominates supercomputers",
    tweetUrl: "https://x.com/jaredwerba/status/930992098698055680",
    receipt: true,
    why: "HPC cluster OS, not just the app layer.",
  },
  {
    date: "2017-11-18",
    theme: "Software Engineering",
    title: "Augmenting a Ruby on Rails App with Vue.js",
    tweetUrl: "https://x.com/jaredwerba/status/931965542465966080",
  },
  {
    date: "2017-11-18",
    theme: "Software Engineering",
    title: "The React Story: How Facebook's Instagram Acquisition",
    tweetUrl: "https://x.com/jaredwerba/status/931985527691149315",
  },
  {
    date: "2017-11-29",
    theme: "GPU & Silicon",
    title: "Amazon EC2 Bare Metal Instances with Direct Access to Hardware",
    tweetUrl: "https://x.com/jaredwerba/status/935824872969732098",
    receipt: true,
    star: true,
    why: "Direct hardware access. No hypervisor tax.",
  },
  {
    date: "2017-12-01",
    theme: "GPU & Silicon",
    title: "BlazingDB Origins — raised from NVIDIA and Samsung",
    tweetUrl: "https://x.com/jaredwerba/status/936386827069591552",
    receipt: true,
    why: "GPU databases, not just GPUs as graphics.",
  },
  {
    date: "2017-12-01",
    theme: "Cloud & HPC",
    title: "AWS announces a serverless database service",
    tweetUrl: "https://x.com/jaredwerba/status/936424094786080768",
  },
  {
    date: "2017-12-04",
    theme: "Cloud & HPC",
    title: "WebAssembly Now Supported across All Browsers",
    tweetUrl: "https://x.com/jaredwerba/status/937660612854902785",
  },
  {
    date: "2017-12-04",
    theme: "Cloud & HPC",
    title: "Serverless Aurora: What it means and why it's the future of data",
    tweetUrl: "https://x.com/jaredwerba/status/937810525299380225",
  },
  {
    date: "2017-12-08",
    theme: "Security",
    title: "Microsoft leaks TLS private key for cloud ERP product",
    tweetUrl: "https://x.com/jaredwerba/status/939247228581023750",
  },
  {
    date: "2017-12-11",
    theme: "Cloud & HPC",
    title: "WebAssembly, an executable format for the web",
    tweetUrl: "https://x.com/jaredwerba/status/940310702924947456",
  },
  {
    date: "2017-12-16",
    theme: "Security",
    title: "Project Zero: privileged UI injected into pages",
    tweetUrl: "https://x.com/jaredwerba/status/941860146296377344",
  },
  {
    date: "2017-12-18",
    theme: "Memory",
    title: "APFS",
    tweetUrl: "https://x.com/jaredwerba/status/942754650180157443",
  },
  {
    date: "2017-12-19",
    theme: "Cloud & HPC",
    title: "Introduction to WebAssembly",
    tweetUrl: "https://x.com/jaredwerba/status/943070015783342080",
  },
  {
    date: "2017-12-26",
    theme: "Cloud & HPC",
    title: "Computer latency: 1977-2017",
    tweetUrl: "https://x.com/jaredwerba/status/945788796200783874",
    receipt: true,
    why: "Latency as a measured quantity.",
  },
  {
    date: "2018-01-22",
    theme: "GPU & Silicon",
    title: "Bitmain buys 20k 16nm wafers a month from TSMC, more than NVIDIA",
    tweetUrl: "https://x.com/jaredwerba/status/955589685996347392",
    receipt: true,
    why: "GPU supply chain, while it was still a mining story.",
  },
  {
    date: "2018-01-28",
    theme: "Memory",
    title: "Intel Optane Memory: How to make revolutionary technology totally boring",
    tweetUrl: "https://x.com/jaredwerba/status/957602685443813376",
    receipt: true,
    why: "Persistent memory, same day as 3D XPoint.",
  },
  {
    date: "2018-01-28",
    theme: "Memory",
    title: "Intel: Meltdown, Spectre silicon fixes coming 2018; 3D XPoint RAM, not so much",
    tweetUrl: "https://x.com/jaredwerba/status/957602731736387589",
    sourceUrl:
      "https://arstechnica.com/gadgets/2018/01/intel-meltdown-spectre-silicon-fixes-coming-2018-3d-xpoint-ram-not-so-much/",
    receipt: true,
    why: "3D XPoint / storage-class memory, years before CXL talk.",
  },
  {
    date: "2018-01-30",
    theme: "GPU & Silicon",
    title: "How Apple Built a Chip Powerhouse to Threaten Qualcomm and Intel",
    tweetUrl: "https://x.com/jaredwerba/status/958142393051766784",
  },
  {
    date: "2018-02-21",
    theme: "AI & ML",
    title: "NVIDIA FastPhotoStyle",
    tweetUrl: "https://x.com/jaredwerba/status/966104218510741504",
    sourceUrl:
      "https://github.com/NVIDIA/FastPhotoStyle",
    receipt: true,
    why: "NVIDIA research repo, not consumer GPUs.",
  },
  {
    date: "2018-04-02",
    theme: "Security",
    title: "Data Integrity Follow Up: Ways to Protect Your Data",
    tweetUrl: "https://x.com/jaredwerba/status/980657288678526976",
  },
  {
    date: "2018-05-12",
    theme: "Networking",
    title: "Passive Wi-Fi: Bringing Low Power to Wi-Fi Transmissions",
    tweetUrl: "https://x.com/jaredwerba/status/995344771823620098",
  },
  {
    date: "2018-05-16",
    theme: "Cloud & HPC",
    title: "What is edge computing?",
    tweetUrl: "https://x.com/jaredwerba/status/996851184823566336",
  },
  {
    date: "2018-05-26",
    theme: "Cloud & HPC",
    title: "Living in a Docker world",
    tweetUrl: "https://x.com/jaredwerba/status/1000508850909392898",
  },
  {
    date: "2018-06-06",
    theme: "AI & ML",
    title: "How NLP is transforming the news industry",
    tweetUrl: "https://x.com/jaredwerba/status/1004349414012588032",
    receipt: true,
    why: "NLP two years before GPT-3.",
  },
  {
    date: "2018-06-23",
    theme: "Data & Databases",
    title: "5 Benefits of Using MYSQL",
    tweetUrl: "https://x.com/jaredwerba/status/1010594314936778759",
  },
  {
    date: "2018-07-19",
    theme: "Cloud & HPC",
    title: "How Facebook configures its millions of servers every day",
    tweetUrl: "https://x.com/jaredwerba/status/1020040631236943873",
  },
  {
    date: "2018-08-06",
    theme: "AI & ML",
    title: "T2F: text to face generation using Deep Learning",
    tweetUrl: "https://x.com/jaredwerba/status/1026379661608214528",
    receipt: true,
    why: "Generative models before the GAN-Twitter era.",
  },
  {
    date: "2018-08-21",
    theme: "Cloud & HPC",
    title: "Using AWS EC2 instance store vs EBS for MySQL",
    tweetUrl: "https://x.com/jaredwerba/status/1031877481228320768",
  },
  {
    date: "2018-08-24",
    theme: "Cloud & HPC",
    title: "Adtech Startup Overcomes Cloud Infrastructure Gridlock",
    tweetUrl: "https://x.com/jaredwerba/status/1033031234698575872",
  },
  {
    date: "2018-08-29",
    theme: "Cloud & HPC",
    title: "Google steps back from running the Kubernetes infrastructure",
    tweetUrl: "https://x.com/jaredwerba/status/1034851702019698688",
    receipt: true,
    why: "Who carries the operational load.",
  },
  {
    date: "2018-09-03",
    theme: "AI & ML",
    title: "Deep Angel, The Artificial Intelligence of Absence",
    tweetUrl: "https://x.com/jaredwerba/status/1036521558678884353",
  },
  {
    date: "2018-09-14",
    theme: "Security",
    title: "TLS 1.3 is approved",
    tweetUrl: "https://x.com/jaredwerba/status/1040605632364269569",
  },
  {
    date: "2018-10-05",
    theme: "Cloud & HPC",
    title: "A Brief History of High Availability",
    tweetUrl: "https://x.com/jaredwerba/status/1048229511756701697",
  },
  {
    date: "2018-10-17",
    theme: "Cloud & HPC",
    title: "How We Built Snowflake on Azure",
    tweetUrl: "https://x.com/jaredwerba/status/1052349889022226432",
  },
  {
    date: "2018-10-26",
    theme: "AI & ML",
    title: "Generating custom photo-realistic faces using AI",
    tweetUrl: "https://x.com/jaredwerba/status/1055871284264030209",
    receipt: true,
    why: "Same generative-model thread, 2018.",
  },
  {
    date: "2018-11-01",
    theme: "AI & ML",
    title: "Optical character recognition",
    tweetUrl: "https://x.com/jaredwerba/status/1058092721557159936",
  },
  {
    date: "2018-11-11",
    theme: "GPU & Silicon",
    title: "Why Intel Processors Draw More Power Than Expected: TDP and Turbo Explained",
    tweetUrl: "https://x.com/jaredwerba/status/1061711515194142720",
  },
  {
    date: "2018-12-07",
    theme: "Cloud & HPC",
    title: "Basic Docker Node.js Setup",
    tweetUrl: "https://x.com/jaredwerba/status/1071092220906926081",
  },
  {
    date: "2018-12-13",
    theme: "Cloud & HPC",
    title: "AWS Outperforms GCP in the 2018 Cloud Report",
    tweetUrl: "https://x.com/jaredwerba/status/1073338310343430145",
  },
  {
    date: "2018-12-17",
    theme: "Software Engineering",
    title: "The Most Important Software Innovations",
    tweetUrl: "https://x.com/jaredwerba/status/1074659521493155840",
  },
  {
    date: "2018-12-20",
    theme: "Data & Databases",
    title: "Bye bye Mongo, Hello Postgres",
    tweetUrl: "https://x.com/jaredwerba/status/1075616924770287616",
  },
  {
    date: "2019-01-14",
    theme: "Cloud & HPC",
    title: "AWS, MongoDB, and the Economic Realities of Open Source",
    tweetUrl: "https://x.com/jaredwerba/status/1084801371201830913",
  },
  {
    date: "2019-03-06",
    theme: "Cloud & HPC",
    title: "Microservices, Containers and Kubernetes in 10 minutes",
    tweetUrl: "https://x.com/jaredwerba/status/1103361222211186689",
  },
  {
    date: "2019-03-07",
    theme: "Cloud & HPC",
    title: "Serverless Architecture: When To Use This Approach",
    tweetUrl: "https://x.com/jaredwerba/status/1103712806736723968",
  },
  {
    date: "2019-04-26",
    theme: "Cloud & HPC",
    title: "6 Technical Challenges Developing a Distributed SQL Database",
    tweetUrl: "https://x.com/jaredwerba/status/1121892106161803264",
    sourceUrl:
      "https://blog.yugabyte.com/6-technical-challenges-developing-a-distributed-sql-database/",
  },
  {
    date: "2019-04-30",
    theme: "Memory",
    title: "Data in a Flash: the Evolution of Disk Storage and NVMe",
    tweetUrl: "https://x.com/jaredwerba/status/1123237047249063936",
    sourceUrl:
      "https://www.linuxjournal.com/content/data-flash-part-i-evolution-disk-storage-and",
  },
  {
    date: "2019-06-09",
    theme: "Cloud & HPC",
    title: "AWS costs every programmer should know",
    tweetUrl: "https://x.com/jaredwerba/status/1137763212240261120",
  },
  {
    date: "2019-07-24",
    theme: "Cloud & HPC",
    title: "Oracle Cloud — Networking as a differentiator?",
    tweetUrl: "https://x.com/jaredwerba/status/1154144784963055622",
    receipt: true,
    why: "Cloud networking as the product, not the tax.",
  },
  {
    date: "2019-09-08",
    theme: "Networking",
    title: "Oracle engineers its own InfiniBand interconnects",
    tweetUrl: "https://x.com/jaredwerba/status/1170785178681315331",
    sourceUrl:
      "https://www.nextplatform.com/connect/2016/02/23/oracle-engineers-its-own-infiniband-interconnects/1652732",
    receipt: true,
    star: true,
    why: "InfiniBand reading in 2019. The strongest interconnect receipt.",
  },
  {
    date: "2019-09-22",
    theme: "Memory",
    title: "Intel Announces New Optane DC Persistent Memory",
    tweetUrl: "https://x.com/jaredwerba/status/1175842173243277319",
    sourceUrl:
      "https://www.extremetech.com/extreme/270270-intel-announces-new-optane-dc-persistent-memory",
    receipt: true,
    why: "Server-class persistent memory.",
  },
  {
    date: "2019-09-29",
    theme: "Data & Databases",
    title: "NCBI paper",
    tweetUrl: "https://x.com/jaredwerba/status/1178317280096276481",
    sourceUrl:
      "https://pmc.ncbi.nlm.nih.gov/articles/PMC3541490/",
  },
  {
    date: "2019-10-09",
    theme: "Networking",
    title: "Oracle network layers",
    tweetUrl: "https://x.com/jaredwerba/status/1181741486301417472",
    sourceUrl:
      "https://docs.oracle.com/cd/E18283_01/network.112/e10836/layers.htm",
  },
  {
    date: "2019-10-09",
    theme: "Security",
    title: "Authentication vs federation vs SSO",
    tweetUrl: "https://x.com/jaredwerba/status/1181745687622488065",
  },
  {
    date: "2019-10-16",
    theme: "Cloud & HPC",
    title: "Do Oracle Cloud's no-Oracle-code servers make it more secure?",
    tweetUrl: "https://x.com/jaredwerba/status/1184407573816102912",
  },
  {
    date: "2019-10-18",
    theme: "Cloud & HPC",
    title: "OCI Identity federation",
    tweetUrl: "https://x.com/jaredwerba/status/1185214993496772609",
  },
  {
    date: "2019-10-22",
    theme: "GPU & Silicon",
    title: "Why the Apple A13 Bionic blows past Qualcomm Snapdragon 855 Plus",
    tweetUrl: "https://x.com/jaredwerba/status/1186730738181390336",
  },
  {
    date: "2019-10-23",
    theme: "Cloud & HPC",
    title: "SSO E-Business Suite / Azure AD",
    tweetUrl: "https://x.com/jaredwerba/status/1187074722430967808",
  },
  {
    date: "2019-10-26",
    theme: "Software Engineering",
    title: "Event-driven programming",
    tweetUrl: "https://x.com/jaredwerba/status/1188097950892867585",
    sourceUrl:
      "https://en.wikipedia.org/wiki/Event-driven_programming",
  },
  {
    date: "2019-10-26",
    theme: "Software Engineering",
    title: "RabbitMQ tutorials",
    tweetUrl: "https://x.com/jaredwerba/status/1188107135311319041",
    sourceUrl:
      "https://www.rabbitmq.com/tutorials",
  },
  {
    date: "2019-10-26",
    theme: "Data & Databases",
    title: "MySQL + Node.js",
    tweetUrl: "https://x.com/jaredwerba/status/1188208349340405760",
  },
  {
    date: "2019-11-01",
    theme: "Cloud & HPC",
    title: "Real-time operating system",
    tweetUrl: "https://x.com/jaredwerba/status/1190219843984867333",
    sourceUrl:
      "https://en.wikipedia.org/wiki/Real-time_operating_system?wprov=sfti1",
  },
  {
    date: "2019-11-03",
    theme: "Security",
    title: "Certificate authority",
    tweetUrl: "https://x.com/jaredwerba/status/1191124923223334915",
    sourceUrl:
      "https://en.wikipedia.org/wiki/Certificate_authority",
  },
  {
    date: "2019-11-04",
    theme: "Data & Databases",
    title: "Oracle vs Hadoop",
    tweetUrl: "https://x.com/jaredwerba/status/1191345805086666753",
  },
  {
    date: "2019-11-06",
    theme: "GPU & Silicon",
    title: "ARM to A4 — how Apple changed mobile silicon",
    tweetUrl: "https://x.com/jaredwerba/status/1192126334031544321",
  },
  {
    date: "2019-12-09",
    theme: "Cloud & HPC",
    title: "The sad state of sysadmin in the age of containers",
    tweetUrl: "https://x.com/jaredwerba/status/1204049743288193024",
    sourceUrl:
      "https://www.vitavonni.de/blog/201503/2015031201-the-sad-state-of-sysadmin-in-the-age-of-containers.html",
  },
  {
    date: "2019-12-17",
    theme: "Cloud & HPC",
    title: "Distributed database",
    tweetUrl: "https://x.com/jaredwerba/status/1207020569637642240",
    sourceUrl:
      "https://en.wikipedia.org/wiki/Distributed_database",
  },
  {
    date: "2019-12-17",
    theme: "Data & Databases",
    title: "Oracle / SQL Server migrations",
    tweetUrl: "https://x.com/jaredwerba/status/1207065859124027392",
    sourceUrl:
      "https://www.toptal.com/sql/oracle-sql-server-migrations-pt-3",
  },
  {
    date: "2019-12-19",
    theme: "Security",
    title: "How tracking pixels work",
    tweetUrl: "https://x.com/jaredwerba/status/1207648569060143104",
    sourceUrl:
      "https://jvns.ca/blog/how-tracking-pixels-work/",
  },
  {
    date: "2020-01-05",
    theme: "Security",
    title: "DARPA LifeLog",
    tweetUrl: "https://x.com/jaredwerba/status/1213944887957164032",
    sourceUrl:
      "https://en.wikipedia.org/wiki/DARPA_LifeLog",
  },
  {
    date: "2020-01-23",
    theme: "Security",
    title: "Metasploit Project",
    tweetUrl: "https://x.com/jaredwerba/status/1220472774172475397",
  },
  {
    date: "2020-02-14",
    theme: "Software Engineering",
    title: "Regular expression",
    tweetUrl: "https://x.com/jaredwerba/status/1228148536384139264",
  },
  {
    date: "2020-05-14",
    theme: "Security",
    title: "Wildcard certificate",
    tweetUrl: "https://x.com/jaredwerba/status/1260926012759724039",
    sourceUrl:
      "https://en.wikipedia.org/wiki/Wildcard_certificate",
  },
  {
    date: "2020-05-26",
    theme: "Cloud & HPC",
    title: "AWS essay",
    tweetUrl: "https://x.com/jaredwerba/status/1265247871085002752",
    sourceUrl:
      "https://adayinthelifeof.nl/2020/05/20/aws.html",
  },
  {
    date: "2020-05-30",
    theme: "Security",
    title: "Tenable Nessus Professional",
    tweetUrl: "https://x.com/jaredwerba/status/1266731755853058049",
    sourceUrl:
      "https://www.tenable.com/products/nessus/nessus-professional",
  },
  {
    date: "2020-06-11",
    theme: "GPU & Silicon",
    title: "Generic block diagram of a GPU",
    tweetUrl: "https://x.com/jaredwerba/status/1271186080948240384",
    receipt: true,
    why: "Hardware-level GPU study, not just “use CUDA”.",
  },
  {
    date: "2020-06-18",
    theme: "Cloud & HPC",
    title: "Programming notes on monitors",
    tweetUrl: "https://x.com/jaredwerba/status/1273588139467124736",
    sourceUrl:
      "https://tonsky.me/blog/monitors/",
  },
  {
    date: "2020-06-28",
    theme: "Security",
    title: "Encrypted DNS on Apple devices",
    tweetUrl: "https://x.com/jaredwerba/status/1277218379909287936",
  },
  {
    date: "2020-07-12",
    theme: "Networking",
    title: "Remote direct memory access",
    tweetUrl: "https://x.com/jaredwerba/status/1282138164153536512",
    sourceUrl:
      "https://en.wikipedia.org/wiki/Remote_direct_memory_access",
    receipt: true,
    star: true,
    why: "RDMA, two years before the ChatGPT cluster boom.",
  },
  {
    date: "2020-07-16",
    theme: "Data & Databases",
    title: "Data manipulation language",
    tweetUrl: "https://x.com/jaredwerba/status/1283845174242816002",
    sourceUrl:
      "https://en.wikipedia.org/wiki/Data_manipulation_language",
  },
  {
    date: "2020-07-30",
    theme: "Cloud & HPC",
    title: "IaaS pricing patterns and trends 2020",
    tweetUrl: "https://x.com/jaredwerba/status/1288938071187173376",
    sourceUrl:
      "https://redmonk.com/rstephens/2020/07/10/iaas-pricing-patterns-and-trends-2020/",
  },
  {
    date: "2020-08-17",
    theme: "AI & ML",
    title: "GPT-3",
    tweetUrl: "https://x.com/jaredwerba/status/1295451720626188290",
    sourceUrl:
      "https://en.wikipedia.org/wiki/GPT-3",
    receipt: true,
    star: true,
    why: "GPT-3 the month the API started spreading.",
  },
  {
    date: "2020-09-18",
    theme: "Security",
    title: "OWASP source-code analysis tools",
    tweetUrl: "https://x.com/jaredwerba/status/1306956082011688961",
    sourceUrl:
      "https://owasp.org/www-community/Source_Code_Analysis_Tools",
  },
  {
    date: "2020-09-21",
    theme: "Cloud & HPC",
    title: "Difference between VDI, VHD, VMDK, VHDX",
    tweetUrl: "https://x.com/jaredwerba/status/1308118184889856000",
  },
  {
    date: "2020-11-07",
    theme: "GPU & Silicon",
    title: "Look inside iPad Pro 11's LiDAR scanner",
    tweetUrl: "https://x.com/jaredwerba/status/1325071893397909504",
  },
  {
    date: "2021-05-16",
    theme: "Security",
    title: "Zero-knowledge proof",
    tweetUrl: "https://x.com/jaredwerba/status/1393737427609653250",
    sourceUrl:
      "https://en.wikipedia.org/wiki/Zero-knowledge_proof",
  },
  {
    date: "2021-12-23",
    theme: "Cloud & HPC",
    title: "Using Apache Airflow to orchestrate Oracle Cloud Functions",
    tweetUrl: "https://x.com/jaredwerba/status/1473819926876114948",
    sourceUrl:
      "https://blogs.oracle.com/cloud-infrastructure/post/using-apache-airflow-orchestrate-oracle-cloud-functions",
  },
  {
    date: "2021-12-24",
    theme: "Cloud & HPC",
    title: "Apple to Apple Comparison: M1 Max vs Intel — Unifying CS and HPC for the future of AGI",
    tweetUrl: "https://x.com/jaredwerba/status/1474441311994494982",
    sourceUrl:
      "https://www.unum.cloud/post/2021-12-21-macbook/",
    receipt: true,
    why: "HPC and AGI in the same sentence, 2021.",
  },
  {
    date: "2022-02-23",
    theme: "AI & ML",
    title: "CRISP-DM",
    tweetUrl: "https://x.com/jaredwerba/status/1496312908510289922",
    sourceUrl:
      "https://en.wikipedia.org/wiki/Cross-industry_standard_process_for_data_mining",
    receipt: true,
    why: "A named process for ML work, not a vibe.",
  },
  {
    date: "2022-05-28",
    theme: "AI & ML",
    title: "DeepDream",
    tweetUrl: "https://x.com/jaredwerba/status/1530553642725646338",
    sourceUrl:
      "https://en.wikipedia.org/wiki/DeepDream",
    receipt: true,
    why: "Generative models, still tracking them in 2022.",
  },
  {
    date: "2022-09-06",
    theme: "Cloud & HPC",
    title: "what is edge compute",
    tweetUrl: "https://x.com/jaredwerba/status/1567227596198363137",
    receipt: true,
    why: "Edge compute, before I put a model on a headset.",
  },
  {
    date: "2022-11-03",
    theme: "Data & Databases",
    title: "DDL DML DCL",
    tweetUrl: "https://x.com/jaredwerba/status/1588211407832727553",
  },
  {
    date: "2022-12-05",
    theme: "AI & ML",
    title: "Generative Adversarial Network",
    tweetUrl: "https://x.com/jaredwerba/status/1599564262266937345",
    receipt: true,
    why: "GAN Wikipedia. Same breadcrumb style.",
  },
  {
    date: "2023-07-14",
    theme: "AI & ML",
    title: "Oracle Generative AI",
    tweetUrl: "https://x.com/jaredwerba/status/1679644978388037632",
    sourceUrl:
      "https://www.oracle.com/artificial-intelligence/generative-ai/",
    receipt: true,
    why: "GenAI product page as it launched.",
  },
  {
    date: "2023-07-25",
    theme: "GPU & Silicon",
    title: "Oracle & NVIDIA solve the largest AI and NLP models",
    tweetUrl: "https://x.com/jaredwerba/status/1683950594820546560",
    sourceUrl:
      "https://blogs.oracle.com/cloud-infrastructure/post/oracle-partners-with-nvidia-to-solve-the-largest-ai-and-nlp-models",
    receipt: true,
    why: "I quoted my own 2019 Optane tweet. 2019 memory work tied to 2023 GPU-cluster AI.",
  },
  {
    date: "2023-09-23",
    theme: "AI & ML",
    title: "OCI Gen AI Preview",
    tweetUrl: "https://x.com/jaredwerba/status/1705637338615812266",
    sourceUrl:
      "https://www.youtube.com/live/ESuP_rtTeQo?si=--4TiLoMz2j0N2rR&t=2843",
    receipt: true,
    why: "Watching the actual OCI genAI preview.",
  },
  {
    date: "2023-10-02",
    theme: "AI & ML",
    title: "What Is Retrieval-Augmented Generation (RAG)?",
    tweetUrl: "https://x.com/jaredwerba/status/1708875261322711098",
    sourceUrl:
      "https://www.oracle.com/artificial-intelligence/generative-ai/retrieval-augmented-generation-rag/",
    receipt: true,
    why: "RAG as it entered the stack.",
  },
  {
    date: "2023-10-27",
    theme: "AI & ML",
    title: "Deploy Llama 2 in OCI Data Science",
    tweetUrl: "https://x.com/jaredwerba/status/1717933771591209026",
    receipt: true,
    why: "Open-weight serving on GPU cloud.",
  },
  {
    date: "2023-12-01",
    theme: "AI & ML",
    title: "What Is Retrieval Augmented Generation",
    tweetUrl: "https://x.com/jaredwerba/status/1730713785340723475",
    receipt: true,
    why: "RAG again, two months after the first one.",
  },
  {
    date: "2023-12-07",
    theme: "Data & Databases",
    title: "Data Oriented Design",
    tweetUrl: "https://x.com/jaredwerba/status/1732575258966995131",
  },
  {
    date: "2023-12-07",
    theme: "AI & ML",
    title: "Models — Machine Learning — Apple Developer",
    tweetUrl: "https://x.com/jaredwerba/status/1732616808514138444",
    receipt: true,
    why: "On-device inference, from the vendor's own docs.",
  },
  {
    date: "2023-12-19",
    theme: "AI & ML",
    title: "Prompt engineering — OpenAI API",
    tweetUrl: "https://x.com/jaredwerba/status/1737163052934475823",
    receipt: true,
    why: "The provider's guide, not a thread about it.",
  },
  {
    date: "2024-03-13",
    theme: "AI & ML",
    title: "Building Meta’s GenAI Infrastructure",
    tweetUrl: "https://x.com/jaredwerba/status/1767915599748112716",
    receipt: true,
    why: "Cluster and fabric design, not just models.",
  },
  {
    date: "2024-05-22",
    theme: "AI & ML",
    title: "AI Vector Search",
    tweetUrl: "https://x.com/jaredwerba/status/1793312577084129438",
    sourceUrl:
      "https://www.youtube.com/watch?v=5o5Ds8KLqVw",
    receipt: true,
    why: "Embeddings and vector search, 2024.",
  },
  {
    date: "2024-06-13",
    theme: "Networking",
    title: "Reply in the 2019 InfiniBand thread",
    tweetUrl: "https://x.com/jaredwerba/status/1801320252468564208",
    receipt: true,
    why: "Same thread, five years later.",
  },
  {
    date: "2024-06-28",
    theme: "Cloud & HPC",
    title: "Why is VMware on OCI different",
    tweetUrl: "https://x.com/jaredwerba/status/1806665613479207367",
  },
  {
    date: "2024-07-02",
    theme: "Cloud & HPC",
    title: "Bring your own model to OCI Data Science AI Quick Actions",
    tweetUrl: "https://x.com/jaredwerba/status/1808158210731159739",
  },
  {
    date: "2024-07-19",
    theme: "AI & ML",
    title: "Implement Semantic Search in Oracle APEX using AI Vector Search of Oracle Database 23ai",
    tweetUrl: "https://x.com/jaredwerba/status/1814272473631764686",
    receipt: true,
    why: "Vector search inside a database I sold.",
  },
  {
    date: "2024-07-25",
    theme: "AI & ML",
    title: "Open-weights genAI models — control & transparency",
    tweetUrl: "https://x.com/jaredwerba/status/1816480103557185617",
    receipt: true,
    why: "Why open weights, before I served them myself.",
  },
  {
    date: "2024-08-02",
    theme: "Cloud & HPC",
    title: "Databricks vs Snowflake: A Complete 2024 Comparison",
    tweetUrl: "https://x.com/jaredwerba/status/1819451560042418315",
  },
  {
    date: "2024-08-05",
    theme: "Networking",
    title: "RoCE networks for distributed AI training at scale",
    tweetUrl: "https://x.com/jaredwerba/status/1820550430667276400",
    receipt: true,
    star: true,
    why: "Ethernet-RDMA versus InfiniBand, at training scale.",
  },
  {
    date: "2024-09-25",
    theme: "AI & ML",
    title: "Fine-tune and deploy Llama 3.2 models on OCI Data Science",
    tweetUrl: "https://x.com/jaredwerba/status/1839068099586228566",
    receipt: true,
    why: "Open-weight training and serve.",
  },
  {
    date: "2024-09-27",
    theme: "Cloud & HPC",
    title: "OCI Utilities on Oracle Linux",
    tweetUrl: "https://x.com/jaredwerba/status/1839722472607830446",
  },
  {
    date: "2024-10-28",
    theme: "Cloud & HPC",
    title: "MacVTap",
    tweetUrl: "https://x.com/jaredwerba/status/1850954241717784689",
    sourceUrl:
      "https://en.wikipedia.org/wiki/MacVTap?wprov=sfti1",
  },
  {
    date: "2024-12-28",
    theme: "AI & ML",
    title: "OpenAI is running the 2000s Google playbook",
    tweetUrl: "https://x.com/jaredwerba/status/1873060011389133259",
    receipt: true,
    why: "Where the model market is going.",
  },
  {
    date: "2024-12-29",
    theme: "Data & Databases",
    title: "Autonomous Data Management: Andrew Mendelsohn at Oracle OpenWorld 2019",
    tweetUrl: "https://x.com/jaredwerba/status/1873411001133228086",
  },
  {
    date: "2025-02-11",
    theme: "Data & Databases",
    title: "ZippyDB: Facebook's key value store",
    tweetUrl: "https://x.com/jaredwerba/status/1889345576912736536",
    sourceUrl:
      "https://engineering.fb.com/2021/08/06/core-infra/zippydb/",
  },
  {
    date: "2025-03-19",
    theme: "Networking",
    title: "Quantum-2 InfiniBand Platform",
    tweetUrl: "https://x.com/jaredwerba/status/1902410926500004322",
    sourceUrl:
      "https://www.nvidia.com/en-us/networking/quantum2/",
    receipt: true,
    why: "Current-gen InfiniBand fabric.",
  },
  {
    date: "2025-04-12",
    theme: "GPU & Silicon",
    title: "Overjet training models on GPU clusters",
    tweetUrl: "https://x.com/jaredwerba/status/1911040409079267574",
    receipt: true,
    why: "GPU cluster training in production.",
  },
  {
    date: "2025-05-28",
    theme: "AI & ML",
    title: "Frontier models will specialise by industry",
    tweetUrl: "https://x.com/jaredwerba/status/1927553249470468536",
    receipt: true,
    why: "A dated call on specialised models.",
  },
  {
    date: "2025-06-04",
    theme: "Cloud & HPC",
    title: "Oracle Cloud economics",
    tweetUrl: "https://x.com/jaredwerba/status/1930254863448834392",
    sourceUrl:
      "https://www.oracle.com/cloud/economics/",
  },
  {
    date: "2025-06-18",
    theme: "GPU & Silicon",
    title: "AMD’s CDNA 4 Architecture Announcement",
    tweetUrl: "https://x.com/jaredwerba/status/1935140753446953245",
    sourceUrl:
      "https://chipsandcheese.com/p/amds-cdna-4-architecture-announcement",
    receipt: true,
    why: "GPU microarchitecture, not only NVIDIA.",
  },
  {
    date: "2025-06-18",
    theme: "Networking",
    title: "Ultra Ethernet Consortium",
    tweetUrl: "https://x.com/jaredwerba/status/1935141352985215367",
    receipt: true,
    why: "Next-gen Ethernet for AI fabrics.",
  },
  {
    date: "2025-06-25",
    theme: "GPU & Silicon",
    title: "Basic facts about GPUs",
    tweetUrl: "https://x.com/jaredwerba/status/1937878665045426178",
    sourceUrl:
      "https://damek.github.io/random/basic-facts-about-gpus/",
    receipt: true,
    why: "Bottlenecks, occupancy, measurement.",
  },
  {
    date: "2025-06-29",
    theme: "Cloud & HPC",
    title: "I want a good parallel computer",
    tweetUrl: "https://x.com/jaredwerba/status/1939418237856370847",
    sourceUrl:
      "https://raphlinus.github.io/gpu/2025/03/21/good-parallel-computer.html",
    receipt: true,
    why: "Parallel-machine design.",
  },
  {
    date: "2025-06-30",
    theme: "AI & ML",
    title: "Advanced Insights: Deploying Intelligence at Scale",
    tweetUrl: "https://x.com/jaredwerba/status/1939806421089919012",
    sourceUrl:
      "https://www.youtube.com/watch?v=QF1Qo9ktwHo",
  },
  {
    date: "2025-06-30",
    theme: "Cloud & HPC",
    title: "Hybrid Search with OCI PostgreSQL",
    tweetUrl: "https://x.com/jaredwerba/status/1939811659704394167",
  },
  {
    date: "2025-07-12",
    theme: "Cloud & HPC",
    title: "Zettascale Computing — 10^21 FLOPS + OCI Superclusters",
    tweetUrl: "https://x.com/jaredwerba/status/1944083149509587186",
    sourceUrl:
      "https://en.wikipedia.org/wiki/Zettascale_computing",
    receipt: true,
    why: "Supercluster first principles.",
  },
  {
    date: "2025-07-30",
    theme: "AI & ML",
    title: "Oracle OAC AI Assistant",
    tweetUrl: "https://x.com/jaredwerba/status/1950527498539733026",
  },
  {
    date: "2025-08-03",
    theme: "Cloud & HPC",
    title: "Oracle GovCloud + Dedicated Region",
    tweetUrl: "https://x.com/jaredwerba/status/1952044569522278687",
  },
  {
    date: "2025-08-05",
    theme: "Data & Databases",
    title: "Autonomous Database Select AI",
    tweetUrl: "https://x.com/jaredwerba/status/1952532298613588455",
    sourceUrl:
      "https://docs.oracle.com/en-us/iaas/autonomous-database-serverless/doc/select-ai-about.html",
  },
  {
    date: "2025-08-16",
    theme: "AI & ML",
    title: "BCI + NeuroLM + screen recording that models engagement",
    tweetUrl: "https://x.com/jaredwerba/status/1956532146060890336",
    receipt: true,
    why: "Extending the hackathon build, in public.",
  },
  {
    date: "2025-09-04",
    theme: "AI & ML",
    title: "Dylan Patel on GPT-5's router moment, GPUs vs TPUs",
    tweetUrl: "https://x.com/jaredwerba/status/1963407408283124206",
    receipt: true,
    why: "Routing, and accelerator economics.",
  },
  {
    date: "2025-09-30",
    theme: "Networking",
    title: "Is this like RDMA or InfiniBand? Is this networking?",
    tweetUrl: "https://x.com/jaredwerba/status/1973006362537074888",
    receipt: true,
    why: "Asking the interconnect question in public.",
  },
  {
    date: "2026-02-13",
    theme: "AI & ML",
    title: "GPT-5.3-Codex trains its own successor",
    tweetUrl: "https://x.com/jaredwerba/status/2022410897030041957",
    receipt: true,
    why: "Models training the next model.",
  },
  {
    date: "2026-02-24",
    theme: "Networking",
    title: "What about unified memory & RDMA tho?",
    tweetUrl: "https://x.com/jaredwerba/status/2026366599729647728",
    receipt: true,
    why: "Still thinking in fabrics, not just tokens.",
  },
  {
    date: "2026-03-03",
    theme: "GPU & Silicon",
    title: "Memory IO is not unified. The M5 Max fuses CPU and GPU memory",
    tweetUrl: "https://x.com/jaredwerba/status/2028939571447103883",
    receipt: true,
    why: "Reading memory IO, not headline specs.",
  },
  {
    date: "2026-03-12",
    theme: "Networking",
    title: "Lights off bc your utilities bill for 24 RDMA Mac studios",
    tweetUrl: "https://x.com/jaredwerba/status/2032087875521565059",
    receipt: true,
    why: "RDMA at home, and what it costs.",
  },
  {
    date: "2026-04-16",
    theme: "AI & ML",
    title: "Cohere design versus OpenAI: attention to design is all you need",
    tweetUrl: "https://x.com/jaredwerba/status/2044581370593263943",
    receipt: true,
    why: "Developer experience as the product.",
  },
  {
    date: "2026-04-29",
    theme: "AI & ML",
    title: "Cohere Command R+ for private RAG",
    tweetUrl: "https://x.com/jaredwerba/status/2049555253440155840",
    receipt: true,
    why: "Private RAG, named and dated.",
  },
  {
    date: "2026-05-11",
    theme: "Memory",
    title: "Static random-access memory",
    tweetUrl: "https://x.com/jaredwerba/status/2053856132741935184",
    sourceUrl:
      "https://en.wikipedia.org/wiki/Static_random-access_memory",
    receipt: true,
    why: "Memory hierarchy, still.",
  },
  {
    date: "2026-06-28",
    theme: "AI & ML",
    title: "BM25, the best-matching ranking algorithm",
    tweetUrl: "https://x.com/jaredwerba/status/2071331116045193372",
    sourceUrl:
      "https://www.geeksforgeeks.org/nlp/what-is-bm25-best-matching-25-algorithm/",
    receipt: true,
    why: "Lexical ranking — the baseline embeddings have to beat.",
  },
  {
    date: "2026-07-10",
    theme: "GPU & Silicon",
    title: "Unified Memory, Explained: Why Mini PCs Can Run 70B Models a Big GPU Can't",
    tweetUrl: "https://x.com/jaredwerba/status/2075605997830226299",
    sourceUrl:
      "https://vettedconsumer.com/unified-memory-explained-why-mini-pcs-can-run-70b-models-a-big-gpu-cant-and-where-they-slow-down/",
    receipt: true,
    why: "Memory bandwidth as the product.",
  },
];

export const TWEET_LEDGER_RECEIPTS = TWEET_LEDGER.filter((e) => e.receipt);
export const TWEET_LEDGER_FULL = TWEET_LEDGER.filter(
  (e, i, all) => all.findIndex((x) => x.tweetUrl === e.tweetUrl) === i,
).sort((a, b) => a.date.localeCompare(b.date));
