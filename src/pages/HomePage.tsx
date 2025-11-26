import React, { useState } from "react";
import EpisodeController, { Episode } from "../components/controllers/EpisodeControllers";
import Footer from "../components/UI/Footer";
import BeforePage from "./BeforePage";
import ReadingSettings from "../components/ReadingSettings";
import NavigationSystem from "../components/navigation/NavigationSystem";
import "../assets/styles/Burbuja.css";

export default function HomePage() {
  const [currentEpisode, setCurrentEpisode] = useState<Episode | null>(null);
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  return (
    <div style={{ position: "relative" }}>
      {/* BURBUJA FLOTANTE MEJORADA */}
      <div className="floating-bubble">
        <EpisodeController
          initialRelease={new Date("2025-12-02T00:00:00")}
          onEpisodeChange={(ep) => setCurrentEpisode(ep)}
          onTimeLeftChange={(t) => setTimeLeft(t)}
        />
      </div>
      <Footer />
      <NavigationSystem currentEpisode={currentEpisode} />

      {/* SIEMPRE mostrar BeforePage en la ruta "/" */}
      <BeforePage currentEpisode={currentEpisode} />
    </div>
  );
}
