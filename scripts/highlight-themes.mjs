/**
 * The thematic taxonomy for the Kindle highlights.
 *
 * Two signals decide where a highlight lands:
 *
 *   1. Its book's theme, hand-assigned below. A strong default — a highlight
 *      from The Untethered Soul is about inner work even when it names nothing.
 *   2. Words in the highlight itself, which can outvote the book. A passage on
 *      death inside a business book belongs under mortality, not building.
 *
 * Keep it that way round. Classifying by book alone reproduces the shelf we are
 * trying to get away from; classifying by keyword alone strands every abstract
 * highlight that happens to name nothing concrete.
 */

/** A book's theme counts this much toward its highlights. */
export const BOOK_PRIOR = 2;
/** A second theme for books that straddle two subjects. */
export const BOOK_PRIOR_SECONDARY = 1;
/** Terms that pin a theme down; worth more than one book's prior alone. */
export const STRONG = 1.6;
/** Terms that merely lean a direction. */
export const WEAK = 0.8;

/** Highlights this short are words looked up mid-read, not ideas. */
export const VOCAB_MAX_WORDS = 3;
export const VOCAB_MAX_CHARS = 32;

export const VOCAB_THEME = "vocabulary";

export const THEMES = [
  {
    id: "mind",
    label: "Mind & Emotion",
    blurb: "Beliefs, mood, identity, and the story you tell yourself about yourself.",
    strong: [
      "mindset", "self-image", "subconscious", "reframe", "reframing", "equanimity",
      "psycho-cybernetics", "psychitecture", "self-talk", "cognitive", "self-esteem",
      "limiting belief\\w*", "inner critic", "neurotic", "neurosis",
    ],
    weak: [
      "emotion\\w*", "mood", "moods", "anxiety", "anxious", "confidence", "belief",
      "beliefs", "identity", "resilien\\w*", "temperament", "fear", "fears", "worry",
      "self", "attitude", "therapy", "happiness", "happy",
    ],
  },
  {
    id: "discipline",
    label: "Discipline & Habits",
    blurb: "Willpower, routine, and closing the gap between intent and action.",
    strong: [
      "habits?", "discipline", "self-discipline", "willpower", "self-control",
      "procrastinat\\w*", "comfort zone", "delayed gratification", "temptation\\w*",
      "consistency", "routine", "the urge", "urges", "morning ritual", "streak",
    ],
    weak: [
      "motivation", "motivated", "impulse", "impulsive", "effort", "consistent",
      "focus", "distraction\\w*", "lazy", "laziness", "quit", "persist\\w*",
      "commitment", "accountab\\w*", "wake up", "daily",
    ],
  },
  {
    id: "stillness",
    label: "Stillness & Ego",
    blurb: "Presence, attachment, the self that watches — the Eastern thread.",
    strong: [
      "meditat\\w*", "mindfulness", "the ego", "attachment", "non-attachment", "impermanen\\w*",
      "buddh\\w*", "zen", "tao", "dharma", "karma", "enlighten\\w*", "nirvana", "samskaras?",
      "the present moment", "inner peace", "letting go", "surrender", "brahman", "sutra",
      "spiritual\\w*", "the soul", "stillness", "krishnamurti",
    ],
    weak: [
      "awareness", "aware", "desire", "desires", "craving", "suffering", "silence",
      "acceptance", "detach\\w*", "witness", "presence", "peace", "serenity", "monk",
    ],
  },
  {
    id: "reality",
    label: "Consciousness & Reality",
    blurb: "Physics, simulation, free will, and what is actually going on here.",
    strong: [
      "quantum", "photons?", "electrons?", "relativity", "spacetime", "space-time",
      "simulation", "virtual reality", "free will", "consciousness", "qualia",
      "metaphysic\\w*", "solipsis\\w*", "the observer", "entropy", "multiverse",
      "wave function", "the universe", "physics",
    ],
    weak: [
      "reality", "perception", "perceive", "illusion", "dream", "dreams", "existence",
      "philosoph\\w*", "atoms?", "cosmos", "infinity", "dimension\\w*", "brain",
    ],
  },
  {
    id: "mortality",
    label: "Mortality & Meaning",
    blurb: "Death, purpose, regret, and what the finite clock is worth.",
    strong: [
      "death", "dying", "died", "mortal\\w*", "funeral", "eulogy", "grief", "afterlife",
      "rebirth", "reincarnat\\w*", "legacy", "deathbed", "meaning of life", "logotherapy",
      "existential vacuum", "terminally", "bardo",
    ],
    weak: [
      "die", "dies", "meaning", "purpose", "regret", "regrets", "suffering", "tragedy",
      "old age", "elderly", "grave", "eternity", "immortal\\w*",
    ],
  },
  {
    id: "judgment",
    label: "Judgment & Risk",
    blurb: "Bias, probability, asymmetry, and thinking about thinking.",
    strong: [
      "bias", "biases", "heuristics?", "probabilit\\w*", "black swan", "lindy",
      "skin in the game", "asymmetr\\w*", "fallac\\w*", "survivorship", "base rate",
      "circle of competence", "optionality", "convex\\w*", "mental models?",
      "falsif\\w*", "randomness", "expected value", "second-order",
    ],
    weak: [
      "risk", "risks", "uncertain\\w*", "forecast\\w*", "statistic\\w*", "rational\\w*",
      "evidence", "incentive\\w*", "decision", "decisions", "luck", "odds", "prediction",
      "correlation", "causation", "logic", "reasoning", "judgment",
    ],
  },
  {
    id: "wealth",
    label: "Wealth & Leverage",
    blurb: "Money, compounding, ownership, and the arithmetic of enough.",
    strong: [
      "wealth", "wealthy", "compound\\w*", "net worth", "specific knowledge", "leverage",
      "passive income", "equity", "investing", "investment\\w*", "portfolio", "dividend\\w*",
      "savings", "the richest", "capital", "assets?",
    ],
    weak: [
      "money", "rich", "income", "invest", "debt", "dollars?", "gold", "salary", "earn",
      "earning", "price", "afford", "financial\\w*", "budget", "spend", "spending",
    ],
  },
  {
    id: "building",
    label: "Building & Business",
    blurb: "Founders, products, companies, and how things actually get shipped.",
    strong: [
      "startups?", "founders?", "entrepreneur\\w*", "the company", "our customers",
      "monopol\\w*", "shareholders?", "the product", "engineers?", "software", "database",
      "oracle", "amazon", "silicon valley", "venture capital", "ship it", "the business",
    ],
    weak: [
      "company", "companies", "customers?", "product", "products", "employees?", "hire",
      "hiring", "team", "ceo", "management", "manager", "organization", "innovat\\w*",
      "strateg\\w*", "competitor\\w*", "revenue", "scale", "launch", "code",
    ],
  },
  {
    id: "selling",
    label: "Selling",
    blurb: "MEDDIC, champions, discovery — the craft of moving a deal.",
    strong: [
      "meddic", "meddpicc", "economic buyer", "the champion", "champions", "sales rep",
      "salespeople", "sales cycle", "the deal", "deals", "qualif\\w*", "discovery call",
      "the prospect", "prospects?", "quota", "pipeline", "decision criteria",
      "sales process", "the buyer", "buyers?", "demo", "demos",
    ],
    weak: [
      "sales", "selling", "sell", "close", "closing", "objection\\w*", "negotiat\\w*",
      "account", "accounts", "vendor", "procurement", "reps",
    ],
  },
  {
    id: "ai",
    label: "AI & Acceleration",
    blurb: "Superintelligence, merging with machines, and the exponential curve.",
    strong: [
      "artificial intelligence", "superintelligen\\w*", "\\bagi\\b", "machine learning",
      "neural net\\w*", "deep learning", "the singularity", "transhuman\\w*", "nanotech\\w*",
      "brain-computer", "mind upload\\w*", "moore's law", "transformers?", "\\bllms?\\b",
      "chatgpt", "cyborg", "exponential\\w*", "\\bai\\b", "robots?", "nanobots?",
    ],
    weak: [
      "algorithm\\w*", "automat\\w*", "computers?", "machines?", "digital", "compute",
      "intelligence", "technolog\\w*", "silicon",
    ],
  },
  {
    id: "power",
    label: "Power & Systems",
    blurb: "Institutions, media, control, and who is actually steering.",
    strong: [
      "globalist\\w*", "propaganda", "censor\\w*", "surveillance", "the elites?", "empire",
      "decentraliz\\w*", "bitcoin", "crypto\\w*", "the state", "bureaucra\\w*", "regulat\\w*",
      "totalitarian", "the system", "mainstream media", "the government", "sovereign\\w*",
      "institutions?", "the establishment", "central bank\\w*", "federal reserve",
    ],
    weak: [
      "government", "politic\\w*", "democracy", "corporations?", "war", "citizens?",
      "nation", "society", "collapse", "revolution", "ideolog\\w*", "religion",
      "the media", "elite",
    ],
  },
  {
    id: "health",
    label: "Health & Energy",
    blurb: "Metabolism, food, training, sleep — the body as the substrate.",
    strong: [
      "metabol\\w*", "mitochondri\\w*", "insulin", "glucose", "blood sugar", "inflammat\\w*",
      "cortisol", "dopamine", "ultra-processed", "nutrition", "calories?", "fasting",
      "kettlebell\\w*", "the gut", "microbiome", "cardiovascular", "obes\\w*", "hormones?",
      "protein", "carbohydrate\\w*", "workout\\w*", "reps?", "stretching", "muscles?",
    ],
    weak: [
      "sleep", "exercise", "training", "diet", "food", "eat", "eating", "body", "physical",
      "disease", "doctors?", "medic\\w*", "energy", "fatigue", "pain", "strength", "fitness",
    ],
  },
  {
    id: "craft",
    label: "Craft & Mastery",
    blurb: "Art, practice, learning, and the long apprenticeship to skill.",
    strong: [
      "the artist", "artists?", "creativ\\w*", "mastery", "master\\w*", "the craft",
      "practice", "apprentice\\w*", "rehears\\w*", "the work", "resistance", "the muse",
      "inspiration", "memoriz\\w*", "learning", "self-education", "kaizen", "ikigai",
      "technique", "deliberate practice",
    ],
    // Deliberately narrow. "art", "books", "work" and "training" are common
    // enough to pull half the library in here if they are allowed to vote.
    weak: [
      "skill", "skills", "write", "writing", "writer", "learn", "learned", "student",
      "teacher", "school", "education", "talent", "genius", "reading", "compose",
    ],
  },
  {
    id: "time",
    label: "Time & Freedom",
    blurb: "Travel, simplicity, and spending the one thing you cannot earn back.",
    strong: [
      "vagabond\\w*", "long-term travel", "wander\\w*", "nomad\\w*", "simplicity",
      "time wealth", "busyness", "the road", "walden", "sabbatical", "backpack\\w*",
      "die with zero", "memory dividend", "leisure",
    ],
    weak: [
      "travel", "traveling", "journey", "adventure", "freedom", "free time", "schedule",
      "calendar", "priorities", "busy", "vacation", "experiences", "minimal\\w*",
    ],
  },
];

