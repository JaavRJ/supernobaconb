import React, { useEffect, useRef } from "react";
import "../assets/styles/Partes.css";
import FontEstrella from "../components/pruebas/FontEstrella";
import GaleriaPartes from "../components/GalleryPartes"; 
import InfoPanel from "../components/InfoPanel"; 

export default function BeforePage() {

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