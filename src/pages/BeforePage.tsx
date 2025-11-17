
import React, { useEffect, useRef } from "react";
import "../assets/styles/Partes.css";
// import TextBefore1 from "../components/texts/TextBefore1"; // Ya no se usa
// import TextBefore2 from "../components/texts/TextBefore2"; // Ya no se usa
// import TextBefore3 from "../components/texts/TextBefore3"; // Ya no se usa
// import TextBefore4 from "../components/texts/TextBefore4"; // Ya no se usa
// import Photo from "../components/Photos"; // Ya no se usa aquí
import FontEstrella from "../components/pruebas/FontEstrella";
// import TextImages from "../components/TextImages"; // Ya no se usa

// --- ¡IMPORTA TU NUEVO COMPONENTE! ---
import GaleriaPartes from "../components/GalleryPartes"; // Ajusta la ruta

export default function BeforePage() {
  // --- TODA TU LÓGICA DE 'imgUrls' y 'photosData' SE FUE A 'GaleriaPartes' ---

  const starsRef = useRef<HTMLDivElement>(null);

  // --- TU LÓGICA DE 'useEffect' SE QUEDA EXACTAMENTE IGUAL ---
  useEffect(() => {
    // Scroll horizontal con la rueda
    const handleWheel = (e: WheelEvent) => {
      window.scrollBy({
        left: e.deltaY * 5,
        behavior: "smooth",
      });
    };
    window.addEventListener("wheel", handleWheel, { passive: false });

    // Generar estrellas (se queda igual)
    const container = starsRef.current;
    if (container && container.children.length === 0) { // Añadí una comprobación para no duplicar
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

        {/* --- ESTA ES LA SECCIÓN IMPORTANTE --- */}
        {/*
          Aquí reemplazamos tus 5 'row' antiguos 
          por UNO SOLO que contiene la galería.
        */}
        <div className="row">
          <GaleriaPartes />
        </div>
        
        {/* Si quieres más contenido en tu scroll horizontal,
          puedes añadir más 'row' aquí.
          Ejemplo:
          <div className="row">
             <h2>Otra sección...</h2>
          </div>
        */}

      </div>
    </>
  );
}