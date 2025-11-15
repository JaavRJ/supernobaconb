import React, { useEffect, useRef } from "react";
import "../assets/styles/Partes.css";
import Text1 from "../components/texts/Text1";
import Photo from "../components/Photos";

export default function HomePage() {
  const imgUrls = [
    "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_152021_xzy1ze.png",
    "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_154559_ky1mqh.png",
    "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_154613_ef2yoz.png",
    "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_154901_unwyfp.png",
    "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_154642_nudkkb.png",
  ];

  const starsRef = useRef<HTMLDivElement>(null);

  // Generar datos de fotos con rotación y escala aleatoria solo una vez
  const photosData = useRef(
    imgUrls.map((src) => ({
      src,
      rotation: Math.random() * 20 - 10, // -10 a +10 grados
      scale: 0.75 + Math.random() * 0.4,  // 0.9 a 1.1
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
        <div className="side-text-right">PARTE 1</div>

        <div className="main-title">
          BRILLO DE UNA <br /> ESTRELLA MUERTA
        </div>

        {/* FILA 1 */}
        <div className="row">
          {photosData.current.slice(0, 2).map((photo, idx) => (
            <Photo
              key={idx}
              src={photo.src}
              alt={`${idx + 1}`}
              style={{
                transform: `rotate(${photo.rotation}deg) scale(${photo.scale})`,
              }}
            />
          ))}
        </div>

        {/* FILA 2 */}
        <div className="row">
          {photosData.current.slice(2, 4).map((photo, idx) => (
            <Photo
              key={idx + 2}
              src={photo.src}
              alt={`${idx + 3}`}
              style={{
                transform: `rotate(${photo.rotation}deg) scale(${photo.scale})`,
              }}
            />
          ))}
        </div>

        {/* TEXTO */}
        <div className="row">
          <Text1 />
        </div>

        {/* FILA 3 */}
        <div className="row">
          <Photo
            src={photosData.current[4].src}
            alt="5"
            style={{
              transform: `rotate(${photosData.current[4].rotation}deg) scale(${photosData.current[4].scale})`,
            }}
          />
        </div>
      </div>
    </>
  );
}
