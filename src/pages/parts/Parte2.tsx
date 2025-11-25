import React, { useEffect, useRef } from "react";
import "../../assets/styles/Partes.css";
import PartLayout from "../../components/navigation/PartLayout";
import Chapter from "../../components/reading/Chapter";
import ChapterText2_1 from "../../components/texts/ChapterText2_1";
import ChapterText2_2 from "../../components/texts/ChapterText2_2";
import ChapterText2_3 from "../../components/texts/ChapterText2_3";
import ChapterText2_4 from "../../components/texts/ChapterText2_4";

export default function Parte2() {
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
      partNumber={2}
      partTitle="Parte 2: Gigante Roja"
      contentId="parte2-content"
    >
      <div className="stars-container" ref={starsRef}></div>

      <div className="horizontal-scroll">
        <div className="side-text">SUPERNOVA</div>
        <div className="side-text-right">PARTE 2</div>

        <div className="main-title">
          PARTE 2: <br />GIGANTE ROJA
        </div>

        {/* Capítulo i */}
        <Chapter
          number="i"
          title="Título del Capítulo 1"
          imageSrc="https://via.placeholder.com/800x600?text=Parte+2+Capitulo+i"
          imageAlt="Capítulo i"
          content={<ChapterText2_1 />}
        />

        {/* Capítulo ii */}
        <Chapter
          number="ii"
          title="Título del Capítulo 2"
          imageSrc="https://via.placeholder.com/800x600?text=Parte+2+Capitulo+ii"
          imageAlt="Capítulo ii"
          content={<ChapterText2_2 />}
        />

        {/* Capítulo iii */}
        <Chapter
          number="iii"
          title="Título del Capítulo 3"
          imageSrc="https://via.placeholder.com/800x600?text=Parte+2+Capitulo+iii"
          imageAlt="Capítulo iii"
          content={<ChapterText2_3 />}
        />

        {/* Capítulo iv */}
        <Chapter
          number="iv"
          title="Título del Capítulo 4"
          imageSrc="https://via.placeholder.com/800x600?text=Parte+2+Capitulo+iv"
          imageAlt="Capítulo iv"
          content={<ChapterText2_4 />}
        />
      </div>
    </PartLayout>
  );
}
