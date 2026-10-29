import Link from "next/link";
import { getConnections } from "@/lib/connections";
import { content } from "@/lib/content";
import type { Work } from "@/types/content";
import styles from "./Connections.module.css";

interface ConnectionsProps {
  work: Work;
  headingId?: string;
}

/** "Conectado con": los hilos de una obra y de sus canciones, como enlaces */
export async function Connections({ work, headingId = "work-threads" }: ConnectionsProps) {
  const connections = getConnections(await content(), work);
  if (connections.length === 0) return null;

  return (
    <section className={styles.section} aria-labelledby={headingId}>
      <h2 id={headingId} className={styles.heading}>
        Conectado con
      </h2>
      <ul className={styles.threads}>
        {connections.map((c) => (
          <li key={c.id}>
            <Link href={c.href}>{c.text}</Link>
          </li>
        ))}
      </ul>
    </section>
  );
}
