import type { ReactNode } from "react";
import { site } from "@/content/site";
import styles from "./SiteFooter.module.css";

/** Íconos finos de trazo por plataforma, indexados por la etiqueta de `site.social` */
const icons: Record<string, ReactNode> = {
  Spotify: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M7.5 9.5c3.2-1 6.6-.7 9.2 1M8 12.6c2.7-.8 5.4-.5 7.7.9M8.6 15.5c2.1-.6 4-.3 5.8.7" />
    </>
  ),
  "Apple Music": (
    <>
      <path d="M10 17.5V6.5l8-1.8v11" />
      <circle cx="7.8" cy="17.5" r="2.2" />
      <circle cx="15.8" cy="15.7" r="2.2" />
    </>
  ),
  YouTube: (
    <>
      <rect x="3" y="6" width="18" height="12" rx="3.5" />
      <path d="M10.2 9.4v5.2l4.5-2.6z" />
    </>
  ),
};

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <ul className={styles.links} aria-label="Plataformas">
          {site.social.map((item) => (
            <li key={item.href}>
              <a
                href={item.href}
                target="_blank"
                rel="noopener noreferrer"
                className={styles.link}
                aria-label={`${item.label} (se abre en una pestaña nueva)`}
              >
                <svg
                  viewBox="0 0 24 24"
                  width="20"
                  height="20"
                  aria-hidden="true"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.4"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {icons[item.label]}
                </svg>
              </a>
            </li>
          ))}
          <li>
            <a
              href={site.instagram.url}
              target="_blank"
              rel="noopener noreferrer"
              className={styles.link}
              aria-label="Instagram (se abre en una pestaña nueva)"
            >
              <svg
                viewBox="0 0 24 24"
                width="20"
                height="20"
                aria-hidden="true"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.4"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <rect x="3.5" y="3.5" width="17" height="17" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17" cy="7" r="0.6" />
              </svg>
            </a>
          </li>
        </ul>
        <p className={styles.copy}>© 2026 SUPERNOBA</p>
      </div>
    </footer>
  );
}
