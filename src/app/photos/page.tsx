"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import {
  Badge,
  Button,
} from "@mdrbx/nerv-ui";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";

const LOCATIONS = [
  "ANDORRA",
  "BOSTON",
  "CALIFORNIA",
  "CAMBODIA",
  "CHINA",
  "COLOMBIA",
  "COLORADO",
  "COSTA RICA",
  "DOMINICAN REPUBLIC",
  "DUBAI",
  "EL SALVADOR",
  "GUATEMALA",
  "HONDURAS",
  "ICELAND",
  "ITALY",
  "JAPAN",
  "MAINE",
  "MEXICO",
  "MOROCCO",
  "NICARAGUA",
  "PERU",
  "PUERTO RICO",
  "SPAIN",
  "THAILAND",
  "VERMONT",
];

const COUNT_DURATION = 2200; // ms for count-up animation

export default function PhotosPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [count, setCount] = useState(0);
  const [targetCount, setTargetCount] = useState(0);
  const [preloadDone, setPreloadDone] = useState(false);
  const [animDone, setAnimDone] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState(0);
  const countRef = useRef(0);

  useEffect(() => {
    fetch("/api/photos")
      .then((r) => r.json())
      .then((data) => {
        const arr = [...(data.photos || [])];
        for (let i = arr.length - 1; i > 0; i--) {
          const j = Math.floor(Math.random() * (i + 1));
          [arr[i], arr[j]] = [arr[j], arr[i]];
        }
        setPhotos(arr);
        setTargetCount(arr.length);

        // Preload all images in background
        let loaded = 0;
        const total = arr.length;
        if (total === 0) { setPreloadDone(true); return; }
        arr.forEach((src) => {
          const img = new window.Image();
          img.onload = img.onerror = () => {
            loaded++;
            if (loaded >= total) setPreloadDone(true);
          };
          img.src = src;
        });
      })
      .catch(() => { setPreloadDone(true); setAnimDone(true); });
  }, []);

  // Count-up animation
  useEffect(() => {
    if (targetCount === 0) return;
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      const progress = Math.min(elapsed / COUNT_DURATION, 1);
      // ease-out curve
      const eased = 1 - Math.pow(1 - progress, 3);
      const current = Math.floor(eased * targetCount);
      countRef.current = current;
      setCount(current);
      if (progress < 1) {
        requestAnimationFrame(tick);
      } else {
        setCount(targetCount);
        setAnimDone(true);
      }
    };
    requestAnimationFrame(tick);
  }, [targetCount]);

  // Show grid once both preload and animation are done
  useEffect(() => {
    if (preloadDone && animDone) setLoading(false);
  }, [preloadDone, animDone]);

  const goNext = useCallback(() => {
    if (selectedIndex === null || photos.length === 0) return;
    setSwipeDirection(1);
    setSelectedIndex((selectedIndex + 1) % photos.length);
  }, [selectedIndex, photos.length]);

  const goPrev = useCallback(() => {
    if (selectedIndex === null || photos.length === 0) return;
    setSwipeDirection(-1);
    setSelectedIndex((selectedIndex - 1 + photos.length) % photos.length);
  }, [selectedIndex, photos.length]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 50;
      if (info.offset.x < -threshold) goNext();
      else if (info.offset.x > threshold) goPrev();
    },
    [goNext, goPrev]
  );

  useEffect(() => {
    if (selectedIndex === null) return;
    function handleKey(e: KeyboardEvent) {
      if (e.key === "ArrowRight") goNext();
      else if (e.key === "ArrowLeft") goPrev();
      else if (e.key === "Escape") setSelectedIndex(null);
    }
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedIndex, goNext, goPrev]);

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
          PHOTOS
        </h2>
        <Badge label={loading ? "—" : `${photos.length}`} variant="success" size="sm" />
      </div>

      {loading ? (
        <div
          className="border border-nerv-green/40 bg-nerv-black text-nerv-green overflow-hidden"
          style={{ fontFamily: "var(--font-nerv-mono)" }}
        >
          {/* Terminal title bar */}
          <div className="flex items-center justify-between px-3 py-1 border-b border-nerv-green/20 bg-nerv-green/5">
            <span className="text-[10px] uppercase tracking-[0.2em] font-bold" style={{ fontFamily: "var(--font-nerv-display)" }}>
              SCAN.STATUS
            </span>
            <span className="text-[10px] text-nerv-green/50">LOADING</span>
          </div>

          <div className="p-3 space-y-1 text-xs">
            {/* Animated count line */}
            <div className="flex items-baseline gap-2">
              <span className="text-nerv-green/50">&gt;</span>
              <span>
                LOADING PHOTOS{" "}
                <span className="text-nerv-orange font-bold tabular-nums">
                  {count}
                </span>
                {targetCount > 0 && count >= targetCount ? "+" : ""}
                {" "}/ {targetCount > 0 ? `${targetCount}+` : "..."}
              </span>
            </div>

            {/* Locations */}
            <div className="flex items-baseline gap-2">
              <span className="text-nerv-green/50">&gt;</span>
              <span className="text-nerv-green/70">LOCATIONS:</span>
            </div>
            <div className="pl-4 grid grid-cols-2 md:grid-cols-3 gap-x-4 gap-y-0.5">
              {LOCATIONS.map((loc, i) => (
                <motion.span
                  key={loc}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: i * 0.06, duration: 0.2 }}
                  className="text-[11px] text-nerv-green/60 tracking-wider"
                >
                  — {loc}
                </motion.span>
              ))}
            </div>
          </div>
        </div>
      ) : photos.length === 0 ? (
        <div
          className="border border-nerv-green/40 bg-nerv-black text-nerv-green p-4 text-xs"
          style={{ fontFamily: "var(--font-nerv-mono)" }}
        >
          <p>&gt; NO IMAGES FOUND IN /public/photos/</p>
        </div>
      ) : (
        <>
          <div className="flex flex-col gap-2 md:gap-3">
            {photos.map((photo, i) => (
              <motion.div
                key={photo}
                className="cursor-pointer border border-nerv-mid-gray/20 overflow-hidden"
                whileHover={{ borderColor: "rgba(255,153,0,0.5)" }}
                whileTap={{ scale: 0.98 }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: i * 0.015 }}
                onClick={() => {
                  setSwipeDirection(0);
                  setSelectedIndex(i);
                }}
              >
                <img
                  src={photo}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-auto block"
                />
              </motion.div>
            ))}
          </div>

          {/* Swipable lightbox */}
          <AnimatePresence mode="wait">
            {selectedIndex !== null && (
              <motion.div
                className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setSelectedIndex(null)}
              >
                {/* Counter */}
                <div className="absolute top-4 left-4 font-nerv-mono text-xs text-nerv-mid-gray z-10">
                  {selectedIndex + 1} / {photos.length}
                </div>

                {/* Close */}
                <div className="absolute top-3 right-3 z-10">
                  <Button variant="ghost" size="sm" onClick={() => setSelectedIndex(null)}>
                    CLOSE
                  </Button>
                </div>

                {/* Prev/Next buttons (desktop) */}
                <button
                  className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center text-nerv-mid-gray hover:text-nerv-orange transition-colors"
                  onClick={(e) => { e.stopPropagation(); goPrev(); }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="15 18 9 12 15 6" />
                  </svg>
                </button>
                <button
                  className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center text-nerv-mid-gray hover:text-nerv-orange transition-colors"
                  onClick={(e) => { e.stopPropagation(); goNext(); }}
                >
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <polyline points="9 18 15 12 9 6" />
                  </svg>
                </button>

                {/* Swipable image */}
                <AnimatePresence mode="wait" custom={swipeDirection}>
                  <motion.div
                    key={selectedIndex}
                    custom={swipeDirection}
                    initial={{ opacity: 0, x: swipeDirection * 200 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: swipeDirection * -200 }}
                    transition={{ duration: 0.2 }}
                    className="max-w-full max-h-full px-4 touch-pan-y"
                    drag="x"
                    dragConstraints={{ left: 0, right: 0 }}
                    dragElastic={0.3}
                    onDragEnd={handleDragEnd}
                    onClick={(e) => e.stopPropagation()}
                  >
                    <img
                      src={photos[selectedIndex]}
                      alt={`Photo ${selectedIndex + 1}`}
                      className="max-w-full max-h-[85dvh] object-contain mx-auto"
                      draggable={false}
                    />
                  </motion.div>
                </AnimatePresence>

                {/* Swipe hint (mobile) */}
                <div className="md:hidden absolute bottom-6 left-0 right-0 text-center">
                  <span className="font-nerv-mono text-[10px] text-nerv-mid-gray/50 tracking-wider">
                    SWIPE TO NAVIGATE
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
}
