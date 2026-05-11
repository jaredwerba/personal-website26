"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import Image from "next/image";

// Visor yellow-green matching the real HUD instruments
const HUD_CLR = "rgba(200,216,32,0.9)";
const HUD_DIM = "rgba(200,216,32,0.45)";
const GLOW = "0 0 2px rgba(200,216,32,0.35), 0 0 6px rgba(200,216,32,0.12)";

function hex(n: number) {
  return Array.from({ length: n }, () =>
    Math.floor(Math.random() * 16).toString(16).toUpperCase(),
  ).join("");
}

function buildSequence(): string[] {
  return [
    "> INIT.MAGI.SYSTEM",
    "> BOOT.SEQ ── START",
    "  LOAD.MODULES...",
    "  [██░░░░░░░░░░░░░░]  12%",
    "  [████████░░░░░░░░]  52%",
    "  [████████████████] 100%",
    `> CHK.${hex(4)} ── PASS`,
    `> CHK.${hex(4)} ── PASS`,
    `> CHK.${hex(4)} ── PASS`,
    "> SCAN.NETWORK",
    `  ▸ RCV 0x${hex(2)} 0x${hex(2)} 0x${hex(2)}`,
    `  ▸ ACK 0x${hex(2)} 0x${hex(2)}`,
    "> TGT.ACQ 42.33°N 71.04°W",
    `> FRQ.${(118 + Math.random() * 30).toFixed(3)} ── LOCK`,
    "> RWR ── NO.THREAT",
    `> MEM.${hex(4)}:${hex(8)}`,
    "> SIGNAL ── NOMINAL",
    "> CONTACT.READY",
  ];
}

const TOTAL = 18;

export default function GlitchHero() {
  const [seq, setSeq] = useState<string[]>([]);
  const [visible, setVisible] = useState(0);

  // SSR-safe: build sequence on mount
  useEffect(() => {
    setSeq(buildSequence());
  }, []);

  // Print lines one by one, spaced over ~1m45s, then hold
  useEffect(() => {
    if (seq.length === 0) return;
    if (visible >= seq.length) return; // done — stay put

    const line = seq[visible];
    let base: number;
    let jitter: number;

    if (visible === 0) {
      // First line appears quickly after mount
      base = 800;
      jitter = Math.random() * 400;
    } else if (line?.startsWith("  [")) {
      // Progress bar lines — quick succession
      base = 2000;
      jitter = Math.random() * 2000;
    } else if (line?.startsWith("  ")) {
      // Sub-output lines (network data, load status)
      base = 4000;
      jitter = Math.random() * 2000;
    } else {
      // Command lines — dramatic pauses
      base = 6300;
      jitter = Math.random() * 2000;
    }

    const t = setTimeout(() => setVisible((v) => v + 1), base + jitter);
    return () => clearTimeout(t);
  }, [visible, seq]);

  return (
    <motion.div
      className="relative w-full aspect-[4/3] overflow-hidden"
      initial={{ y: 80, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1] }}
    >
      {/* Glitching image */}
      <div className="relative w-full h-full animate-hero-glitch">
        <Image
          src="/photos/figher.JPG"
          alt=""
          fill
          className="object-cover object-center"
          priority
        />
      </div>

      {/* ── Visor HUD — terminal output with convex curve ── */}
      <div
        className="absolute pointer-events-none flex flex-col justify-start"
        style={{ top: "23%", bottom: "40%", left: "12%", right: "22%" }}
      >
        {seq.slice(0, visible).map((line, i) => {
          // Parabolic left-margin → convex curve on the visor
          const t = (i - (TOTAL - 1) / 2) / ((TOTAL - 1) / 2);
          const indent = 10 * t * t; // % indent at edges
          const opacity = 0.25 + 0.65 * (1 - t * t);
          const isCmd = line.startsWith(">");

          return (
            <motion.p
              key={`${i}`}
              initial={{ opacity: 0, x: -6 }}
              animate={{ opacity, x: 0 }}
              transition={{ duration: 0.12 }}
              className="font-nerv-mono text-[5px] md:text-[6px] tracking-wider text-left truncate"
              style={{
                color: isCmd ? HUD_CLR : HUD_DIM,
                textShadow: GLOW,
                marginLeft: `${indent}%`,
                whiteSpace: "pre",
                lineHeight: "1.9",
              }}
            >
              {line}
            </motion.p>
          );
        })}
      </div>

      {/* Fade to black at bottom */}
      <div className="absolute inset-0 bg-gradient-to-t from-nerv-black via-nerv-black/20 to-transparent pointer-events-none" />
    </motion.div>
  );
}
