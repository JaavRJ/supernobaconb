// src/components/GaleriaPartes.tsx
import React, { useState, useRef } from "react";
import Photo from "./Photos"; // Ajusta la ruta a tu componente Photo
import "../assets/styles/GalleryPartes.css"; // Crearemos este archivo CSS en el paso 2
// --- Datos para las 4 partes ---
const partesData = [
  {
    id: "nebulosa",
    textos: ["1. nebulosa", "nacimiento de la idea", "del arte"],
    imgSrc: "https://res.cloudinary.com/dgrhyyuef/image/upload/v1763189290/supernoba/IMG_20251113_154642_nudkkb.png", // Tu imagen original
  },
  {
    id: "gigante",
    textos: ["2. gigante roja", "crecimiento de la idea", "del amor"],
    imgSrc: "URL_DE_TU_IMAGEN_2_AQUI", // <--- REEMPLAZA ESTO
  },
  {
    id: "supernova",
    textos: ["3. supernova", "muerte de la idea", "del soñar"],
    imgSrc: "URL_DE_TU_IMAGEN_3_AQUI", // <--- REEMPLAZA ESTO
  },
  {
    id: "enana",
    textos: ["4. enana blanca", "sacrificio de la idea", "del recuerdo"],
    imgSrc: "URL_DE_TU_IMAGEN_4_AQUI", // <--- REEMPLAZA ESTO
  },
];
// ---------------------------------

export default function GaleriaPartes() {
  // Estado para saber qué parte está activa
  const [activeId, setActiveId] = useState(partesData[0].id); // Empieza con la primera

  // Generar datos de fotos con rotación y escala aleatoria solo una vez
  const photosData = useRef(
    partesData.map((parte) => ({
      ...parte,
      rotation: Math.random() * 14 - 7, // -7 a +7 grados
      scale: 0.7, // Usamos la misma escala que tenías
      alt: parte.textos[0],
    }))
  );

  return (
    // Este es el contenedor de 2 columnas
    <div className="galeria-contenedor">
      
      {/* Columna Izquierda: El Menú */}
      <nav className="galeria-menu">
        {partesData.map((parte) => (
          <div
            key={parte.id}
            className={`item-menu ${activeId === parte.id ? "activo" : ""}`}
            onClick={() => setActiveId(parte.id)}
          >
            <span>{parte.textos[0]}</span>
            <span>{parte.textos[1]}</span>
            <span>{parte.textos[2]}</span>
          </div>
        ))}
      </nav>

      {/* Columna Derecha: El Visor de Imágenes */}
      <div className="galeria-visor">
        {photosData.current.map((foto) => (
          <div
            key={foto.id}
            className={`contenedor-foto ${activeId === foto.id ? "visible" : ""}`}
          >
            <Photo
              src={foto.imgSrc}
              alt={foto.alt}
              style={{
                transform: `rotate(${foto.rotation}deg) scale(${foto.scale})`,
              }}
            />
          </div>
        ))}
      </div>

    </div>
  );
}