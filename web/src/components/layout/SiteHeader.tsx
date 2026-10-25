import Link from "next/link";
import { Suspense } from "react";
import { StarWord } from "@/components/brand/StarWord";
import { site } from "@/content/site";
import { HeaderNav } from "./HeaderNav";
import navStyles from "./HeaderNav.module.css";
import { NavLinks } from "./NavLinks";
import styles from "./SiteHeader.module.css";

export function SiteHeader() {
  return (
    <header className={styles.header}>
      <div className={styles.inner}>
        <Link href="/" className={styles.brand}>
          <StarWord text={site.name.toUpperCase()} />
        </Link>
        {/* usePathname puede suspender en rutas dinámicas: el fallback muestra los links sin estado activo */}
        <Suspense
          fallback={
            <details className={navStyles.fallback}>
              <summary className={navStyles.toggle}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
                  <path d="M4 7h16M4 12h16M4 17h16" />
                </svg>
                <span className={navStyles.srOnly}>Menú</span>
              </summary>
              <nav className={`${navStyles.nav} ${navStyles.open}`} aria-label="Principal">
                <NavLinks items={site.nav} pathname={null} />
              </nav>
            </details>
          }
        >
          <HeaderNav items={site.nav} />
        </Suspense>
      </div>
    </header>
  );
}
