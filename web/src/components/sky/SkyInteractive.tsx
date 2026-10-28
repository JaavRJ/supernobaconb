"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";
import { useEffect, useId, useMemo, useRef, useState, useSyncExternalStore, type CSSProperties, type MouseEvent } from "react";
import { FacetIcon } from "./FacetIcon";
import { coreVisualRadius, type SkyLayout, type SkyNebula, type SkyOrientation } from "./layout";
import { THREAD_LABELS, THREAD_ORDER, type SkySignal, type SkyStarInfo } from "./meta";
import { SignalPanel } from "./SignalPanel";
import styles from "./Sky.module.css";
import { useSkyCamera } from "./useSkyCamera";

/** Cielo y nebulosas calculados para una orientación */
export interface SkyVariant {
  layout: SkyLayout;
  nebulas: SkyNebula[];
}

interface SkyInteractiveProps {
  /** El cielo apaisado y el vertical; CSS muestra uno según el ancho */
  variants: Record<SkyOrientation, SkyVariant>;
  starInfo: SkyStarInfo[];
  /** Color de cada constelación, por id */
  constellationColors: Record<string, string>;
  /** Señal activa de cada nebulosa (null si no hay) */
  signals?: Record<string, SkySignal | null>;
  /** Cielo de una sola constelación: sin leyenda de hilos */
  compact?: boolean;
}

function classes(...names: (string | false | undefined)[]): string {
  return names.filter(Boolean).join(" ");
}

const ORIENTATIONS: SkyOrientation[] = ["landscape", "portrait"];
const NARROW_QUERY = "(max-width: 639px)";

function subscribeNarrow(onChange: () => void) {
  const media = window.matchMedia(NARROW_QUERY);
  media.addEventListener("change", onChange);
  return () => media.removeEventListener("change", onChange);
}

/** Orientación del cielo visible; antes de montar (y en el servidor) es apaisada */
function useVisibleOrientation(): SkyOrientation {
  return useSyncExternalStore<SkyOrientation>(
    subscribeNarrow,
    () => (window.matchMedia(NARROW_QUERY).matches ? "portrait" : "landscape"),
    () => "landscape",
  );
}

/** Tipo de puntero del evento de clic, o el último que se vio si el navegador no lo da */
function clickPointerType(event: MouseEvent, fallback: string): string {
  const native = event.nativeEvent as Partial<PointerEvent>;
  return typeof native.pointerType === "string" ? native.pointerType : fallback;
}

