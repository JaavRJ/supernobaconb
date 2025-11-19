import React, { useState } from "react";
import EpisodeController, { Episode } from "../components/controllers/EpisodeControllers";
import Footer from "../components/UI/Footer";
import BeforePage from "./BeforePage";
import Parte1 from "./parts/Parte1";
import Parte2 from "./parts/Parte2";
import Parte3 from "./parts/Parte3";
import Parte4 from "./parts/Parte4";
import Parte5 from "./parts/Parte5";
import "../assets/styles/Burbuja.css";

export default function HomePage() {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  return (
    
    <div style={{ position: "relative" }}>
      
      {/* BURBUJA FLOTAANTE MEJORADA */}
      <div className="floating-bubble">
      <EpisodeController
        initialRelease={new Date("2025-12-02T00:00:00")}
        onEpisodeChange={(ep) => setCurrentEpisode(ep)}
        onTimeLeftChange={(t) => setTimeLeft(t)}
      />
    </div>
            <Footer />


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
