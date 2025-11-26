import React, { useEffect, useRef } from "react";
import "../../assets/styles/Partes.css";
import PartLayout from "../../components/navigation/PartLayout";
import Chapter from "../../components/reading/Chapter";
import ChapterText1_1 from "../../components/texts/ChapterText1_1";
import ChapterText1_2 from "../../components/texts/ChapterText1_2";
import ChapterText1_3 from "../../components/texts/ChapterText1_3";
import ChapterText1_4 from "../../components/texts/ChapterText1_4";
import ChapterText1_5 from "../../components/texts/ChapterText1_5";
import Photo from "../../components/Photos";

const imgUrls = [
    "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_152021_xzy1ze.png",
    "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_154559_ky1mqh.png",
    "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_154613_ef2yoz.png",
    "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_154901_unwyfp.png",
    "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_154642_nudkkb.png",
];


export default function Parte1() {
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
            partNumber={1}
            partTitle="Parte 1: Nebulosa"
            contentId="parte1-content"
        >
            <div className="stars-container" ref={starsRef}></div>

            <div className="horizontal-scroll">
                <div className="side-text">SUPERNOBA</div>
                <div className="side-text-right">PARTE 1</div>

                <div className="main-title">
                    PARTE 1: <br />NEBULOSA
                </div>

                {/* TEXTO 1 */}
                <div className="row">
                    <ChapterText1_1 />
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
                    <ChapterText1_2 />
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
                    <ChapterText1_3 />
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
                    <ChapterText1_4 />
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

                {/* TEXTO 5 */}
                <div className="row">
                    <ChapterText1_5 />
                </div>

                {/* IMAGEN 5 */}
                <div className="row">
                    <Photo
                        src={photosData.current[4].src}
                        alt="Foto 5"
                        style={{
                            transform: `rotate(${photosData.current[4].rotation}deg) scale(${0.7})`,
                        }}
                    />
                </div>
            </div>
        </PartLayout>
    );
}
