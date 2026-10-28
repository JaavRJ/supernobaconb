"use client";

import { useEffect } from "react";

/**
 * Escribe --hero-p en <html>: 0 con el hero entero a la vista, 1 cuando ya salió de la pantalla.
 * No pinta nada. Con movimiento reducido no escribe nada (los valores por defecto dejan todo visible).
 */
export function HeroMotion() {
  useEffect(() => {
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;

    const root = document.documentElement;
    const hero = document.querySelector<HTMLElement>("[data-hero]");
    if (!hero) return;

    let frame = 0;
    const update = () => {
      frame = 0;
      const height = hero.offsetHeight || 1;
      const progress = Math.min(1, Math.max(0, window.scrollY / height));
      root.style.setProperty("--hero-p", progress.toFixed(4));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };

    update();
    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    return () => {
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      if (frame) cancelAnimationFrame(frame);
      root.style.removeProperty("--hero-p");
    };
  }, []);

  return null;
}
