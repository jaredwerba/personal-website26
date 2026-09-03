"use client";

import { useState, useEffect, useCallback, useRef, memo } from "react";
import Image from "next/image";
import { Badge, Button } from "@mdrbx/nerv-ui";
import { motion, AnimatePresence, type PanInfo } from "framer-motion";
import { shuffled } from "@/lib/shuffle";

const INITIAL_COUNT = 6;
const BATCH_COUNT = 6;
const PRIORITY_COUNT = 3;

const PhotoThumb = memo(function PhotoThumb({
  src,
  index,
  priority,
  onOpen,
}: {
  src: string;
  index: number;
  priority: boolean;
  onOpen: (index: number) => void;
}) {
  return (
    <button
      type="button"
      className="block w-full cursor-pointer border border-nerv-mid-gray/20 overflow-hidden text-left hover:border-nerv-orange/50 transition-colors"
      style={{
        contentVisibility: "auto",
        containIntrinsicSize: "auto 24rem",
      }}
      onClick={() => onOpen(index)}
    >
      <Image
        src={src}
        alt={`Photo ${index + 1}`}
        width={1600}
        height={1200}
        sizes="(max-width: 768px) 100vw, 720px"
        priority={priority}
        className="w-full h-auto block"
        style={{ width: "100%", height: "auto" }}
      />
    </button>
  );
});

export default function PhotoGallery({ photos }: { photos: string[] }) {
  const [order, setOrder] = useState(photos);
  const [visibleCount, setVisibleCount] = useState(() =>
    Math.min(INITIAL_COUNT, photos.length),
  );
  const [selectedIndex, setSelectedIndex] = useState<number | null>(null);
  const [swipeDirection, setSwipeDirection] = useState(0);
  const sentinelRef = useRef<HTMLDivElement>(null);

  const shufflePhotos = useCallback(() => {
    setOrder((current) => {
      let next = shuffled(current);
      if (next[0] === current[0] && current.length > 1) {
        next = shuffled(current);
      }
      return next;
    });
    setVisibleCount(Math.min(INITIAL_COUNT, photos.length));
    setSelectedIndex(null);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, [photos.length]);

  useEffect(() => {
    if (visibleCount >= order.length) return;
    const el = sentinelRef.current;
    if (!el) return;
    const io = new IntersectionObserver(
      (entries) => {
        if (!entries[0]?.isIntersecting) return;
        setVisibleCount((n) => Math.min(n + BATCH_COUNT, order.length));
      },
      { rootMargin: "800px 0px" },
    );
    io.observe(el);
    return () => io.disconnect();
  }, [visibleCount, order.length]);

  const goNext = useCallback(() => {
    setSwipeDirection(1);
    setSelectedIndex((i) => (i === null ? i : (i + 1) % order.length));
  }, [order.length]);

  const goPrev = useCallback(() => {
    setSwipeDirection(-1);
    setSelectedIndex((i) =>
      i === null ? i : (i - 1 + order.length) % order.length,
    );
  }, [order.length]);

  const handleDragEnd = useCallback(
    (_: MouseEvent | TouchEvent | PointerEvent, info: PanInfo) => {
      const threshold = 50;
      if (info.offset.x < -threshold) goNext();
      else if (info.offset.x > threshold) goPrev();
    },
    [goNext, goPrev],
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

  const openAt = useCallback((index: number) => {
    setSwipeDirection(0);
    setSelectedIndex(index);
  }, []);

  const visible = order.slice(0, visibleCount);
  const hasMore = visibleCount < order.length;
  const selectedSrc = selectedIndex !== null ? order[selectedIndex] : null;

  return (
    <>
      <div className="flex items-center gap-3">
        <h2 className="font-nerv-display text-2xl md:text-3xl tracking-[0.16em] text-nerv-orange">
          PHOTOS
        </h2>
        <Badge label={`${order.length}`} variant="success" size="sm" />
        <div className="ml-auto">
          <Button variant="terminal" size="sm" onClick={shufflePhotos}>
            SHUFFLE
          </Button>
        </div>
      </div>

      <div className="flex flex-col gap-2 md:gap-3">
        {visible.map((photo, i) => (
          <PhotoThumb
            key={photo}
            src={photo}
            index={i}
            priority={i < PRIORITY_COUNT}
            onOpen={openAt}
          />
        ))}
      </div>
      {hasMore ? <div ref={sentinelRef} className="h-8" aria-hidden /> : null}

      <AnimatePresence mode="wait">
        {selectedIndex !== null && selectedSrc ? (
          <motion.div
            className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setSelectedIndex(null)}
          >
            <div className="absolute top-4 left-4 font-nerv-mono text-xs text-nerv-mid-gray z-10">
              {selectedIndex + 1} / {order.length}
            </div>

            <div className="absolute top-3 right-3 z-10">
              <Button variant="ghost" size="sm" onClick={() => setSelectedIndex(null)}>
                CLOSE
              </Button>
            </div>

            <button
              type="button"
              className="hidden md:flex absolute left-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center text-nerv-mid-gray hover:text-nerv-orange transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                goPrev();
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </button>
            <button
              type="button"
              className="hidden md:flex absolute right-4 top-1/2 -translate-y-1/2 z-10 w-10 h-10 items-center justify-center text-nerv-mid-gray hover:text-nerv-orange transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                goNext();
              }}
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <polyline points="9 18 15 12 9 6" />
              </svg>
            </button>

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
                {/* Lightbox uses the original so swipe isn't waiting on optimizer. */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={selectedSrc}
                  alt={`Photo ${selectedIndex + 1}`}
                  className="max-w-full max-h-[85dvh] object-contain mx-auto"
                  draggable={false}
                />
              </motion.div>
            </AnimatePresence>

            <div className="md:hidden absolute bottom-6 left-0 right-0 text-center">
              <span className="font-nerv-mono text-[10px] text-nerv-mid-gray/50 tracking-wider">
                SWIPE TO NAVIGATE
              </span>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </>
  );
}
