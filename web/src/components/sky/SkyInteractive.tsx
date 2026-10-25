"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, type CSSProperties, type MouseEvent } from "react";
import { SKY_HEIGHT, SKY_WIDTH, type SkyLayout } from "./layout";
import { THREAD_LABELS, THREAD_ORDER, type SkyStarInfo } from "./meta";
import styles from "./Sky.module.css";

interface SkyInteractiveProps {
  layout: SkyLayout;
  starInfo: SkyStarInfo[];
  /** Color de cada constelación, por id */
  constellationColors: Record<string, string>;
}

function classes(...names: (string | false | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

export function SkyInteractive({ layout, starInfo, constellationColors }: SkyInteractiveProps) {
  const router = useRouter();
  // Los ids de useId llevan ":"; se limpian para poder usarlos en url(#…)
  const prefix = `sky${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  const anchors = useRef<(HTMLAnchorElement | null)[]>([]);

  const activeId = hovered ?? focused;
  const infoById = useMemo(() => new Map(starInfo.map((i) => [i.workId, i])), [starInfo]);
  const starById = useMemo(() => new Map(layout.stars.map((s) => [s.workId, s])), [layout.stars]);
  const active = activeId ? starById.get(activeId) : undefined;
  const activeInfo = activeId ? infoById.get(activeId) : undefined;

  const connected = useMemo(() => {
    const ids = new Set<string>();
    if (activeId) {
      for (const t of layout.threads) {
        if (t.from === activeId) ids.add(t.to);
        if (t.to === activeId) ids.add(t.from);
      }
    }
    return ids;
  }, [activeId, layout.threads]);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHovered(null);
        setFocused(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeId]);

  function navigate(event: MouseEvent<HTMLAnchorElement>, href: string) {
    if (
      event.defaultPrevented ||
      event.button !== 0 ||
      event.ctrlKey ||
      event.metaKey ||
      event.shiftKey ||
      event.altKey
    ) {
      return;
    }
    event.preventDefault();
    router.push(href);
  }

  const presentKinds = THREAD_ORDER.filter((k) => layout.threads.some((t) => t.kind === k));

  function cardPlacement(): CSSProperties {
    if (!active) return {};
    const fx = active.x / SKY_WIDTH;
    // Cerca de un borde la tarjeta se alinea hacia dentro
    const x = fx < 0.35 ? "-14px" : fx > 0.65 ? "calc(-100% + 14px)" : "-50%";
    return { left: `${fx * 100}%`, "--card-x": x } as CSSProperties;
  }

  /** Coloca la tarjeta arriba o abajo según el espacio medido y la mantiene dentro del escenario */
  function placeCard(node: HTMLDivElement | null) {
    const stage = node?.parentElement;
    if (!node || !stage || !active) return;
    const stageHeight = stage.clientHeight;
    const cardHeight = node.offsetHeight;
    const starY = (active.y / SKY_HEIGHT) * stageHeight;
    const below = starY + 22;
    const above = starY - 22 - cardHeight;
    const fitsBelow = below + cardHeight <= stageHeight;
    const top = fitsBelow || (above < 0 && below <= stageHeight - above - cardHeight) ? below : above;
    const max = Math.max(0, stageHeight - cardHeight);
    node.style.top = `${Math.min(max, Math.max(0, top))}px`;
  }

  return (
    <div className={styles.wrapper}>
      <div className={styles.stage}>
        <svg
          className={styles.sky}
          viewBox={`0 0 ${SKY_WIDTH} ${SKY_HEIGHT}`}
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label="Mapa del cielo de Supernoba"
          aria-describedby={`${prefix}-desc`}
        >
          <desc id={`${prefix}-desc`}>
            Tres constelaciones, una por faceta del artista. Cada estrella es una obra; las más
            recientes brillan más. Los hilos unen obras relacionadas.
          </desc>

          <defs>
            {Object.entries(constellationColors).map(([id, color]) => (
              <radialGradient key={id} id={`${prefix}-halo-${id}`}>
                <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                <stop offset="35%" stopColor={color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            ))}
            {layout.threads.map((t) => {
              const a = starById.get(t.from);
              const b = starById.get(t.to);
              if (!a || !b) return null;
              return (
                <linearGradient
                  key={t.id}
                  id={`${prefix}-thread-${t.id}`}
                  gradientUnits="userSpaceOnUse"
                  x1={a.x}
                  y1={a.y}
                  x2={b.x}
                  y2={b.y}
                >
                  <stop offset="0%" stopColor={a.color} />
                  <stop offset="100%" stopColor={b.color} />
                </linearGradient>
              );
            })}
          </defs>

          <g className={styles.lines}>
            {layout.lines.map((l) => (
              <line
                key={`${l.from}-${l.to}`}
                className={classes(
                  activeId !== null && l.from !== activeId && l.to !== activeId && styles.dim,
                )}
                data-constellation={l.constellation}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
                stroke={constellationColors[l.constellation]}
              />
            ))}
          </g>

          <g className={styles.threads}>
            {layout.threads.map((t) => {
              const isLit = activeId !== null && (t.from === activeId || t.to === activeId);
              return (
                <path
                  key={t.id}
                  className={classes(
                    styles.thread,
                    isLit && styles.lit,
                    activeId !== null && !isLit && styles.dim,
                  )}
                  data-kind={t.kind}
                  data-from={t.from}
                  data-to={t.to}
                  d={t.path}
                  fill="none"
                  stroke={`url(#${prefix}-thread-${t.id})`}
                />
              );
            })}
          </g>

          <g className={styles.stars}>
            {layout.stars.map((s, i) => {
              const info = infoById.get(s.workId);
              const twinkle = {
                "--twinkle-delay": `${((i * 0.9) % 4).toFixed(1)}s`,
                "--twinkle-duration": `${(3.2 + (i % 3) * 0.8).toFixed(1)}s`,
              } as CSSProperties;
              const isLit = connected.has(s.workId);
              const dim = activeId !== null && s.workId !== activeId && !isLit;
              const content = (
                <>
                  <circle className={styles.hit} cx={s.x} cy={s.y} r={22} />
                  <circle className={styles.ring} cx={s.x} cy={s.y} r={s.r + 9} />
                  {s.unreleased ? (
                    <circle
                      cx={s.x}
                      cy={s.y}
                      r={s.r + 2}
                      fill="none"
                      stroke={s.color}
                      strokeWidth={1.5}
                      strokeDasharray="3 3"
                      opacity={0.55}
                    />
                  ) : (
                    <>
                      <circle
                        cx={s.x}
                        cy={s.y}
                        r={s.r * (3 + 4 * s.brightness)}
                        fill={`url(#${prefix}-halo-${s.constellation})`}
                        opacity={s.brightness}
                      />
                      <g className={styles.core}>
                        <circle
                          cx={s.x}
                          cy={s.y}
                          r={s.r * (0.6 + 0.4 * s.brightness)}
                          fill={s.color}
                          opacity={0.55 + 0.45 * s.brightness}
                        />
                      </g>
                    </>
                  )}
                </>
              );
              return (
                <g
                  key={s.workId}
                  className={classes(s.unreleased ? styles.unreleased : styles.star, dim && styles.dim)}
                  data-work-id={s.workId}
                  data-constellation={s.constellation}
                  style={twinkle}
                >
                  {info ? (
                    <a
                      ref={(node) => {
                        anchors.current[i] = node;
                      }}
                      href={info.href}
                      tabIndex={0}
                      className={styles.link}
                      aria-label={info.ariaLabel}
                      onClick={(e) => navigate(e, info.href)}
                      onMouseEnter={() => setHovered(s.workId)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={(e) => {
                        // Un clic de ratón no debe dejar la tarjeta fija
                        if (e.currentTarget.matches(":focus-visible")) setFocused(s.workId);
                      }}
                      onBlur={() => setFocused((cur) => (cur === s.workId ? null : cur))}
                      onKeyDown={(e) => {
                        const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                        if (!step || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
                        const total = layout.stars.length;
                        // Salta las estrellas sin enlace hasta la siguiente válida
                        for (let n = 1; n < total; n++) {
                          const next = anchors.current[(i + step * n + total * n) % total];
                          if (next) {
                            e.preventDefault();
                            next.focus();
                            return;
                          }
                        }
                      }}
                    >
                      {content}
                    </a>
                  ) : (
                    content
                  )}
                </g>
              );
            })}
          </g>

          <g className={styles.labels}>
            {layout.labels.map((l) => (
              <text key={l.constellation} x={l.x} y={l.y} textAnchor="middle">
                <tspan className={styles.name}>{l.name}</tspan>
                <tspan className={styles.facet} x={l.x} dy={22}>
                  {l.facet}
                </tspan>
              </text>
            ))}
          </g>
        </svg>

        {active && activeInfo && (
          <div ref={placeCard} className={styles.card} style={cardPlacement()} aria-hidden="true">
            <div className={styles.cardCover} style={{ "--c": active.color } as CSSProperties}>
              {activeInfo.coverUrl ? (
                <Image
                  src={activeInfo.coverUrl}
                  alt=""
                  width={128}
                  height={128}
                  sizes="64px"
                  className={styles.cardImage}
                />
              ) : (
                <span>{activeInfo.title}</span>
              )}
            </div>
            <div className={styles.cardText}>
              <p className={styles.cardTitle}>{activeInfo.title}</p>
              <p className={styles.cardMeta}>
                {activeInfo.typeLabel} · {activeInfo.dateLabel}
              </p>
              {activeInfo.eraName && <p className={styles.cardEra}>{activeInfo.eraName}</p>}
            </div>
          </div>
        )}
      </div>

      {presentKinds.length > 0 && (
        <ul className={styles.legend} aria-label="Tipos de hilo">
          {presentKinds.map((kind) => (
            <li key={kind}>
              <svg className={styles.legendSample} viewBox="0 0 40 8" aria-hidden="true">
                <line
                  className={styles.thread}
                  data-kind={kind}
                  x1={2}
                  y1={4}
                  x2={38}
                  y2={4}
                  stroke="currentColor"
                />
              </svg>
              {THREAD_LABELS[kind]}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
