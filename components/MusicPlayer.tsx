"use client";

import { useRef, useState } from "react";
import { wedding } from "@/config/wedding";

const preferenceKey = `${wedding.slug}:music`;

export function MusicPlayer() {
  const audio = useRef<HTMLAudioElement>(null);
  const frame = useRef<number | null>(null);
  const [playing, setPlaying] = useState(false);

  const fade = (to: number, done?: () => void) => {
    const element = audio.current;
    if (!element) return;
    if (frame.current) cancelAnimationFrame(frame.current);
    const from = element.volume;
    const start = performance.now();
    const step = (now: number) => {
      const progress = Math.min(1, (now - start) / 900);
      element.volume = from + (to - from) * progress;
      if (progress < 1) frame.current = requestAnimationFrame(step);
      else {
        frame.current = null;
        done?.();
      }
    };
    frame.current = requestAnimationFrame(step);
  };

  const toggle = () => {
    const element = audio.current;
    if (!element) return;
    if (playing) {
      setPlaying(false);
      localStorage.setItem(preferenceKey, "off");
      fade(0, () => element.pause());
      return;
    }
    if (frame.current) cancelAnimationFrame(frame.current);
    element.volume = 0;
    element.play().then(() => {
      fade(.25);
      setPlaying(true);
      localStorage.setItem(preferenceKey, "on");
    }).catch(() => setPlaying(false));
  };

  return <>
    <audio ref={audio} loop preload="metadata" src={wedding.assets.audio} />
    <button type="button" className={`music ${playing ? "is-playing" : ""}`} onClick={toggle} aria-label={playing ? "Pausar música" : "Reproducir música"}>
      <span>{playing ? "♫" : "♪"}</span><i /><i /><i />
    </button>
  </>;
}
