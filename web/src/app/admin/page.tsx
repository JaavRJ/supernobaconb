import Link from "next/link";
import { AdminPage } from "@/components/admin/AdminPage";
import { adminSections } from "@/lib/admin/sections";
import styles from "./page.module.css";

export default function AdminHome() {
  return (
    <AdminPage title="Panel" description="Elige qué quieres editar. Lo que guardes se ve en el sitio al momento.">
      <ul className={styles.list}>
        {adminSections.map((s) => (
          <li key={s.href}>
            <Link href={s.href} className={styles.item}>
              <span className={styles.label}>{s.label}</span>
              <span className={styles.description}>{s.description}</span>
            </Link>
          </li>
        ))}
      </ul>
    </AdminPage>
  );
}
