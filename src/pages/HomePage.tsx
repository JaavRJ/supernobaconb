import React, { useEffect, useRef } from "react";
import "../assets/styles/HomePage.css";
import Text1 from "../components/texts/Text1"

// IMPORTA TUS IMÁGENES
import img1 from "../assets/images/IMG_20251113_152021.png";
import img2 from "../assets/images/IMG_20251113_154559.png";
import img3 from "../assets/images/IMG_20251113_154613.png";
import img5 from "../assets/images/IMG_20251113_154642.png";
import img4 from "../assets/images/IMG_20251113_154901.png";

export default function HomePage() {

  const imagesRef = useRef<HTMLImageElement[]>([]);

  // Animar imágenes cuando son visibles en pantalla
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.3 }
    );

    imagesRef.current.forEach(img => observer.observe(img));
  }, []);

  return (
    <>
      {/* Texto fijo en los costados */}
      <div className="side-text">SUPERNOBA</div>
      <div className="side-text-right">PARTE 1</div>

      {/* Scroll horizontal principal */}
      <div className="horizontal-scroll">

        <div className="main-title">
          BRILLO DE UNA <br /> ESTRELLA MUERTA
        </div>

        {/* Columna 1 */}
        <div className="column">
          <img ref={el => { if (el) imagesRef.current.push(el);}} src={img1} alt="1" className="photo" />
          <img ref={el => { if (el) imagesRef.current.push(el);}} src={img2} alt="2" className="photo" />
        </div>

        {/* Columna 2 */}
        <div className="column">
          <img ref={el => { if (el) imagesRef.current.push(el);}} src={img3} alt="3" className="photo" />
          <img ref={el => { if (el) imagesRef.current.push(el);}} src={img4} alt="4" className="photo" />
        </div>
        
        {/* Columna 3 */}
        <div className="column">
          <Text1></Text1>
        </div>

        {/* Columna 4 */}
        <div className="column">
          <img ref={el => { if (el) imagesRef.current.push(el);}} src={img5} alt="5" className="photo" />
        </div>

        

      </div>
    </>
  );
}
