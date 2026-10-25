"use client";

import Link from "next/link";
import { getTracksForWork } from "@/content";
import { usePlayer } from "@/components/player/PlayerProvider";

export function PruebaClient() {
  const { playQueue } = usePlayer();

  const probar = () => {
    const tracks = getTracksForWork("nohablobien-part3")
      .slice(0, 2)
      .map((t) => ({ ...t, audioUrl: "/audio/prueba.wav" }));
    playQueue(tracks);
  };

  return (
    <div style={{ padding: "var(--space-5) var(--space-4)", display: "grid", gap: "var(--space-3)" }}>
      <h1>Prueba del reproductor</h1>
      <p>Página temporal (se borra en F1-13).</p>
      <p>
        <button type="button" onClick={probar} style={{ minHeight: 44, padding: "0 1rem" }}>
          Probar reproductor
        </button>
      </p>
      <p>
        <Link href="/">Ir a la portada</Link> · <Link href="/musica">Ir a música</Link>
      </p>
    </div>
  );
}
