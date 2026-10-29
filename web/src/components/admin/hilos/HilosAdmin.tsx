"use client";

import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { useAdminCollection } from "@/lib/admin/useAdminCollection";
import type { Track, Work } from "@/types/content";
import styles from "./Hilos.module.css";
import { SignalsTab } from "./SignalsTab";
import { ThreadsTab } from "./ThreadsTab";

type Tab = "hilos" | "senales";

const TABS: { id: Tab; label: string }[] = [
  { id: "hilos", label: "Hilos" },
  { id: "senales", label: "Nebulosa · señales" },
];

/** Hilos entre obras y señales de la nebulosa. */
export function HilosAdmin() {
  const [tab, setTab] = useState<Tab>("hilos");
  const works = useAdminCollection<Work>("works");
  const tracks = useAdminCollection<Track>("tracks");

  return (
    <AdminPage
      title="Hilos y nebulosa"
      description="Los hilos conectan obras (y canciones) y aparecen como “Conectado con”. Las señales son lo que la nebulosa deja ver."
    >
      <div className={styles.stack}>
        <div className={styles.tabs} role="group" aria-label="Sección">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
              aria-pressed={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </div>
        {tab === "hilos" ? (
          works.loading || tracks.loading ? (
            <p className={styles.message}>Cargando obras…</p>
          ) : (
            <ThreadsTab works={works.items} tracks={tracks.items} />
          )
        ) : (
          <SignalsTab />
        )}
      </div>
    </AdminPage>
  );
}