export const VOCAB = {
  id: VOCAB_THEME,
  label: "Vocabulary",
  blurb: "Words looked up mid-read — mostly from the novels.",
};

/**
 * Book title fragment (lowercase, matched as a substring) -> [primary, secondary].
 * Assigned by hand: 120 books is small enough to get right, and the prior is
 * what rescues abstract highlights that name nothing classifiable.
 */
export const BOOK_THEMES = {
  "skin in the game": ["judgment"],
  // Naval is read here more as a philosophy of mind than as a money book; the
  // explicitly financial highlights still get pulled back by their own words.
  "almanack of naval": ["mind", "wealth"],
  "irreducible": ["reality"],
  "designing the mind": ["mind"],
  "good energy": ["health"],
  "untethered soul": ["stillness"],
  "secret history of the world": ["power", "reality"],
  "softwar": ["building"],
  "singularity is nearer": ["ai"],
  "5am club": ["discipline", "craft"],
  "power of now": ["stillness"],
  "5 types of wealth": ["time", "mind"],
  "limitless": ["craft", "mind"],
  // Striking Thoughts is life philosophy far more than it is martial technique.
  "bruce lee": ["mind", "craft"],
  "creative act": ["craft"],
  "psycho-cybernetics": ["mind"],
  "30 rules to live by": ["discipline", "stillness"],
  "tibetan book of living and dying": ["mortality", "stillness"],
  "power of discipline": ["discipline"],
  "always be qualifying": ["selling"],
  "reframe your brain": ["mind"],
  "anthology of balaji": ["power", "ai"],
  "dodge in hell": ["reality", "ai"],
  "beyond order": ["mind", "mortality"],
  "qualified sales leader": ["selling"],
  "billionaire and the mechanic": ["building"],
  "miguel ruiz": ["stillness"],
  "21 lessons": ["power", "ai"],
  "value economics": ["wealth", "mind"],
  "man's search for meaning": ["mortality"],
  "art of thinking clearly": ["judgment"],
  "superintelligence": ["ai"],
  "great reset": ["power"],
  "religion war": ["power", "reality"],
  "direct truth": ["stillness"],
  "great awakening": ["power"],
  "how to slay a wizard": ["power"],
  "bed of procrustes": ["judgment"],
  "beginning of infinity": ["reality", "judgment"],
  "ikigai": ["craft", "mortality"],
  "unabomber manifesto": ["power"],
  "god's debris": ["reality"],
  "vagabonding": ["time"],
  "poor charlie": ["judgment", "wealth"],
  "name of the wind": ["craft"],
  "invent and wander": ["building"],
  "nexus (the nexus trilogy": ["ai"],
  "buddhism for beginners": ["stillness"],
  "die with zero": ["time", "mortality"],
  "kill decision": ["power", "ai"],
  "power of positive thinking": ["mind"],
  "cosmic joke": ["stillness"],
  "wise man's fear": ["craft"],
  "linux for beginners": ["building"],
  "richest man in babylon": ["wealth"],
  "models: attract women": ["mind"],
  "rational optimist": ["power", "judgment"],
  "arrival (stories": ["reality"],
  "zero to one": ["building"],
  "reality+": ["reality"],
  "seven brief lessons": ["reality"],
  "war of art": ["craft"],
  "what if?": ["reality"],
  "book of elon": ["building", "ai"],
  "daemon": ["power", "ai"],
  "book of life: daily meditations": ["stillness"],
  "bhagavad gita": ["stillness"],
  "recursion": ["reality"],
  "sovereign individual": ["power"],
  "tracers in the dark": ["power"],
  "tripwire": ["craft"],
  "american psycho": ["craft"],
  "homo deus": ["ai"],
  "red rising": ["craft"],
  "snow crash": ["ai"],
  "the alchemist": ["stillness"],
  "dark matter": ["reality"],
  "project hail mary": ["craft"],
  "motorcycle maintenance": ["craft", "reality"],
  "tao te ching": ["stillness"],
  "walden": ["time"],
  "agency (the jackpot": ["ai"],
  "hunting whitey": ["power"],
  "pines: wayward pines": ["craft"],
  // Keyed off the subtitle: the "ō" does not survive every export intact.
  "part one (the asian saga": ["craft"],
  "siddhartha": ["stillness"],
  "book of five rings": ["craft"],
  "girl who lived twice": ["craft"],
  "endurance: shackleton": ["craft"],
  "the code. the evaluation": ["discipline"],
  "law of attraction": ["mind"],
  "wayward: wayward pines": ["craft"],
  "chess strategies": ["craft"],
  "hacking: the art of exploitation": ["building"],
  "just f*ing demo": ["selling"],
  "kettlebell simple": ["health"],
  "neuromancer": ["ai"],
  "taboo against knowing": ["stillness"],
  "trigger point therapy": ["health"],
  "blood meridian": ["craft"],
  "dune": ["craft"],
  "self-learn anything": ["craft"],
  "mental math": ["craft"],
  "girl in the eagle": ["craft"],
  "kaiju preservation": ["craft"],
  "word is murder": ["craft"],
  "time under tension": ["health"],
  "bodyweight training": ["health"],
  "cortisol": ["health"],
  "fasting: fast track": ["health"],
  "kettlebell workout": ["health"],
  "never lie": ["craft"],
  "of wolves and men": ["craft"],
  "randomize": ["craft"],
  "somatic exercises": ["health"],
  "book of self mastery": ["discipline", "mind"],
  "chatgpt prompt library": ["ai"],
  "last town": ["craft"],
  "mind mapping": ["craft"],
  "you can just do things": ["building"],
};
