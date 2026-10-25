import type { CSSProperties } from "react";
import { ERA_THEME_VARS, type EraThemeTokens } from "@/types/theme";

/** Convierte los tokens de una era en variables CSS para el atributo `style` */
export function eraThemeStyle(tokens: EraThemeTokens): CSSProperties {
  const style: Record<string, string> = {};
  for (const key of Object.keys(ERA_THEME_VARS) as (keyof typeof ERA_THEME_VARS)[]) {
    style[ERA_THEME_VARS[key]] = tokens[key];
  }
  // Las custom properties no están en CSSProperties; este es el único cast
  return style as CSSProperties;
}
