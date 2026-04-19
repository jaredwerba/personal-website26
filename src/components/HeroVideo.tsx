"use client";

import { useRef, useState } from "react";

type Props = {
  src: string;
  poster?: string;
};

export default function HeroVideo({ src, poster }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  function toggleMute() {
    const v = ref.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    if (!next) {
      void v.play();
    }
    setMuted(next);
  }

  return (
    <div className="relative">
      <video
        ref={ref}
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="block w-full h-auto"
      />
      <button
        type="button"
        onClick={toggleMute}
        aria-label={muted ? "Unmute" : "Mute"}
        className="absolute top-3 right-3 px-3 py-1.5 border border-nerv-orange/60 bg-black/60 backdrop-blur-sm font-nerv-mono text-[10px] tracking-[0.2em] text-nerv-orange hover:bg-nerv-orange/20 transition-colors"
      >
        {muted ? "SOUND.ON" : "SOUND.OFF"}
      </button>
    </div>
  );
}
