"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from "react";
import { getWork } from "@/content";
import type { Track } from "@/types/content";

/** Segundos a partir de los cuales "anterior" reinicia la canción en vez de retroceder */
const RESTART_THRESHOLD_SEC = 3;

/** Volumen al quitar el silencio cuando el deslizador estaba en 0 */
const DEFAULT_VOLUME = 0.8;

export interface PlayerContextValue {
  queue: Track[];
  index: number;
  /** Canción actual; undefined si no hay cola */
  currentTrack: Track | undefined;
  isPlaying: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  muted: boolean;
  playQueue: (tracks: Track[], startIndex?: number) => void;
  togglePlay: () => void;
  next: () => void;
  previous: () => void;
  seek: (seconds: number) => void;
  setVolume: (volume: number) => void;
  toggleMute: () => void;
}

const PlayerContext = createContext<PlayerContextValue | null>(null);

export function usePlayer(): PlayerContextValue {
  const ctx = useContext(PlayerContext);
  if (!ctx) throw new Error("usePlayer debe usarse dentro de <PlayerProvider>");
  return ctx;
}

/**
 * Dueño del único <audio> del sitio. Vive en el layout raíz, que no se
 * vuelve a montar al navegar, así que la música no se corta.
 */
export function PlayerProvider({ children }: { children: ReactNode }) {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [queue, setQueue] = useState<Track[]>([]);
  const [index, setIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolumeState] = useState(1);
  const [muted, setMuted] = useState(false);

  const currentTrack: Track | undefined = queue[index];
  const currentUrl = currentTrack?.audioUrl;

  // Carga y reproduce cada vez que cambia la cola o la posición (acciones del usuario)
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio || !currentUrl) return;
    audio.src = currentUrl;
    audio.play().catch(() => {
      // El navegador puede bloquear la reproducción; los eventos "play"/"pause" mantienen el estado
    });
  }, [queue, index, currentUrl]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = volume;
    audio.muted = muted;
  }, [volume, muted]);

  const playQueue = useCallback((tracks: Track[], startIndex = 0) => {
    const playable = tracks.filter((t) => Boolean(t.audioUrl));
    if (playable.length === 0) return;
    const start = Math.min(Math.max(startIndex, 0), playable.length - 1);
    setQueue(playable);
    setIndex(start);
    setCurrentTime(0);
    setDuration(0);
  }, []);

  const togglePlay = useCallback(() => {
    const audio = audioRef.current;
    if (!audio || !audio.src) return;
    if (audio.paused) {
      audio.play().catch(() => {});
    } else {
      audio.pause();
    }
  }, []);

  const next = useCallback(() => {
    if (index < queue.length - 1) setIndex(index + 1);
  }, [index, queue.length]);

  const previous = useCallback(() => {
    const audio = audioRef.current;
    if (!audio) return;
    if (audio.currentTime > RESTART_THRESHOLD_SEC || index === 0) {
      audio.currentTime = 0;
      setCurrentTime(0);
    } else {
      setIndex(index - 1);
    }
  }, [index]);

  const seek = useCallback((seconds: number) => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.currentTime = seconds;
    setCurrentTime(seconds);
  }, []);

  const setVolume = useCallback((v: number) => {
    const clamped = Math.min(Math.max(v, 0), 1);
    setVolumeState(clamped);
    setMuted(clamped === 0);
  }, []);

  const toggleMute = useCallback(() => {
    if (muted && volume === 0) setVolumeState(DEFAULT_VOLUME);
    setMuted(!muted);
  }, [muted, volume]);

  const handleEnded = () => {
    if (index < queue.length - 1) {
      setIndex(index + 1);
    } else {
      setIsPlaying(false);
      setCurrentTime(0);
    }
  };

  // Una pista que falla (404, formato) se salta; si era la última, se detiene
  const handleError = () => {
    if (index < queue.length - 1) {
      setIndex(index + 1);
    } else {
      audioRef.current?.pause();
      setIsPlaying(false);
    }
  };

  // Media Session: controles del sistema (pantalla de bloqueo, teclas multimedia)
  useEffect(() => {
    if (typeof navigator === "undefined" || !("mediaSession" in navigator)) return;
    const session = navigator.mediaSession;
    if (!currentTrack) {
      session.metadata = null;
      return;
    }
    session.metadata = new MediaMetadata({
      title: currentTrack.title,
      artist: "Supernoba",
      album: getWork(currentTrack.workId)?.title ?? "",
    });
    const handlers: [MediaSessionAction, MediaSessionActionHandler | null][] = [
      ["play", togglePlay],
      ["pause", togglePlay],
      ["previoustrack", previous],
      ["nexttrack", index < queue.length - 1 ? next : null],
      [
        "seekto",
        (details) => {
          if (details.seekTime !== undefined) seek(details.seekTime);
        },
      ],
    ];
    for (const [action, handler] of handlers) {
      try {
        session.setActionHandler(action, handler);
      } catch {
        // El navegador no soporta esta acción
      }
    }
  }, [currentTrack, index, queue.length, togglePlay, previous, next, seek]);

  const value = useMemo<PlayerContextValue>(
    () => ({
      queue,
      index,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      muted,
      playQueue,
      togglePlay,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
    }),
    [
      queue,
      index,
      currentTrack,
      isPlaying,
      currentTime,
      duration,
      volume,
      muted,
      playQueue,
      togglePlay,
      next,
      previous,
      seek,
      setVolume,
      toggleMute,
    ],
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
      <audio
        ref={audioRef}
        preload="metadata"
        onPlay={() => setIsPlaying(true)}
        onPause={() => setIsPlaying(false)}
        onTimeUpdate={(e) => setCurrentTime(e.currentTarget.currentTime)}
        onDurationChange={(e) => {
          const d = e.currentTarget.duration;
          setDuration(Number.isFinite(d) ? d : 0);
        }}
        onEnded={handleEnded}
        onError={handleError}
      />
    </PlayerContext.Provider>
  );
}
