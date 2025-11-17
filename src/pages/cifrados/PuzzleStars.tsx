// src/pages/Constellation.tsx
import { useState } from "react";
import DraggableStar, { StarPosition } from "./DrggleStar";

export default function PuzzleStars() {
  // Posiciones iniciales (desordenadas)
  const [positions, setPositions] = useState<StarPosition[]>([
    { id: 1, x: 100, y: 100 },
    { id: 2, x: 300, y: 200 },
    { id: 3, x: 150, y: 350 },
    { id: 4, x: 500, y: 100 },
    { id: 5, x: 380, y: 350 }
  ]);

  // Posiciones objetivo (constelación correcta)
  const targets: StarPosition[] = [
    { id: 1, x: 800, y: 150 },
    { id: 2, x: 900, y: 220 },
    { id: 3, x: 820, y: 350 },
    { id: 4, x: 1000, y: 170 },
    { id: 5, x: 940, y: 330 }
  ];

  const [completed, setCompleted] = useState(0);

  return (
    <div
      style={{
        width: "2000px",
        height: "100vh",
        background: "black",
        position: "relative",
        overflow: "hidden",
        color: "white",
        padding: "20px"
      }}
    >
      <h1 style={{ position: "absolute", left: 20, top: 20 }}>
        ⭐ Arma la constelación ({completed}/{positions.length})
      </h1>

      {/* Dibujar los puntos objetivo */}
      {targets.map((t) => (
        <div
          key={t.id}
          style={{
            width: 15,
            height: 15,
            background: "rgba(255,255,255,0.3)",
            borderRadius: "50%",
            position: "absolute",
            left: t.x,
            top: t.y
          }}
        />
      ))}

      {/* Estrellas arrastrables */}
      {positions.map((pos, index) => (
        <DraggableStar
          key={pos.id}
          id={pos.id}
          index={index}
          pos={pos}
          target={targets[index]}
          positions={positions}
          setPositions={setPositions}
          setCompleted={setCompleted}
        />
      ))}

      {/* Mensaje final */}
      {completed === positions.length && (
        <div
          style={{
            position: "absolute",
            top: "40%",
            left: "40%",
            fontSize: "3rem",
            color: "#00d9ff",
            textShadow: "0 0 20px #00d9ff"
          }}
        >
          ⭐ CONSTELACIÓN COMPLETA ⭐  
          <br />
          <span style={{ fontSize: "1.5rem" }}>
            Has desbloqueado un fragmento oculto
          </span>
        </div>
      )}
    </div>
  );
}
