import type { CSSProperties } from "react";
import styles from "./Backdrop.module.css";

interface BackdropProps {
  variant: "stars" | "grain" | "cosmos";
}

interface Dust {
  x: number;
  y: number;
  size: number;
  opacity: number;
}

interface Spark {
  x: number;
  y: number;
  scale: number;
  opacity: number;
  delay: number;
}

/** Generador con semilla fija (el mismo del mockup): mismas posiciones en cada render y en el cliente */
function seeded(seed: number) {
  let value = seed;
  return () => {
    value = (value * 16807) % 2147483647;
    return value / 2147483647;
  };
}

const round = (n: number) => Math.round(n * 100) / 100;

/** Se calcula una vez al cargar el módulo, no en cada render */
const { dust, sparks } = (() => {
  const rnd = seeded(11);
  const dust: Dust[] = Array.from({ length: 180 }, () => {
    const size = rnd() < 0.9 ? 1 + rnd() * 1.2 : 2 + rnd() * 1.5;
    return {
      x: round(rnd() * 100),
      y: round(rnd() * 100),
      size: round(size),
      opacity: round(0.35 + rnd() * 0.65),
    };
  });
  const sparks: Spark[] = Array.from({ length: 7 }, (_, i) => ({
    x: round(rnd() * 100),
    y: round(rnd() * 100),
    scale: round(0.5 + rnd() * 0.8),
    opacity: round(0.5 + rnd() * 0.5),
    delay: round(i * 1.3),
  }));
  return { dust, sparks };
})();

/** Fondo decorativo fijo detrás del contenido; lo renderiza <EraTheme> según el tema */
export function Backdrop({ variant }: BackdropProps) {
  if (variant === "cosmos") {
    return (
      <div className={`${styles.backdrop} ${styles.cosmos}`} aria-hidden="true">
        {dust.map((d, i) => (
          <span
            key={i}
            className={styles.dust}
            style={{ left: `${d.x}%`, top: `${d.y}%`, width: d.size, height: d.size, opacity: d.opacity }}
          />
        ))}
        {sparks.map((s, i) => (
          <span
            key={i}
            className={styles.spark}
            style={
              {
                left: `${s.x}%`,
                top: `${s.y}%`,
                "--spark-scale": s.scale,
                "--spark-opacity": s.opacity,
                animationDelay: `${s.delay}s`,
              } as CSSProperties
            }
          />
        ))}
      </div>
    );
  }

  return <div className={`${styles.backdrop} ${styles[variant]}`} aria-hidden="true" />;
}
