import React, { useEffect, useRef } from "react";
import "../assets/styles/HomePage.css";
import Text1 from "../components/texts/Text1";
import Photo from "../components/Photos";


export default function HomePage() {

  const img1 = "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_152021_xzy1ze.png";
  const img2 = "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_154559_ky1mqh.png";
  const img3 = "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_154613_ef2yoz.png";
  const img4 = "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_154901_unwyfp.png";
  const img5 = "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_154642_nudkkb.png";

  const starsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
  const handleWheel = (e: WheelEvent) => {
    // Mover horizontal usando vertical
    window.scrollBy({
      left: e.deltaY * 5,  // Scroll vertical → horizontal
      behavior: "smooth"
    });
  };

  window.addEventListener("wheel", handleWheel, { passive: false });

   /* ====== GENERAR ESTRELLAS ====== */
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
          <Photo src={img1} alt="1" />
          <Photo src={img2} alt="2" />
        </div>


        {/* FILA 3 */}
        <div className="row">
          <Photo src={img3} alt="3" />
          <Photo src={img4} alt="4" />
        </div>

        {/* TEXTO */}
        <div className="row">
          <Text1 />
        </div>

        {/* FILA 4 */}
        <div className="row">
          <Photo src={img5} alt="5" />
        </div>
      </div>
    </>
  );
}
