import { site } from "@/content/site";
import styles from "./SiteFooter.module.css";

export function SiteFooter() {
  return (
    <footer className={styles.footer}>
      <div className={styles.inner}>
        <ul className={styles.links} aria-label="Plataformas">
          {site.social.map((item) => (
            <li key={item.href}>
              <a href={item.href} target="_blank" rel="noopener noreferrer" className={styles.link}>
                {item.label}
              </a>
            </li>
          ))}
        </ul>
        <p className={styles.copy}>© {site.name}</p>
      </div>
    </footer>
  );
}
