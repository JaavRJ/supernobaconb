"use client";

import { usePathname } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/content/site";
import styles from "./HeaderNav.module.css";
import { NavLinks } from "./NavLinks";

/** Navegación principal: links en línea (≥ 768 px) o panel con botón (móvil) */
export function HeaderNav({ items }: { items: NavItem[] }) {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [prevPathname, setPrevPathname] = useState(pathname);
  // Al cambiar de ruta se cierra el menú (ajuste de estado durante el render, sin efecto)
  if (prevPathname !== pathname) {
    setPrevPathname(pathname);
    setOpen(false);
  }
  const buttonRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    if (!open) return;
    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") {
        setOpen(false);
        buttonRef.current?.focus();
      }
    }
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  return (
    <>
      <button
        ref={buttonRef}
        type="button"
        className={styles.toggle}
        aria-label={open ? "Cerrar menú" : "Abrir menú"}
        aria-expanded={open}
        aria-controls="menu-principal"
        onClick={() => setOpen(!open)}
      >
        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
          {open ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
        </svg>
      </button>
      <nav id="menu-principal" className={`${styles.nav} ${open ? styles.open : ""}`} aria-label="Principal">
        <NavLinks items={items} pathname={pathname} onNavigate={() => setOpen(false)} />
      </nav>
    </>
  );
}
