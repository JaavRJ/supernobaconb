import React, { useRef, useEffect } from "react";

interface Props {
  size?: number;
  onComplete?: () => void;
}

// Interfaz para el objeto de partícula, ahora con color HSL
interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  radius: number;
  color: { h: number; s: number; l: number }; // Color HSL
}

const SupernovaBurstCanvas: React.FC<Props> = ({ size = 1000, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    if (!ctx) return; // Comprobación de seguridad

    const particles: Particle[] = [];
    const total = 1050; // Mantenemos la alta cuenta de partículas

    for (let i = 0; i < total; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 10; // Velocidad original

      particles.push({
        x: size / 2,
        y: size / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        opacity: 1,
        radius: 1 + Math.random() * 2,
        // Colores HSL como en la versión de GSAP (tonos amarillos/naranjas)
        color: {
          h: 20 + Math.random() * 40, // Rango de HSL 20-60
          s: 100,
          l: 70 + Math.random() * 15, // Brillante
        },
      });
    }

    let frame = 0;
    const flashDuration = 90; // Duración del flash inicial (en frames)
    const particleDelay = 110; // Las partículas esperan al flash

    function animate() {
      frame++;

      // 1. Fondo con desvanecimiento (efecto de estela)
      ctx.fillStyle = `#0d0d1e`; // El fondo oscuro original
      ctx.fillRect(0, 0, size, size);

      // --- Fase 1: El Flash Blanco con Parpadeo (Estilo GSAP) ---
      if (frame < flashDuration) {
        const progress = frame / flashDuration;
        const easeOutProgress = 1 - Math.pow(1 - progress, 4);

        // Efecto de parpadeo/pulso usando seno para variar la luminosidad
        // Empieza brillante, tiene un pulso, y se desvanece
        const pulseFactor = 0.5 + 0.5 * Math.sin(frame * 0.12); // Oscila entre 0.5 y 1.5

        const currentSize = easeOutProgress * (size * 0.3);
        // Opacidad combinada: empieza en 1, pulsa, y se desvanece con el progreso
        const opacity = Math.min(1, (1 - progress) * 1.5 * pulseFactor); // Más brillante al inicio
        const blur = easeOutProgress * 15;

        ctx.save();

        //ctx.filter = `blur(${blur}px)`;
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.shadowColor = '#fff';
        // ShadowBlur también pulsa para un efecto más dinámico
        ctx.shadowBlur = 30 + (20 * pulseFactor); // Más glow y parpadeante

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, currentSize / 2, 0, Math.PI * 2);
        ctx.fill();

        ctx.restore();
      }

      // --- Fase 2: Las Partículas (Estilo GSAP) ---
      
      // Aplicamos el blur de 1px a todas las partículas

      particles.forEach((p) => {
        if (frame > particleDelay) {
          p.x += p.vx;
          p.y += p.vy;
          p.opacity -= 0.008; 

          if (p.opacity > 0) {
            ctx.beginPath();
            ctx.fillStyle = `hsla(${p.color.h}, ${p.color.s}%, ${p.color.l}%, ${p.opacity})`;
            ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
            ctx.fill();
          }
        }
      });

      ctx.filter = 'none'; // Limpiamos el filtro

      // --- Control del Loop ---
      const allParticlesFaded = particles.every((p) => p.opacity <= 0);

      if (allParticlesFaded && frame > flashDuration) {
        if (onComplete) onComplete();
      } else {
        requestAnimationFrame(animate);
      }
    }

    animate();
  }, [size, onComplete]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{ display: "block", margin: "0 auto", background: "#0d0d1e" }}
    ></canvas>
  );
};

export default SupernovaBurstCanvas;