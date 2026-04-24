import { useEffect, useRef } from "react";
import bgMusic from "./assets/Bright Minds Theme.mp3";

let globalAudio = null;

export default function useBgMusic(start) {
  const audioRef = useRef(null);

  useEffect(() => {
    if (!start) return;

    // Create only once
    if (!globalAudio) {
      globalAudio = new Audio(bgMusic);
      globalAudio.loop = true;
      globalAudio.volume = 0.3;
    }

    audioRef.current = globalAudio;

    globalAudio.play().catch(() => {});
  }, [start]);

  const pause = () => audioRef.current?.pause();
  const play = () => audioRef.current?.play().catch(() => {});

  return { pause, play };
}