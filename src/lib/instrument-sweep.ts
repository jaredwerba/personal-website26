"use client";

// ── Instrument startup sweep ────────────────────────────────────────────────
// Every needle and marker on /health runs off ONE clock, the way a car sweeps
// its whole cluster on ignition rather than each dial waking up on its own.
// A single rAF loop also means one React commit per frame instead of fourteen
// components each driving their own.

import { useCallback, useEffect, useLayoutEffect, useRef, useSyncExternalStore } from "react";

/** Rise, hold at the stop, then fall back and settle on the real reading. */
const DURATION_MS = 1500;
const RISE_END = 0.4;
const HOLD_END = 0.52;

/** Per-instrument offset, so the cluster reads as a sweep rather than a jump. */
export const STAGGER_MS = 70;

const easeOutCubic = (t: number) => 1 - Math.pow(1 - t, 3);
const easeInOutCubic = (t: number) =>
  t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;

/**
 * Where an instrument sits at this moment, as a fraction of its own axis.
 * `target` is the settled position, also 0-1. Returns `target` exactly once the
 * sweep is over, so the resting state is the true reading and never an
 * approximation left behind by the animation.
 */
export function sweepFraction(
  elapsedMs: number,
  delayMs: number,
  target: number,
): number {
  const p = (elapsedMs - delayMs) / DURATION_MS;
  if (!(p > 0)) return 0; // also catches NaN
  if (p >= 1) return target;
  if (p <= RISE_END) return easeOutCubic(p / RISE_END);
  if (p <= HOLD_END) return 1;
  const t = (p - HOLD_END) / (1 - HOLD_END);
  return 1 + (target - 1) * easeInOutCubic(t);
}

// ── The clock ───────────────────────────────────────────────────────────────
// Infinity means "settled": it is the server snapshot, the reduced-motion
// state, and the state after the sweep finishes. Starting there rather than at
// 0 means the SSR HTML carries the real readings, so the page is correct
// before JS runs and for anyone who never gets it.

const SETTLED = Number.POSITIVE_INFINITY;

let elapsed = SETTLED;
let raf = 0;
let startedAt = 0;
const listeners = new Set<() => void>();

/** Total run: the last instrument's delay plus its own sweep. */
const TOTAL_MS = DURATION_MS + STAGGER_MS * 12;

function tick(now: number) {
  if (startedAt === 0) startedAt = now;
  elapsed = now - startedAt;
  if (elapsed >= TOTAL_MS) {
    elapsed = SETTLED;
    raf = 0;
  }
  for (const l of listeners) l();
  if (raf !== 0) raf = requestAnimationFrame(tick);
}

function beginSweep() {
  if (raf !== 0 || elapsed !== SETTLED) return;
  if (
    typeof window === "undefined" ||
    window.matchMedia("(prefers-reduced-motion: reduce)").matches
  ) {
    return; // stays SETTLED — the readings are simply there, correctly.
  }
  elapsed = 0;
  startedAt = 0;
  for (const l of listeners) l();
  raf = requestAnimationFrame(tick);
}

function subscribe(fn: () => void) {
  listeners.add(fn);
  return () => {
    listeners.delete(fn);
    if (listeners.size === 0 && raf !== 0) {
      cancelAnimationFrame(raf);
      raf = 0;
      elapsed = SETTLED;
    }
  };
}

const getSnapshot = () => elapsed;
const getServerSnapshot = () => SETTLED;

/** Subscribe an instrument to the shared clock. */
export function useSweepElapsed(): number {
  return useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);
}

const useIsoLayoutEffect =
  typeof window === "undefined" ? useEffect : useLayoutEffect;

/**
 * Attach to whatever sits at the top of the instrument cluster. The sweep
 * starts when that first scrolls into view — running it while the section is
 * off screen would spend the whole effect on nobody.
 */
export function useSweepTrigger<T extends HTMLElement>() {
  const ref = useRef<T | null>(null);

  const start = useCallback(() => beginSweep(), []);

  useIsoLayoutEffect(() => {
    const el = ref.current;
    if (!el) return;
    // Fires immediately with the current state, so an already-visible cluster
    // starts now rather than waiting for a scroll that may never come.
    const io = new IntersectionObserver(
      (entries) => {
        if (entries.some((e) => e.isIntersecting)) {
          io.disconnect();
          start();
        }
      },
      { threshold: 0.2 },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [start]);

  return ref;
}
