import React, { useEffect, useRef } from "react";
import "../../assets/styles/Partes.css";
import PartLayout from "../../components/navigation/PartLayout";
import Chapter from "../../components/reading/Chapter";
import ChapterText4_1 from "../../components/texts/ChapterText4_1";
import ChapterText4_2 from "../../components/texts/ChapterText4_2";
import ChapterText4_3 from "../../components/texts/ChapterText4_3";
import ChapterText4_4 from "../../components/texts/ChapterText4_4";
import Photo from "../../components/Photos";

const imgUrls = [
  "https://res.cloudinary.com/dgrhyyuef/image/upload/q_auto/f_auto/v1765063322/supernoba/IMG_20251206_171941_gtcubw.png",
  "https://res.cloudinary.com/dgrhyyuef/image/upload/q_auto/f_auto/v1765063322/supernoba/IMG_20251206_172014_jql8bx.png",
  "https://res.cloudinary.com/dgrhyyuef/image/upload/q_auto/f_auto/v1765760145/supernoba/IMG_20251214_185038_cvsjga.png",
  "https://res.cloudinary.com/dgrhyyuef/image/upload/q_auto/f_auto/v1765760153/supernoba/IMG_20251214_185136_rforir.png",
];


export default function Parte4() {
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
    <PartLayout
      partNumber={4}
      partTitle="Parte 4: Enana Blanca"
      contentId="parte4-content"
    >
      <div className="stars-container" ref={starsRef}></div>

      <div className="horizontal-scroll">
        <div className="side-text">ENANA BLANCA</div>
        <div className="side-text-right">PARTE 4</div>

        <div className="main-title">
          PARTE 4: <br />ENANA BLANCA
        </div>

        {/* TEXTO 1 */}
        <div className="row">
          <ChapterText4_1 />
        </div>

        {/* IMAGEN 1 */}
        <div className="row">
          <Photo
            src={photosData.current[0].src}
            alt="Foto 1"
            style={{
              transform: `rotate(${photosData.current[0].rotation}deg) scale(${photosData.current[0].scale})`,
            }}
          />
        </div>

        {/* TEXTO 2 */}
        <div className="row">
          <ChapterText4_2 />
        </div>

        {/* IMAGEN 2 */}
        <div className="row">
          <Photo
            src={photosData.current[1].src}
            alt="Foto 2"
            style={{
              transform: `rotate(${photosData.current[1].rotation}deg) scale(${photosData.current[1].scale})`,
            }}
          />
        </div>

        {/* TEXTO 3 */}
        <div className="row">
          <ChapterText4_3 />
        </div>

        {/* IMAGEN 3 */}
        <div className="row">
          <Photo
            src={photosData.current[2].src}
            alt="Foto 3"
            style={{
              transform: `rotate(${photosData.current[2].rotation}deg) scale(${photosData.current[2].scale})`,
            }}
          />
        </div>


      </div>
    </PartLayout>
  );
}
