"use client";

import type { MouseEvent } from "react";
import { INCOMING_THREAD_LABELS, THREAD_LABELS, type SkySignal, type SkyStarInfo } from "./meta";
import type { SkyLayout, SkyNebula } from "./layout";
import styles from "./Sky.module.css";

interface SkyListProps {
  layout: SkyLayout;
  infoById: Map<string, SkyStarInfo>;
  nebulas: SkyNebula[];
  signals: Record<string, SkySignal | null>;
  /** Id de la era seleccionada, si hay */
  selectedEra: string | null;
  openNebula: string | null;
  onToggleNebula: (eraId: string) => void;
  onNavigate: (event: MouseEvent<HTMLAnchorElement>, href: string) => void;
  idPrefix: string;
}

function capitalize(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1);
}

function SignalText({ signal }: { signal: SkySignal | null }) {
  if (!signal) return <p className={styles.listSignalText}>Sin señal por ahora.</p>;
  if (signal.kind === "frase") return <p className={styles.listSignalText}>{signal.content}</p>;
  if (signal.kind === "imagen") {
    // La URL de la señal es arbitraria y cambia con el tiempo; no pasa por next/image
    // eslint-disable-next-line @next/next/no-img-element
    return <img className={styles.signalMedia} src={signal.content} alt={signal.alt ?? ""} />;
  }
  return <video className={styles.signalMedia} src={signal.content} controls playsInline aria-label={signal.alt} />;
}

/** Equivalente en texto del cielo: constelaciones, obras, hilos y nebulosas */
export function SkyList({
  layout,
  infoById,
  nebulas,
  signals,
  selectedEra,
  openNebula,
  onToggleNebula,
  onNavigate,
  idPrefix,
}: SkyListProps) {
  return (
    <div className={styles.list}>
      {layout.labels.map((label) => {
        const stars = layout.stars.filter((s) => s.constellation === label.constellation);
        return (
          <section key={label.constellation} className={styles.listGroup}>
            <h3 className={styles.listHeading}>
              {label.name} <span className={styles.listFacet}>· {label.facet}</span>
            </h3>
            <ul className={styles.listWorks}>
              {stars.map((s) => {
                const info = infoById.get(s.workId);
                if (!info) return null;
                const offEra = selectedEra !== null && info.eraId !== selectedEra;
                const links = layout.threads.flatMap((t) => {
                  const outgoing = t.from === s.workId;
                  if (!outgoing && t.to !== s.workId) return [];
                  const other = infoById.get(outgoing ? t.to : t.from);
                  if (!other) return [];
                  return [
                    {
                      id: `${t.id}-${outgoing ? "out" : "in"}`,
                      label: outgoing ? capitalize(THREAD_LABELS[t.kind]) : INCOMING_THREAD_LABELS[t.kind],
                      title: other.title,
                      fromPart: outgoing ? t.fromPart : undefined,
                    },
                  ];
                });
                return (
                  <li key={s.workId} className={offEra ? `${styles.listWork} ${styles.listOff}` : styles.listWork}>
                    <a href={info.href} className={styles.listLink} onClick={(e) => onNavigate(e, info.href)}>
                      {info.title}
                    </a>
                    <p className={styles.listMeta}>
                      {info.typeLabel} ·{" "}
                      {info.dateIso ? <time dateTime={info.dateIso}>{info.dateLabel}</time> : info.dateLabel}
                      {info.eraName && <> · Era {info.eraName}</>}
                      {offEra && <> · Fuera de la era seleccionada</>}
                    </p>
                    {links.length > 0 && (
                      <ul className={styles.listThreads}>
                        {links.map((l) => (
                          <li key={l.id}>
                            {l.label}: {l.title}
                            {l.fromPart !== undefined && <> · desde la Parte {l.fromPart}</>}
                          </li>
                        ))}
                      </ul>
                    )}
                  </li>
                );
              })}
            </ul>
          </section>
        );
      })}

      {nebulas.map((n) => {
        const isOpen = openNebula === n.eraId;
        const offEra = selectedEra !== null && selectedEra !== n.eraId;
        return (
          <section
            key={n.eraId}
            className={offEra ? `${styles.listGroup} ${styles.listOff}` : styles.listGroup}
          >
            <h3 className={styles.listHeading}>Una nebulosa</h3>
            {offEra && <p className={styles.listMeta}>Fuera de la era seleccionada</p>}
            <button
              type="button"
              className={styles.listSignalButton}
              aria-expanded={isOpen}
              aria-controls={`${idPrefix}-signal-${n.eraId}`}
              onClick={() => onToggleNebula(n.eraId)}
            >
              {isOpen ? "Ocultar señal" : "Ver señal"}
            </button>
            <div id={`${idPrefix}-signal-${n.eraId}`} aria-live="polite">
              {isOpen && <SignalText signal={signals[n.eraId] ?? null} />}
            </div>
          </section>
        );
      })}
    </div>
  );
}
