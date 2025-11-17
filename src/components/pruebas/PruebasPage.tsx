import React, { useEffect, useRef } from "react";
import "../../assets/styles/Partes.css";
import TextBefore1 from "../texts/TextBefore1";
import Photo from "../../components/Photos";
import FontTester from "../../components/pruebas/FontsPrueba";
import FontEstrella from "../../components/pruebas/FontEstrella";

export default function BeforePage() {
    
  const imgUrls = [
    "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_154642_nudkkb.png",
  ];

  const starsRef = useRef<HTMLDivElement>(null);

  // Generar datos de fotos con rotación y escala aleatoria solo una vez
  const photosData = useRef(
    imgUrls.map((src) => ({
      src,
      rotation: Math.random() * 20 - 10, // -10 a +10 grados
      scale: 0.75 + Math.random() * 0.1,  // 0.9 a 1.1
    }))
  );

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
    if (container) {
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

            <FontEstrella/>
        <div className="row">
        </div>
        <div className="row"> 
            <FontTester/>
        </div>

        {/* TEXTO */}
        <div className="row">
          <TextBefore1 />
        </div>

              
        </div>
           
    </>
  );
}
