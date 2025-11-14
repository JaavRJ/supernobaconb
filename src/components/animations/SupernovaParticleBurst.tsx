import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";

interface SupernovaParticleBurstProps {
  size?: number; // tamaño base del núcleo antes de explotar
  duration?: number;
  onComplete?: () => void;
}

const SupernovaParticleBurst: React.FC<SupernovaParticleBurstProps> = ({
  size = 50,
  duration = 5,
  onComplete = () => {},
}) => {
  const coreRef = useRef<HTMLDivElement | null>(null);
  const [particles, setParticles] = useState<
    { id: number; x: number; y: number; size: number; color: string }[]
  >([]);

  // Genera las partículas sólo cuando el núcleo “se rompe”
  const generateParticles = (coreSize: number) => {
    const num = 1; // partículas más pocas pero mejor distribuidas
    const arr = [];

    for (let i = 0; i < num; i++) {
      const angle = Math.random() * Math.PI * 2;
      const dist = coreSize * (0.3 + Math.random() * 0.7);

      arr.push({
        id: i,
        x: Math.cos(angle) * dist,
        y: Math.sin(angle) * dist,
        size: 4 + Math.random() * 8,
        color: `hsl(${20 + Math.random() * 40}, 100%, ${60 + Math.random() * 20}%)`,
      });
    }

    setParticles(arr);
  };

  useEffect(() => {
    if (!coreRef.current) return;

    const tl = gsap.timeline({
        onComplete,
    });

    const finalSize = size * 15;

    // 1 — flash rápido
    tl.fromTo(
      coreRef.current,
      {
        scale: 0,
        opacity: 1,
        filter: "blur(0px)",
      },
      {
        scale: 1,
        duration: duration * 0.5,
        filter: "blur(4px)",
        backgroundColor: "#ffffff",
        boxShadow: "0 0 50px #fff",
        ease: "power4.out",
      }
    );

    // 2 — expansión violenta
    tl.to(coreRef.current, {
      scale: finalSize / size,
      duration: duration * 0,
      backgroundColor: "#0d0d1e",
      filter: "blur(12px)",
      ease: "power4.out",
      opacity: 0.3,
      onComplete: () => generateParticles(finalSize),
    });

    // 3 — desvanecimiento final del núcleo
    tl.to(coreRef.current, {
      opacity: 0,
      duration: duration * 0.50,
      filter: "blur(20px)",
      ease: "power4.in",
    });

    return () => {
    tl.kill(); 
  };  
}, []);

  // Animación de partículas una vez que nacen
  useEffect(() => {
    if (particles.length === 0) return;

    particles.forEach((p) => {
      const el = document.getElementById(`particle-${p.id}`);
      if (!el) return;

      gsap.fromTo(
        el,
        {
          x: 0,
          y: 0,
          opacity: 1,
          scale: 1,
        },
        {
          x: p.x * 3,
          y: p.y * 3,
          opacity: 0,
          scale: 0,
          duration: duration * (5 + Math.random() * 0.4),
          ease: "power4.out",
        }
      );
    });
  }, [particles]);

  return (
    <div
      style={{
        position: "absolute",
        inset: 0,
        overflow: "visible", // IMPORTANTE: NO RECORTA NADA
        pointerEvents: "none",
      }}
    >
      {/* Núcleo */}
      <div
        ref={coreRef}
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          width: size,
          height: size,
          borderRadius: "50%",
          opacity: 0,
          transform: "translate(-50%, -50%)",
          backgroundColor: "#fff",
        }}
      ></div>

      {/* Partículas */}
      {particles.map((p) => (
        <div
          key={p.id}
          id={`particle-${p.id}`}
          style={{
            position: "absolute",
            top: "50%",
            left: "50%",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
            borderRadius: "50%",
            transform: "translate(-50%, -50%)",
            filter: "blur(1px)",
          }}
        ></div>
      ))}
    </div>
  );
};

export default SupernovaParticleBurst;
