import React, { useEffect, useRef } from "react";
import "../../assets/styles/Partes.css";
import PartLayout from "../../components/navigation/PartLayout";
import Chapter from "../../components/reading/Chapter";
import ChapterText2_1 from "../../components/texts/ChapterText2_1";
import ChapterText2_2 from "../../components/texts/ChapterText2_2";
import ChapterText2_3 from "../../components/texts/ChapterText2_3";
import ChapterText2_4 from "../../components/texts/ChapterText2_4";
import Photo from "../../components/Photos";

const imgUrls = [
  "https://res.cloudinary.com/dgrhyyuef/image/upload/q_auto/f_auto/v1763505974/supernoba/IMG_20251118_112016_ains9u.png",
  "https://res.cloudinary.com/dgrhyyuef/image/upload/q_auto/f_auto/v1763505973/supernoba/IMG_20251118_111521_fqg05n.png",
  "https://res.cloudinary.com/dgrhyyuef/image/upload/q_auto/f_auto/v1763505973/supernoba/IMG_20251118_164407_lytixh.png",
  "https://res.cloudinary.com/dgrhyyuef/image/upload/q_auto/f_auto/v1765063762/supernoba/IMG_20251206_172106_kqtg6h.png",
];


export default function Parte2() {
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
      partNumber={2}
      partTitle="Parte 2: Gigante Roja"
      contentId="parte2-content"
    >
      <div className="stars-container" ref={starsRef}></div>

      <div className="horizontal-scroll">
        <div className="side-text">SUPERNOBA</div>
        <div className="side-text-right">PARTE 2</div>

        <div className="main-title">
          PARTE 2: <br />GIGANTE ROJA
        </div>

        {/* TEXTO 1 */}
        <div className="row">
          <ChapterText2_1 />
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
          <ChapterText2_2 />
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
          <ChapterText2_3 />
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

        {/* TEXTO 4 */}
        <div className="row">
          <ChapterText2_4 />
        </div>

        {/* IMAGEN 4 */}
        <div className="row">
          <Photo
            src={photosData.current[3].src}
            alt="Foto 4"
            style={{
              transform: `rotate(${photosData.current[3].rotation}deg) scale(${photosData.current[3].scale})`,
            }}
          />
        </div>


      </div>
    </PartLayout>
  );
}
