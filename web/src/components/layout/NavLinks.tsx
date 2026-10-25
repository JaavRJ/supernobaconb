import Link from "next/link";
import type { NavItem } from "@/content/site";
import styles from "./NavLinks.module.css";

interface NavLinksProps {
  items: NavItem[];
  /** Ruta actual; null renderiza los links sin estado activo */
  pathname: string | null;
  onNavigate?: () => void;
}

function isActive(href: string, pathname: string | null) {
  if (pathname === null) return false;
  if (href === "/") return pathname === "/";
  return pathname === href || pathname.startsWith(`${href}/`);
}

/** Lista de links del menú; marca el activo con aria-current */
export function NavLinks({ items, pathname, onNavigate }: NavLinksProps) {
  return (
    <ul className={styles.list}>
      {items.map((item) => (
        <li key={item.href}>
          <Link
            href={item.href}
            className={styles.link}
            aria-current={isActive(item.href, pathname) ? "page" : undefined}
            onClick={onNavigate}
          >
            {item.label}
          </Link>
        </li>
      ))}
    </ul>
  );
}
