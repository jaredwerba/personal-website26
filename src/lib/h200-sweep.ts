/**
 * The H200 concurrency sweep, measured 2026-08-17.
 *
 * One source for both pages, so the amber console and the plain document can
 * never disagree about a number. Raw JSON lives with the write-up at
 * ~/nebiusAI/bench/sweep-seqs4.json and sweep-seqs64.json.
 *
 * Two runs on one H200, identical except --max-num-seqs. 576 requests total,
 * zero failures. Fixed 256-token output, temperature 0, 74-token prompt.
 * Measured on the VM against localhost, never through the SSH tunnel.
 */

export type SweepRow = {
  concurrency: number;
  /** Total output tokens per second across all callers. Null = not run. */
  aggA: number | null;
  aggB: number;
  /** Time to first token, p50, seconds. */
  ttftA: number | null;
  ttftB: number;
  /** What a single caller sees, run B. */
  streamB: number;
};

export const SWEEP: SweepRow[] = [
  { concurrency: 1, aggA: 102.2, aggB: 101.2, ttftA: 2.49, ttftB: 2.468, streamB: 101.5 },
  { concurrency: 2, aggA: 195.9, aggB: 192.5, ttftA: 2.59, ttftB: 2.572, streamB: 96.6 },
  { concurrency: 4, aggA: 368.0, aggB: 408.2, ttftA: 2.781, ttftB: 2.463, streamB: 103.5 },
  { concurrency: 8, aggA: 380.5, aggB: 730.9, ttftA: 5.356, ttftB: 2.769, streamB: 92.1 },
  { concurrency: 16, aggA: 374.7, aggB: 1384.8, ttftA: 10.766, ttftB: 2.922, streamB: 86.8 },
  { concurrency: 32, aggA: 381.1, aggB: 2128.2, ttftA: 21.129, ttftB: 3.83, streamB: 66.8 },
  { concurrency: 64, aggA: null, aggB: 2848.2, ttftA: null, ttftB: 5.754, streamB: 44.9 },
];

export const SWEEP_META = {
  model: "AEON-7/Qwen3.8-27B-AEON-ULTIMATE-UNCENSORED-BF16",
  server: "vLLM 0.27.1",
  gpu: "1x H200, 143,771 MiB",
  runA: "--max-num-seqs 4",
  runB: "--max-num-seqs 64",
  requests: 576,
  failures: 0,
  maxTokens: 256,
  temperature: 0,
  promptTokens: 74,
  /** vLLM's own report: the KV cache, not the sequence cap, is the next wall. */
  kvCeiling: "36.94x at 16,384 tokens per request",
} as const;

export const AGG_MAX = Math.max(...SWEEP.map((r) => r.aggB));
export const TTFT_MAX = Math.max(...SWEEP.map((r) => Math.max(r.ttftA ?? 0, r.ttftB)));

/** What changed between the two runs. One line each, for the tuning table. */
export const TUNED: { flag: string; from: string; to: string; effect: string }[] = [
  {
    flag: "--max-num-seqs",
    from: "4",
    to: "64",
    effect:
      "The only change between the two runs. It sets how many sequences the server keeps in flight. At 4 the card idles once a fifth caller arrives.",
  },
  {
    flag: "--gpu-memory-utilization",
    from: "0.85",
    to: "0.85",
    effect:
      "Unchanged. It holds the KV cache, and the KV cache is the next limit: vLLM reports a maximum concurrency of 36.94x at a 16,384-token context.",
  },
  {
    flag: "--max-model-len",
    from: "16384",
    to: "16384",
    effect:
      "Unchanged. Context length and memory utilisation are the two levers past this point, not the sequence count.",
  },
  {
    flag: "--speculative-config",
    from: "mtp, 3 draft tokens",
    to: "mtp, 3 draft tokens",
    effect:
      "Unchanged. Speculative decoding helps one stream. It is not what was capping the card.",
  },
];
