import React, { useState } from "react";
import EpisodeController, { Episode } from "../components/controllers/EpisodeControllers";

import BeforePage from "./BeforePage";
import Parte1 from "./parts/Parte1";
import Parte2 from "./parts/Parte2";
import Parte3 from "./parts/Parte3";
import Parte4 from "./parts/Parte4";
import Parte5 from "./parts/Parte5";

export default function HomePage() {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  return (
    <div style={{ position: "relative" }}>
      {/* BURBUJA FLOTAANTE MEJORADA */}
      <div style={{
        position: "fixed",
        bottom: "20px",
        right: "20px",
        borderRadius: "20px", // bordes más suaves
        padding: "12px 20px",  // espacio interno suficiente
        background: "linear-gradient(135deg, #151414ff, #141414ff)",
        boxShadow: "0 8px 20px rgba(59, 59, 59, 0.3), 0 0 15px rgba(53, 53, 53, 0.4)",
        display: "inline-flex",  // se adapta al contenido
        justifyContent: "center",
        alignItems: "center",
        color: "#fff",
        fontWeight: "bold",
        height: "40px",
        fontSize: "14px",
        textAlign: "center",
        zIndex: 9999,
        animation: "float 3s ease-in-out infinite alternate",
        }}>
  <EpisodeController
    initialRelease={new Date("2025-12-02T00:00:00")}
    onEpisodeChange={(ep) => setCurrentEpisode(ep)}
    onTimeLeftChange={(t) => setTimeLeft(t)}
  />
</div>


      {/* Mostrar BeforePage mientras aún no se libera ningún episodio */}
      {currentEpisode === null && timeLeft !== null && (
        <BeforePage/>
      )}

      {/* Mostrar páginas por episodio */}
      {currentEpisode === 1 && <Parte1 />}
      {currentEpisode === 2 && <Parte2 />}
      {currentEpisode === 3 && <Parte3 />}
      {currentEpisode === 4 && <Parte4 />}
      {currentEpisode === 5 && <Parte5 />}
    </div>
  );
}
