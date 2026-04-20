"use client";

import { useEffect, useRef, useState } from "react";

type Props = {
  src: string;
  poster?: string;
  withSoundToggle?: boolean;
};

export default function HeroVideo({ src, poster, withSoundToggle = false }: Props) {
  const ref = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);
  const [faded, setFaded] = useState(false);

  function toggleMute() {
    const v = ref.current;
    if (!v) return;
    const next = !v.muted;
    v.muted = next;
    if (!next) {
      void v.play();
    }
    setMuted(next);
    setFaded(false);
  }

  useEffect(() => {
    if (!withSoundToggle || muted) {
      setFaded(false);
      return;
    }
    const t = setTimeout(() => setFaded(true), 3000);
    return () => clearTimeout(t);
  }, [muted, withSoundToggle]);

  if (!withSoundToggle) {
    return (
      <video
        src={src}
        poster={poster}
        autoPlay
        muted
        loop
        playsInline
        preload="metadata"
        className="block w-full h-auto"
      />
    );
  }

  return (
    <div className="relative group">
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
        role="switch"
        aria-checked={!muted}
        aria-label={muted ? "Turn sound on" : "Turn sound off"}
        className={`absolute top-3 right-3 flex items-center gap-2.5 px-3 py-1.5 bg-black/60 backdrop-blur-sm font-nerv-mono text-[10px] tracking-[0.2em] transition-[opacity,colors,border-color,background-color] duration-700 border group-hover:opacity-100 focus-visible:opacity-100 ${
          faded ? "opacity-0" : "opacity-100"
        } ${
          muted
            ? "border-nerv-mid-gray/60 text-nerv-mid-gray hover:border-nerv-mid-gray hover:text-nerv-white"
            : "border-nerv-orange text-nerv-orange hover:bg-nerv-orange/10"
        }`}
      >
        <span>{muted ? "SOUND OFF" : "SOUND ON"}</span>
        <span
          className={`relative inline-block w-7 h-3.5 border transition-colors ${
            muted ? "bg-nerv-dark-gray border-nerv-mid-gray/60" : "bg-nerv-orange/20 border-nerv-orange"
          }`}
        >
          <span
            className={`absolute top-0 left-0 h-full w-3 transition-transform duration-200 ${
              muted ? "translate-x-0 bg-nerv-mid-gray" : "translate-x-4 bg-nerv-orange"
            }`}
          />
        </span>
      </button>
    </div>
  );
}
