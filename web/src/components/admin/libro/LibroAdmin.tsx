"use client";

import { useState } from "react";
import { AdminPage } from "@/components/admin/AdminPage";
import { NotesTab } from "./NotesTab";
import { PartsTab } from "./PartsTab";
import { TextTab } from "./TextTab";
import styles from "./Libro.module.css";

const TABS = [
  { id: "partes", label: "Partes" },
  { id: "texto", label: "Texto" },
  { id: "notas", label: "Notas del autor" },
] as const;

type TabId = (typeof TABS)[number]["id"];

/** Admin del libro: partes (fechas y subtítulos), texto de cada parte y notas del autor. */
export function LibroAdmin() {
  const [tab, setTab] = useState<TabId>("partes");

  return (
    <AdminPage title="Libro" description="Fechas y subtítulos de las partes, el texto de cada una y las notas del autor.">
      <div className={styles.tabs} role="tablist" aria-label="Secciones del libro">
        {TABS.map((t) => (
          <button
            key={t.id}
            type="button"
            role="tab"
            id={`libro-tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`libro-panel-${t.id}`}
            className={`${styles.tab} ${tab === t.id ? styles.tabActive : ""}`}
            onClick={() => setTab(t.id)}
          >
            {t.label}
          </button>
        ))}
      </div>
      {/* Las tres siguen montadas para no perder lo escrito al cambiar de pestaña */}
      <div role="tabpanel" id="libro-panel-partes" aria-labelledby="libro-tab-partes" hidden={tab !== "partes"}>
        <PartsTab />
      </div>
      <div role="tabpanel" id="libro-panel-texto" aria-labelledby="libro-tab-texto" hidden={tab !== "texto"}>
        <TextTab />
      </div>
      <div role="tabpanel" id="libro-panel-notas" aria-labelledby="libro-tab-notas" hidden={tab !== "notas"}>
        <NotesTab />
      </div>
    </AdminPage>
  );
}
