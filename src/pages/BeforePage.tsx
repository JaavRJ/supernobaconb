import React, { useEffect, useRef } from "react";
import "../assets/styles/Partes.css";
import FontEstrella from "../components/pruebas/FontEstrella";
import GaleriaPartes from "../components/GalleryPartes";
import InfoPanel from "../components/InfoPanel";
import { Episode } from "../components/controllers/EpisodeControllers";

interface BeforePageProps {
  currentEpisode?: Episode | null;
}

export default function BeforePage({ currentEpisode = null }: BeforePageProps) {

  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Scroll horizontal con la rueda
    const handleWheel = (e: WheelEvent) => {
      window.scrollBy({
        left: e.deltaY * 5,
        behavior: "smooth",
      });
    };
    window.addEventListener("wheel", handleWheel, { passive: false });

    // Generar estrellas 
    const container = starsRef.current;
    if (container && container.children.length === 0) {
      for (let i = 0; i < 100; i++) {
        const star = document.createElement("div");
        star.className = "star";
        star.style.top = `${Math.random() * 100}vh`;
        star.style.left = `${Math.random() * 100}vw`;
        const size = Math.random() * 2 + 1;
        star.style.width = `${size}px`;
        star.style.height = `${size}px`;
        star.style.animationDuration = `${1.5 + Math.random() * 2}s`;
        container.appendChild(star);
      }
    }

    return () => {
      window.removeEventListener("wheel", handleWheel);
    };
  }, []);

  return (
    <>
      <div className="stars-container" ref={starsRef}></div>

      <div className="horizontal-scroll">
        <div className="side-text">SUPERNOBA</div>
        <div className="side-text-right"></div>

        {/* Esta es tu primera "pantalla" en el scroll */}
        <FontEstrella />

        {/* ANUNCIO DE PARTE DISPONIBLE */}
        {currentEpisode !== null && (
          <div className="row">
            <div style={{
              padding: '40px',
              background: 'var(--glass-bg)',
              backdropFilter: 'blur(var(--glass-blur))',
              border: '2px solid var(--accent)',
              borderRadius: '16px',
              textAlign: 'center',
              maxWidth: '600px',
              margin: '0 auto'
            }}>
              <h2 style={{
                fontSize: '2rem',
                marginBottom: '20px',
                color: 'var(--accent)'
              }}>
                ¡Parte {currentEpisode} Disponible!
              </h2>
              <p style={{
                fontSize: '1.2rem',
                marginBottom: '30px',
                opacity: 0.9
              }}>
                La Parte {currentEpisode} ya está lista para leer
              </p>
              <a
                href={`/parte${currentEpisode}`}
                style={{
                  display: 'inline-block',
                  padding: '15px 40px',
                  background: 'var(--accent)',
                  color: 'var(--bg-primary)',
                  textDecoration: 'none',
                  borderRadius: '8px',
                  fontWeight: 'bold',
                  fontSize: '1.1rem',
                  transition: 'transform 0.2s',
                }}
                onMouseOver={(e) => e.currentTarget.style.transform = 'scale(1.05)'}
                onMouseOut={(e) => e.currentTarget.style.transform = 'scale(1)'}
              >
                Leer Ahora →
              </a>
            </div>
          </div>
        )}

        <div className="row">
          <GaleriaPartes />
        </div>

        <div className="row">
          <InfoPanel />
        </div>

      </div>
    </>
  );
}