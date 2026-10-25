import type { ElementType, ReactNode } from "react";
import { eraThemeStyle } from "@/lib/theme";
import type { Era } from "@/types/content";
import { Backdrop } from "./Backdrop";
import styles from "./EraTheme.module.css";

interface EraThemeProps {
  /** Era cuyo tema se aplica; null hereda el cielo base */
  era: Era | null;
  as?: ElementType;
  className?: string;
  "aria-labelledby"?: string;
  children: ReactNode;
}

/** Aplica las variables de tema de una era a su contenido */
export function EraTheme({
  era,
  as: Tag = "div",
  className,
  "aria-labelledby": labelledBy,
  children,
}: EraThemeProps) {
  const classes = className ? `${styles.root} ${className}` : styles.root;

  if (!era) {
    return (
      <Tag className={classes} aria-labelledby={labelledBy}>
        {children}
      </Tag>
    );
  }

  const { backdrop } = era.theme;

  return (
    <Tag
      className={classes}
      aria-labelledby={labelledBy}
      data-era={era.id}
      style={eraThemeStyle(era.theme)}
    >
      {backdrop !== "none" && <Backdrop variant={backdrop} />}
      {children}
    </Tag>
  );
}
