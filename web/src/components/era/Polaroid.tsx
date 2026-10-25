import Image from "next/image";
import styles from "./Polaroid.module.css";

interface PolaroidProps {
  /** Foto; si falta se muestra el marco con un fondo gris */
  src?: string;
  /** Vacío cuando la foto es decorativa (junto a su título o dentro de un enlace) */
  alt: string;
  /** Giro del marco en grados */
  rotate?: number;
  size?: "lg" | "sm";
  priority?: boolean;
}

/** Foto en blanco y negro con marco de polaroid */
export function Polaroid({ src, alt, rotate = 0, size = "lg", priority }: PolaroidProps) {
  const px = size === "lg" ? { w: 360, h: 270 } : { w: 220, h: 220 };
  return (
    <div
      className={`${styles.frame} ${size === "sm" ? styles.small : ""}`}
      style={{ transform: `rotate(${rotate}deg)` }}
    >
      {src ? (
        <Image
          className={styles.photo}
          src={src}
          alt={alt}
          width={px.w * 2}
          height={px.h * 2}
          sizes={`${px.w}px`}
          priority={priority}
          draggable={false}
        />
      ) : (
        <div className={styles.photo} aria-hidden="true" />
      )}
    </div>
  );
}
