import React, { useEffect, useRef } from "react";
import "../../assets/styles/Partes.css";
import PartLayout from "../../components/navigation/PartLayout";
import Chapter from "../../components/reading/Chapter";
import ChapterText4_1 from "../../components/texts/ChapterText4_1";
import ChapterText4_2 from "../../components/texts/ChapterText4_2";
import ChapterText4_3 from "../../components/texts/ChapterText4_3";
import ChapterText4_4 from "../../components/texts/ChapterText4_4";

export default function Parte4() {
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
        <div className="side-text">SUPERNOVA</div>
        <div className="side-text-right">PARTE 4</div>

        <div className="main-title">
          PARTE 4: <br />ENANA BLANCA
        </div>

        {/* Capítulo i */}
        <Chapter
          number="i"
          title="Título del Capítulo 1"
          imageSrc="https://via.placeholder.com/800x600?text=Parte+4+Capitulo+i"
          imageAlt="Capítulo i"
          content={<ChapterText4_1 />}
        />

        {/* Capítulo ii */}
        <Chapter
          number="ii"
          title="Título del Capítulo 2"
          imageSrc="https://via.placeholder.com/800x600?text=Parte+4+Capitulo+ii"
          imageAlt="Capítulo ii"
          content={<ChapterText4_2 />}
        />

        {/* Capítulo iii */}
        <Chapter
          number="iii"
          title="Título del Capítulo 3"
          imageSrc="https://via.placeholder.com/800x600?text=Parte+4+Capitulo+iii"
          imageAlt="Capítulo iii"
          content={<ChapterText4_3 />}
        />

        {/* Capítulo iv */}
        <Chapter
          number="iv"
          title="Título del Capítulo 4"
          imageSrc="https://via.placeholder.com/800x600?text=Parte+4+Capitulo+iv"
          imageAlt="Capítulo iv"
          content={<ChapterText4_4 />}
        />
      </div>
    </PartLayout>
  );
}
