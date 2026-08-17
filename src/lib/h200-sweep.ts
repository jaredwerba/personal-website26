/**
 * The H200 speed result, reduced to the one comparison worth showing.
 *
 * The full sweep — seven concurrency levels, two runs, 576 requests — is in
 * ~/nebiusAI/bench/ with the raw JSON and the harness. Both pages show only the
 * headline, because seven rows of bars is a report and two rows is a point.
 *
 * One source, imported by the amber console and the plain document, so the two
 * can never disagree about a number.
 */

export type SpeedRow = {
  label: string;
  /** Output tokens per second, all callers combined. */
  tokensPerSecond: number;
  /** Seconds before the first token comes back. */
  waitSeconds: number;
  note: string;
};

/** Measured at 32 people asking at once. */
export const SPEED: { before: SpeedRow; after: SpeedRow } = {
  before: {
    label: "Before",
    tokensPerSecond: 381,
    waitSeconds: 21.1,
    note: "The setting I started with. Four requests at a time.",
  },
  after: {
    label: "After",
    tokensPerSecond: 2128,
    waitSeconds: 3.8,
    note: "One setting changed. Sixty-four requests at a time.",
  },
};

export const SPEED_META = {
  concurrency: 32,
  requests: 576,
  failures: 0,
  gpu: "one H200",
  model: "the uncensored Qwen, 27B",
  flag: "--max-num-seqs",
} as const;