export function SkyInteractive({
  variants,
  starInfo,
  constellationColors,
  signals = {},
  compact = false,
}: SkyInteractiveProps) {
  const router = useRouter();
  const visible = useVisibleOrientation();
  // Los ids de useId llevan ":"; se limpian para poder usarlos en url(#…)
  const basePrefix = `sky${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const [hovered, setHovered] = useState<string | null>(null);
  const [focused, setFocused] = useState<string | null>(null);
  // Estrella activada con un toque: el siguiente toque en ella navega
  const [touched, setTouched] = useState<string | null>(null);
  const lastPointer = useRef("");
  const anchors = useRef<Record<SkyOrientation, (HTMLAnchorElement | null)[]>>({
    landscape: [],
    portrait: [],
  });
  const [openNebula, setOpenNebula] = useState<string | null>(null);
  const nebulaButtons = useRef(new Map<string, HTMLButtonElement>());
  // El cielo completo se navega; el de una sola constelación se queda quieto
  const { stageRef, sceneHandlers, zoomed, zoomIn, zoomOut, reset, reveal } = useSkyCamera(!compact);

  const activeId = hovered ?? focused ?? touched;
  const infoById = useMemo(() => new Map(starInfo.map((i) => [i.workId, i])), [starInfo]);
  // Las obras y los hilos son los mismos en las dos orientaciones; solo cambian las posiciones
  const baseLayout = variants.landscape.layout;
  const activeInfo = activeId ? infoById.get(activeId) : undefined;

  const connected = useMemo(() => {
    const ids = new Set<string>();
    if (activeId) {
      for (const t of baseLayout.threads) {
        if (t.from === activeId) ids.add(t.to);
        if (t.to === activeId) ids.add(t.from);
      }
    }
    return ids;
  }, [activeId, baseLayout.threads]);

  useEffect(() => {
    if (!activeId) return;
    const onKey = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setHovered(null);
        setFocused(null);
        setTouched(null);
      }
    };
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [activeId]);

  useEffect(() => {
    if (!touched) return;
    // Tocar fuera de una estrella (o del enlace de la tarjeta) cierra la tarjeta
    const onPointerDown = (event: PointerEvent) => {
      if ((event.target as Element).closest("[data-sky-keep]")) return;
      setTouched(null);
      setHovered(null);
    };
    document.addEventListener("pointerdown", onPointerDown);
    return () => document.removeEventListener("pointerdown", onPointerDown);
  }, [touched]);

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

  /** Con el dedo, el primer toque activa la estrella y el segundo navega */
  function onStarClick(event: MouseEvent<HTMLAnchorElement>, workId: string, href: string) {
    if (clickPointerType(event, lastPointer.current) === "touch" && touched !== workId) {
      event.preventDefault();
      setTouched(workId);
      return;
    }
    navigate(event, href);
  }

  const presentKinds = THREAD_ORDER.filter((k) => baseLayout.threads.some((t) => t.kind === k));

  /** Coloca la tarjeta arriba o abajo según el espacio medido y la mantiene dentro de la escena */
  function placeCard(node: HTMLDivElement | null, starY: number, height: number) {
    const scene = node?.parentElement;
    if (!node || !scene) return;
    const sceneHeight = scene.clientHeight;
    const cardHeight = node.offsetHeight;
    const y = (starY / height) * sceneHeight;
    const below = y + 22;
    const above = y - 22 - cardHeight;
    const fitsBelow = below + cardHeight <= sceneHeight;
    const top = fitsBelow || (above < 0 && below <= sceneHeight - above - cardHeight) ? below : above;
    const max = Math.max(0, sceneHeight - cardHeight);
    node.style.top = `${Math.min(max, Math.max(0, top))}px`;
    // Con zoom la tarjeta se encoge hacia el lado de la estrella para no alejarse de ella
    node.dataset.side = top === below ? "below" : "above";
  }

  /** Un SVG con sus estrellas, la tarjeta y las nebulosas; se llama una vez por orientación */
  function renderScene(orientation: SkyOrientation) {
    const { layout, nebulas } = variants[orientation];
    const { width, height } = layout;
    const portrait = orientation === "portrait";
    const prefix = `${basePrefix}-${orientation}`;
    const starById = new Map(layout.stars.map((s) => [s.workId, s]));
    const active = activeId ? starById.get(activeId) : undefined;
    // Área de toque: hasta la mitad de la distancia al vecino más cercano, sin que se solapen
    const hitBase = portrait ? 30 : 22;
    const hitMax = portrait ? 39 : 30;
    const hitRadius = (star: (typeof layout.stars)[number]) => {
      const nearest = Math.min(
        ...layout.stars.filter((o) => o !== star).map((o) => Math.hypot(o.x - star.x, o.y - star.y)),
      );
      return Math.min(hitMax, Math.max(hitBase, nearest / 2));
    };
    // La tarjeta y el panel solo existen en la escena visible
    const isVisible = orientation === visible;

    function cardPlacement(): CSSProperties {
      if (!active) return {};
      const fx = active.x / width;
      // Cerca de un borde la tarjeta se alinea hacia dentro
      const x = fx < 0.35 ? "-14px" : fx > 0.65 ? "calc(-100% + 14px)" : "-50%";
      return { left: `${fx * 100}%`, "--card-x": x } as CSSProperties;
    }

    return (
      <div className={styles.camera}>
        <svg
          className={styles.sky}
          viewBox={`0 0 ${width} ${height}`}
          preserveAspectRatio="xMidYMid meet"
          role="group"
          aria-label="Mapa del cielo de Supernoba"
          aria-describedby={`${prefix}-desc`}
        >
          <desc id={`${prefix}-desc`}>
            {compact
              ? "La constelación Supernoba. Cada estrella es un sencillo; las más recientes brillan más."
              : "Tres constelaciones, una por faceta del artista. Cada estrella es una obra; las más recientes brillan más. Los hilos unen obras relacionadas."}
          </desc>

          <defs>
            {Object.entries(constellationColors).map(([id, color]) => (
              <radialGradient key={id} id={`${prefix}-halo-${id}`}>
                <stop offset="0%" stopColor={color} stopOpacity="0.9" />
                <stop offset="35%" stopColor={color} stopOpacity="0.35" />
                <stop offset="100%" stopColor={color} stopOpacity="0" />
              </radialGradient>
            ))}
            <radialGradient id={`${prefix}-core-glow`}>
              <stop offset="0%" stopColor="#f2d9a6" stopOpacity="0.38" />
              <stop offset="35%" stopColor="#f2d9a6" stopOpacity="0.12" />
              <stop offset="70%" stopColor="#f2d9a6" stopOpacity="0" />
            </radialGradient>
            <radialGradient id={`${prefix}-cloud-mask`}>
              <stop offset="0%" stopColor="#fff" />
              <stop offset="100%" stopColor="#fff" stopOpacity="0" />
            </radialGradient>
            {nebulas.map((n, i) => (
              <filter
                key={n.eraId}
                id={`${prefix}-cloud-${n.eraId}`}
                x="-50%"
                y="-50%"
                width="200%"
                height="200%"
              >
                <feTurbulence type="fractalNoise" baseFrequency="0.012" numOctaves="4" seed={7 + i} />
                <feColorMatrix values="0 0 0 0 .62  0 0 0 0 .66  0 0 0 0 .78  0 0 0 .9 -.25" />
                <feGaussianBlur stdDeviation="3" />
                <feComposite in2="SourceGraphic" operator="in" />
              </filter>
            ))}
            {layout.stars
              .filter((s) => s.core && !s.unreleased)
              .map((s) => {
                const size = coreVisualRadius(orientation) * 2;
                return (
                  <mask
                    key={s.workId}
                    id={`${prefix}-core-mask-${s.workId}`}
                    maskUnits="userSpaceOnUse"
                    x={s.x - size / 2}
                    y={s.y - size / 2}
                    width={size}
                    height={size}
                  >
                    <image
                      href="/brand/estrella.jpg"
                      x={s.x - size / 2}
                      y={s.y - size / 2}
                      width={size}
                      height={size}
                      preserveAspectRatio="xMidYMid meet"
                    />
                  </mask>
                );
              })}
          </defs>

          <g className={styles.lines}>
            {layout.lines.map((l) => (
              <line
                key={`${l.from}-${l.to}`}
                className={classes(activeId !== null && l.from !== activeId && l.to !== activeId && styles.dim)}
                data-constellation={l.constellation}
                x1={l.x1}
                y1={l.y1}
                x2={l.x2}
                y2={l.y2}
              />
            ))}
          </g>

          <g className={styles.threads}>
            {layout.threads.map((t) => {
              const isLit = activeId !== null && (t.from === activeId || t.to === activeId);
              return (
                <path
                  key={t.id}
                  className={classes(styles.thread, isLit && styles.lit, activeId !== null && !isLit && styles.dim)}
                  data-kind={t.kind}
                  data-from={t.from}
                  data-to={t.to}
                  d={t.path}
                  fill="none"
                />
              );
            })}
          </g>

          <g className={styles.nebulas} aria-hidden="true">
            {nebulas.map((n) => (
              <g key={n.eraId} className={styles.nebulaWrap}>
                <ellipse
                  className={styles.nebula}
                  cx={n.x}
                  cy={n.y}
                  rx={n.r * 2.2}
                  ry={n.r * 1.4}
                  fill={`url(#${prefix}-cloud-mask)`}
                  filter={`url(#${prefix}-cloud-${n.eraId})`}
                />
              </g>
            ))}
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
              const coreR = coreVisualRadius(orientation);
              const isCoreStar = s.core && !s.unreleased;
              const content = (
                <>
                  <circle
                    className={styles.hit}
                    cx={s.x}
                    cy={s.y}
                    r={isCoreStar ? Math.max(hitRadius(s), coreR * 0.85) : hitRadius(s)}
                  />
                  <circle className={styles.ring} cx={s.x} cy={s.y} r={isCoreStar ? coreR * 0.8 : s.r + 9} />
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
                  ) : isCoreStar ? (
                    <>
                      <circle cx={s.x} cy={s.y} r={coreR * 2.7} fill={`url(#${prefix}-core-glow)`} />
                      <g className={styles.core}>
                        <rect
                          x={s.x - coreR}
                          y={s.y - coreR}
                          width={coreR * 2}
                          height={coreR * 2}
                          fill="#fff"
                          mask={`url(#${prefix}-core-mask-${s.workId})`}
                        />
                      </g>
                    </>
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
                        anchors.current[orientation][i] = node;
                      }}
                      href={info.href}
                      tabIndex={0}
                      draggable={false}
                      className={styles.link}
                      aria-label={info.ariaLabel}
                      data-sky-keep=""
                      onPointerDown={(e) => {
                        lastPointer.current = e.pointerType;
                      }}
                      onClick={(e) => onStarClick(e, s.workId, info.href)}
                      onMouseEnter={() => setHovered(s.workId)}
                      onMouseLeave={() => setHovered(null)}
                      onFocus={(e) => {
                        // Un clic de ratón no debe dejar la tarjeta fija
                        if (e.currentTarget.matches(":focus-visible")) {
                          setFocused(s.workId);
                          reveal(s.x / width, s.y / height);
                        }
                      }}
                      onBlur={() => setFocused((cur) => (cur === s.workId ? null : cur))}
                      onKeyDown={(e) => {
                        lastPointer.current = "";
                        const step = e.key === "ArrowRight" ? 1 : e.key === "ArrowLeft" ? -1 : 0;
                        if (!step || e.altKey || e.ctrlKey || e.metaKey || e.shiftKey) return;
                        const total = layout.stars.length;
                        // Salta las estrellas sin enlace hasta la siguiente válida
                        for (let n = 1; n < total; n++) {
                          const next = anchors.current[orientation][(i + step * n + total * n) % total];
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

          <g aria-hidden="true">
            {layout.stars
              .filter((s) => s.main)
              .map((s) => {
                const coreR = coreVisualRadius(orientation);
                const side = s.x < width / 2 ? -1 : 1;
                const radius = portrait ? 26 : 19;
                const x = s.core ? s.x + coreR * 1.15 : s.x + side * (s.r + radius + 14);
                const y = s.core ? s.y + coreR * 0.8 : s.y - (s.r + radius + 8);
                const dim = activeId !== null && s.workId !== activeId && !connected.has(s.workId);
                return (
                  <FacetIcon
                    key={s.workId}
                    constellation={s.constellation}
                    x={x}
                    y={y}
                    radius={radius}
                    dim={dim}
                  />
                );
              })}
          </g>

          <g className={styles.labels}>
            {layout.labels.map((l) => (
              <text key={l.constellation} x={l.x} y={l.y} textAnchor="middle">
                <tspan className={portrait ? styles.namePortrait : styles.name}>{l.name}</tspan>
                <tspan
                  className={portrait ? styles.facetPortrait : styles.facet}
                  x={l.x}
                  dy={portrait ? 30 : 22}
                >
                  {l.facet}
                </tspan>
              </text>
            ))}
          </g>
        </svg>

        {isVisible && active && activeInfo && (
          <div
            ref={(node) => placeCard(node, active.y, height)}
            className={styles.card}
            style={cardPlacement()}
            aria-hidden="true"
          >
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
              {touched === active.workId && (
                // El acceso accesible es el enlace de la propia estrella; este es solo para el dedo
                <a
                  href={activeInfo.href}
                  tabIndex={-1}
                  className={styles.cardLink}
                  data-sky-keep=""
                  onClick={(e) => navigate(e, activeInfo.href)}
                >
                  Ver obra
                </a>
              )}
            </div>
          </div>
        )}

        {nebulas.map((n) => {
          const isOpen = openNebula === n.eraId;
          const left = `${(n.x / width) * 100}%`;
          const buttonKey = `${orientation}:${n.eraId}`;
          return (
            <div key={n.eraId}>
              <button
                type="button"
                id={`${prefix}-nebula-btn-${n.eraId}`}
                ref={(node) => {
                  if (node) nebulaButtons.current.set(buttonKey, node);
                  else nebulaButtons.current.delete(buttonKey);
                }}
                className={styles.nebulaButton}
                style={{
                  left,
                  top: `${(n.y / height) * 100}%`,
                  width: `${((n.r * 3) / width) * 100}%`,
                }}
                aria-label="Una nebulosa. Ver señal"
                aria-expanded={isOpen}
                aria-controls={isOpen ? `${prefix}-signal-${n.eraId}` : undefined}
                onClick={() => setOpenNebula(isOpen ? null : n.eraId)}
              />
              {isOpen && isVisible && (
                <SignalPanel
                  id={`${prefix}-signal-${n.eraId}`}
                  signal={signals[n.eraId] ?? null}
                  style={
                    {
                      left: `clamp(calc(var(--signal-w) / 2), ${left}, calc(100% - var(--signal-w) / 2))`,
                      top: `${((n.y + n.r) / height) * 100}%`,
                      "--top": `${((n.y + n.r) / height) * 100}%`,
                    } as CSSProperties
                  }
                  triggerId={`${prefix}-nebula-btn-${n.eraId}`}
                  onClose={(returnFocus) => {
                    setOpenNebula(null);
                    if (returnFocus) nebulaButtons.current.get(buttonKey)?.focus();
                  }}
                />
              )}
            </div>
          );
        })}
      </div>
    );
  }

  return (
    <div className={styles.wrapper}>
      <div
        ref={stageRef}
        className={classes(styles.stage, !compact && styles.navigable)}
        data-zoomed={zoomed || undefined}
      >
        {!compact && (
          <>
            <div className={classes(styles.dust, styles.dustFar)} aria-hidden="true" />
            <div className={classes(styles.dust, styles.dustNear)} aria-hidden="true" />
          </>
        )}
        {ORIENTATIONS.map((orientation) => (
          <div
            key={orientation}
            className={classes(
              styles.scene,
              orientation === "portrait" ? styles.scenePortrait : styles.sceneLandscape,
            )}
            data-orientation={orientation}
            {...sceneHandlers}
          >
            {renderScene(orientation)}
          </div>
        ))}
        {!compact && (
          <div className={styles.controls}>
            <span className={styles.hint} aria-hidden="true">
              arrastra para navegar
            </span>
            <button type="button" className={styles.control} onClick={zoomOut} aria-label="Alejar el cielo">
              −
            </button>
            <button type="button" className={styles.control} onClick={zoomIn} aria-label="Acercar el cielo">
              +
            </button>
            <button
              type="button"
              className={classes(styles.control, styles.controlWide)}
              onClick={reset}
              aria-label="Volver a ver todo el cielo"
            >
              centrar
            </button>
          </div>
        )}
      </div>

      {!compact && presentKinds.length > 0 && (
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
