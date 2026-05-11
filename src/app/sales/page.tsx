"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";

type Phase = "prompt" | "auth" | "glitch" | "denied";

const ERR_LINES = [
  "ERR_0x8F12 — CLEARANCE.LEVEL.INSUFFICIENT",
  "MODULE.STATUS: CLASSIFIED // OMEGA",
  "ACCESS.TOKEN: FLAGGED → SYSADMIN.NOTIFIED",
  "__INCIDENT__", // replaced at runtime
  "",
  "ACCESS_DENIED",
];

// ── Glitch fragments that flash during the breach animation ──
const GLITCH_FRAGS = ["BREACH", "0xDEAD", "DENIED", "ERR", "ABORT"];

export default function SalesPage() {
  const [phase, setPhase] = useState<Phase>("prompt");
  const [pw, setPw] = useState("");
  const [shake, setShake] = useState(false);
  const [invalid, setInvalid] = useState(false);
  const [lines, setLines] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const incidentId = useRef(
    `NRV-${Math.random().toString(16).slice(2, 8).toUpperCase()}`,
  );

  // auto-focus the input
  useEffect(() => {
    if (phase === "prompt") inputRef.current?.focus();
  }, [phase]);

  // ── Denial sequence: auth → glitch → denied ──
  const deny = useCallback(() => {
    setPhase("auth");

    // stall at 82%, then glitch
    setTimeout(() => setPhase("glitch"), 2200);

    // after glitch, type out error lines
    setTimeout(() => {
      setPhase("denied");
      const resolved = ERR_LINES.map((l) =>
        l === "__INCIDENT__" ? `INCIDENT: ${incidentId.current}` : l,
      );
      resolved.forEach((line, i) => {
        setTimeout(() => setLines((prev) => [...prev, line]), i * 400);
      });
    }, 3500);
  }, []);

  function submit(e: React.FormEvent) {
    e.preventDefault();
    if (phase !== "prompt") return;

    if (pw.toLowerCase() === "891e4") {
      deny();
    } else {
      // wrong password → shake + flash
      setShake(true);
      setInvalid(true);
      setTimeout(() => setShake(false), 600);
      setTimeout(() => setInvalid(false), 2500);
      setPw("");
      inputRef.current?.focus();
    }
  }

  return (
    <div className="min-h-[70dvh] flex items-center justify-center px-2">
      <AnimatePresence mode="wait">
        {/* ────────────── PROMPT ────────────── */}
        {phase === "prompt" && (
          <motion.div
            key="prompt"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.96 }}
            transition={{ duration: 0.3 }}
            className="w-full max-w-sm"
          >
            <div className="border border-nerv-orange/30">
              {/* title bar */}
              <div className="border-b border-nerv-orange/30 px-4 py-2 flex items-center justify-between">
                <span className="font-nerv-mono text-[10px] text-nerv-orange tracking-[0.2em]">
                  SALES.MODULE // RESTRICTED
                </span>
                <span className="text-nerv-red text-[10px] animate-nerv-blink">
                  ●
                </span>
              </div>

              {/* hero image */}
              <div className="relative w-full aspect-[4/3] overflow-hidden">
                <Image
                  src="/photos/figher.JPG"
                  alt=""
                  fill
                  className="object-cover object-center"
                  priority
                />
                {/* fade to black at bottom */}
                <div className="absolute inset-0 bg-gradient-to-t from-nerv-black via-nerv-black/20 to-transparent" />
              </div>

              {/* body */}
              <div className="p-6 space-y-5">
                <p className="font-nerv-mono text-[10px] text-nerv-mid-gray tracking-wider">
                  // THIS.MODULE.REQUIRES.CLEARANCE
                </p>

                <form onSubmit={submit} className="space-y-4">
                  <div className="space-y-2">
                    <label className="font-nerv-mono text-[11px] text-nerv-orange/70 tracking-[0.15em] block">
                      ENTER.ACCESS.CODE
                    </label>

                    <motion.div
                      animate={
                        shake
                          ? { x: [-10, 10, -8, 8, -4, 4, 0] }
                          : { x: 0 }
                      }
                      transition={{ duration: 0.5, ease: "easeOut" }}
                    >
                      <input
                        ref={inputRef}
                        type="password"
                        value={pw}
                        onChange={(e) => setPw(e.target.value)}
                        className="w-full bg-transparent border border-nerv-orange/30 px-3 py-2.5
                          font-nerv-mono text-sm text-nerv-orange tracking-[0.3em]
                          focus:outline-none focus:border-nerv-orange/60
                          placeholder:text-nerv-mid-gray/30 placeholder:tracking-[0.15em]"
                        placeholder="_ _ _ _ _"
                        autoComplete="off"
                        spellCheck={false}
                      />
                    </motion.div>
                  </div>

                  <AnimatePresence>
                    {invalid && (
                      <motion.p
                        initial={{ opacity: 0, y: -4 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        className="font-nerv-mono text-[10px] text-nerv-red tracking-[0.15em]"
                      >
                        ✕ INVALID.CREDENTIALS
                      </motion.p>
                    )}
                  </AnimatePresence>

                  <button
                    type="submit"
                    className="w-full border border-nerv-orange/30 py-2.5
                      font-nerv-mono text-[11px] text-nerv-orange tracking-[0.2em]
                      hover:bg-nerv-orange/10 hover:border-nerv-orange/50
                      transition-all duration-200 cursor-pointer active:scale-[0.98]"
                  >
                    AUTHENTICATE
                  </button>
                </form>
              </div>
            </div>
          </motion.div>
        )}

        {/* ────────────── AUTHENTICATING ────────────── */}
        {phase === "auth" && (
          <motion.div
            key="auth"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="text-center space-y-5"
          >
            <p className="font-nerv-mono text-sm text-nerv-orange tracking-[0.25em]">
              AUTHENTICATING
            </p>

            <div className="w-52 mx-auto space-y-2">
              {/* progress bar — stalls at 82% before the glitch kicks in */}
              <div className="h-[2px] bg-nerv-orange/20 overflow-hidden">
                <motion.div
                  className="h-full bg-nerv-orange"
                  initial={{ width: "0%" }}
                  animate={{ width: "82%" }}
                  transition={{ duration: 2, ease: [0.25, 0.1, 0.25, 1] }}
                />
              </div>
              <motion.p
                className="font-nerv-mono text-[10px] text-nerv-orange/50 tracking-wider"
                animate={{ opacity: [0.3, 0.8, 0.3] }}
                transition={{ duration: 1.2, repeat: Infinity }}
              >
                VERIFYING.ACCESS.TOKEN
              </motion.p>
            </div>
          </motion.div>
        )}

        {/* ────────────── GLITCH ────────────── */}
        {phase === "glitch" && (
          <motion.div
            key="glitch"
            className="fixed inset-0 z-[60] flex items-center justify-center overflow-hidden"
            initial={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
          >
            {/* red flash overlay */}
            <motion.div
              className="absolute inset-0 bg-nerv-red"
              animate={{ opacity: [0, 0.3, 0, 0.5, 0, 0.15, 0] }}
              transition={{ duration: 1.3 }}
            />

            {/* scattered text fragments */}
            {GLITCH_FRAGS.map((frag, i) => (
              <motion.span
                key={frag}
                className="absolute font-nerv-mono text-xs text-nerv-red/40 select-none pointer-events-none"
                style={{
                  top: `${15 + i * 16}%`,
                  left: `${8 + i * 18}%`,
                }}
                animate={{
                  opacity: [0, 0.9, 0, 0.6, 0],
                  x: [0, 40, -30, 15, 0],
                }}
                transition={{ duration: 1.3, delay: i * 0.06 }}
              >
                {frag}
              </motion.span>
            ))}

            {/* fast scan line */}
            <motion.div
              className="absolute left-0 right-0 h-[2px] bg-nerv-red/25 pointer-events-none"
              animate={{ top: ["-2%", "102%"] }}
              transition={{ duration: 0.25, repeat: 5, ease: "linear" }}
            />

            {/* horizontal glitch bars */}
            {[30, 55, 75].map((top, i) => (
              <motion.div
                key={top}
                className="absolute left-0 right-0 h-[3px] bg-nerv-red/10 pointer-events-none"
                style={{ top: `${top}%` }}
                animate={{
                  scaleX: [1, 2, 0.5, 1.5, 1],
                  x: [0, 80, -60, 30, 0],
                  opacity: [0, 1, 0, 0.7, 0],
                }}
                transition={{ duration: 1.3, delay: i * 0.12 }}
              />
            ))}

            {/* jittering ERROR text */}
            <motion.span
              className="font-nerv-display text-6xl md:text-8xl text-nerv-red tracking-[0.3em] select-none relative z-10"
              animate={{
                x: [0, -30, 22, -15, 10, -5, 0],
                y: [0, 14, -12, 8, -4, 0],
                skewX: [0, -10, 6, -4, 0],
                opacity: [1, 0.15, 1, 0, 1, 0.3, 1],
              }}
              transition={{ duration: 1.3 }}
            >
              ERROR
            </motion.span>
          </motion.div>
        )}

        {/* ────────────── DENIED ────────────── */}
        {phase === "denied" && (
          <motion.div
            key="denied"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
            className="w-full max-w-md"
          >
            <motion.div
              className="border border-nerv-red/30"
              animate={{
                borderColor: [
                  "rgba(255,0,0,0.3)",
                  "rgba(255,0,0,0.55)",
                  "rgba(255,0,0,0.3)",
                ],
              }}
              transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
            >
              {/* title bar */}
              <div className="border-b border-nerv-red/30 px-4 py-2 flex items-center justify-between">
                <span className="font-nerv-mono text-[10px] text-nerv-red tracking-[0.2em]">
                  SYSTEM.ALERT
                </span>
                <span className="font-nerv-mono text-[10px] text-nerv-red animate-nerv-blink">
                  ● REC
                </span>
              </div>

              {/* error lines */}
              <div className="p-6 space-y-1.5 min-h-[200px]">
                {lines.map((line, i) => (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.2, ease: "easeOut" }}
                  >
                    {line === "ACCESS_DENIED" ? (
                      <p className="font-nerv-display text-2xl md:text-3xl text-nerv-red tracking-[0.25em] pt-3 animate-nerv-glow">
                        ACCESS_DENIED
                      </p>
                    ) : line === "" ? (
                      <div className="h-3" />
                    ) : (
                      <p className="font-nerv-mono text-[11px] text-nerv-red/60 tracking-wider leading-relaxed">
                        <span className="text-nerv-red/30">&gt; </span>
                        {line}
                      </p>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
