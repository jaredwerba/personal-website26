"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Badge,
  Divider,
  TerminalDisplay,
  Button,
} from "@mdrbx/nerv-ui";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";

export default function PhotosPage() {
  const [photos, setPhotos] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [swipeDirection, setSwipeDirection] = useState(0);

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
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

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
        <TerminalDisplay
          lines={["> SCANNING IMAGE DIRECTORY...", "> LOADING VISUAL ASSETS..."]}
          typewriter
          color="green"
          title="SCAN.STATUS"
          maxHeight="100px"
        />
      ) : photos.length === 0 ? (
        <TerminalDisplay
          lines={[
            "> NO IMAGES FOUND IN /public/photos/",
            "> DROP IMAGE FILES INTO THE PROJECT FOLDER:",
            ">   personal-website26/public/photos/",
            "> SUPPORTED: .jpg .jpeg .png .gif .webp",
            "> RELOAD PAGE AFTER ADDING FILES.",
          ]}
          color="green"
          title="EMPTY.STATE"
          typewriter
          typeSpeed={20}
          maxHeight="160px"
        />
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
                transition={{ delay: i * 0.03 }}
                onClick={() => {
                  setSwipeDirection(0);
                  setSelectedIndex(i);
                }}
              >
                <img
                  src={photo}
                  alt={`Photo ${i + 1}`}
                  className="w-full h-auto block"
                  loading="lazy"
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
