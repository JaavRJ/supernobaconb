"use client";

import { useEffect, useState, type ReactNode } from "react";
import { isFirebaseConfigured } from "@/lib/firebase";
import {
  EMPTY_COUNTS,
  getReactionUserId,
  setChapterReaction,
  subscribeToChapterReactions,
  type ReactionCounts,
  type ReactionType,
} from "@/lib/reader/reactions";
import { useHydrated } from "./useHydrated";
import styles from "./ChapterReactions.module.css";

const ICON_PROPS = {
  viewBox: "0 0 24 24",
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 1.2,
  strokeLinecap: "round",
  strokeLinejoin: "round",
  "aria-hidden": true,
  focusable: false,
} as const;

const OPTIONS: { type: ReactionType; label: string; icon: ReactNode }[] = [
  {
    type: "heart",
    label: "Me encanta",
    icon: <path d="M12 20.5C6 16 3.5 12.8 3.5 9.3a4.4 4.4 0 0 1 8.5-1.6 4.4 4.4 0 0 1 8.5 1.6c0 3.5-2.5 6.7-8.5 11.2Z" />,
  },
  {
    type: "sad",
    label: "Me entristece",
    icon: (
      <>
        <path d="M12 3c2.6 3.4 5.5 6.2 5.5 10a5.5 5.5 0 0 1-11 0C6.5 9.2 9.4 6.4 12 3Z" />
        <path d="M9.5 14.500a2.700 2.700 0 0 0 1.500 1.700" />
      </>
    ),
  },
  {
    type: "mind_blown",
    label: "Me voló la cabeza",
    icon: (
      <>
        <path d="M6.500 20v-3.200C4.700 15.500 3.800 13.700 3.800 11.700a6.100 6.100 0 0 1 6.100-6.100c1 0 1.900.2 2.700.6" />
        <path d="M6.500 20h7v-2.700" />
        <path d="M18 2.500c.4 2.100 1.400 3.100 3.500 3.500-2.100.4-3.100 1.400-3.500 3.500-.4-2.100-1.400-3.100-3.500-3.500 2.100-.4 3.100-1.400 3.500-3.500Z" />
      </>
    ),
  },
  {
    type: "star",
    label: "Brillante",
    // Misma estrella de cuatro puntas que el resto del sitio
    icon: <path d="M12 2.500c.9 5.400 3.600 8.100 9 9-5.400.9-8.100 3.600-9 9-.9-5.400-3.600-8.100-9-9 5.400-.9 8.100-3.600 9-9Z" />,
  },
];

type Status = "loading" | "ready" | "error";

/** Fila de reacciones al final de un capítulo; los conteos se actualizan en vivo */
export function ChapterReactions({ partNumber, chapterIndex }: { partNumber: number; chapterIndex: number }) {
  const hydrated = useHydrated();
  const [status, setStatus] = useState<Status>("loading");
  const [counts, setCounts] = useState<ReactionCounts>(EMPTY_COUNTS);
  const [mine, setMine] = useState<ReactionType | null>(null);
  const [busy, setBusy] = useState(false);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    if (!hydrated || !isFirebaseConfigured()) return;
    const id = getReactionUserId();
    const stop = subscribeToChapterReactions(
      id,
      partNumber,
      chapterIndex,
      (nextCounts, nextMine) => {
        setUserId(id);
        setCounts(nextCounts);
        setMine(nextMine);
        setStatus("ready");
      },
      () => {
        console.warn("Reacciones: no se pudo conectar con Firebase.");
        setStatus("error");
      },
    );
    return stop;
  }, [hydrated, partNumber, chapterIndex]);

  if (!isFirebaseConfigured() || status === "error") return null;

  const choose = async (type: ReactionType) => {
    if (!userId || busy) return;
    setBusy(true);
    try {
      await setChapterReaction(userId, partNumber, chapterIndex, type);
    } catch {
      console.warn("Reacciones: no se pudo guardar tu reacción.");
    } finally {
      setBusy(false);
    }
  };

  const ready = status === "ready";

  return (
    <div className={styles.reactions} data-reader-interactive>
      <p className={styles.prompt} id={`reacciones-${partNumber}-${chapterIndex}`}>
        ¿Qué te dejó este capítulo?
      </p>
      <div role="group" aria-labelledby={`reacciones-${partNumber}-${chapterIndex}`} className={styles.row}>
        {OPTIONS.map(({ type, label, icon }) => {
          const selected = mine === type;
          return (
            <button
              key={type}
              type="button"
              className={styles.button}
              aria-pressed={selected}
              aria-label={ready ? `${label}: ${counts[type]}` : label}
              disabled={!ready || busy}
              onClick={() => void choose(type)}
            >
              <svg {...ICON_PROPS} className={styles.icon} data-selected={selected || undefined}>
                {icon}
              </svg>
              <span className={styles.count} aria-hidden="true">
                {ready ? counts[type] : " "}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
