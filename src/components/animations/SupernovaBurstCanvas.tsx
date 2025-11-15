import React, { useRef, useEffect, useState } from "react";

interface Props {
  size?: number;
  onComplete?: () => void;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  radius: number;
  color: { h: number; s: number; l: number };
}

const SupernovaBurstCanvas: React.FC<Props> = ({ size = 1000, onComplete }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [pressed, setPressed] = useState(false);
  const [released, setReleased] = useState(false); 

  useEffect(() => {
    const canvas = canvasRef.current;

    if (!canvas) return;

    const ctx = canvas.getContext("2d")!;
    

    if (!ctx) return;

    // PARTÍCULAS
    const particles: Particle[] = [];
    const total = 1050;
    

    for (let i = 0; i < total; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 1 + Math.random() * 10;

      particles.push({
        x: size / 2,
        y: size / 2,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        opacity: 1,
        radius: 1 + Math.random() * 2,
        color: {
          h: 20 + Math.random() * 40,
          s: 100,
          l: 70 + Math.random() * 15,
        },
      });
    }

    let frame = 0;
    const flashDuration = 30;
    const particleDelay = 35;

    let offsetX = 0;
    let offsetY = 0;
    let intensity = 0;      // intensidad actual
    let pressStartTime: number | null = null;    function animate() {
      ctx.clearRect(0, 0, size, size);
      ctx.fillStyle = "#000000";
      ctx.fillRect(0, 0, size, size);

      /* ────────────────────────────────────────────────
         FASE 0 — Bola blanca esperando click
      ───────────────────────────────────────────────── */
  
    if (!released) {
      const baseRadius = 100;
      let smoothRadius = 100; // radio suave que irá interpolando
      const targetRadius = pressed ? baseRadius - 80 : baseRadius;

      // LERP / interpolación suave
      smoothRadius = smoothRadius + (targetRadius - smoothRadius) * 0.05;
      // mientras más bajo el 0.15 más suave es la transición

      // Pequeño temblor opcional


      if (pressed) {

        // Si recién empezó a presionar, marcar el inicio.
        if (pressStartTime === null) {
          pressStartTime = performance.now();
        }

        // Tiempo presionado en segundos
        const timeHeld = (performance.now() - pressStartTime) / 1000;

        // Intensidad crece proporcional al tiempo, subir el 10 para aumentar velocidad
        intensity = Math.min(timeHeld * 10, 120);

        offsetX = (Math.random() - 0.5) * intensity;
        offsetY = (Math.random() - 0.5) * intensity;

      } else {
        // Reseteo suave al soltar
        pressStartTime = null;
        intensity *= 0.8; 
        if (intensity < 0.1) intensity = 0;

        offsetX = offsetX * 0.8;
        offsetY = offsetY * 0.8;
  }

  ctx.save();
  ctx.fillStyle = "white";
  ctx.shadowColor = "#ffffff";
  ctx.shadowBlur = pressed ? 30 : 12;

  ctx.beginPath();
  ctx.arc(
    size / 2 + offsetX,
    size / 2 + offsetY,
    smoothRadius,
    0,
    Math.PI * 2
  );
  ctx.fill();
  ctx.restore();

  requestAnimationFrame(animate);
  return;
}



      /* ────────────────────────────────────────────────
         FASE 2 — EXPLOSIÓN DESPUÉS DE SOLTAR
      ───────────────────────────────────────────────── */
      frame++;

      // FLASH
      if (frame < flashDuration) {
        const progress = frame / flashDuration;
        const easeOut = 1 - Math.pow(1 - progress, 4);
        const pulse = 1;
        const sizeFlash = easeOut * (size * 0.3);
        const opacity = Math.min(1, (1 - progress) * 1.5 * pulse);

        ctx.save();
        ctx.fillStyle = `rgba(255, 255, 255, ${opacity})`;
        ctx.shadowColor = "white";
        ctx.shadowBlur = 35 + 25 * pulse;

        ctx.beginPath();
        ctx.arc(size / 2, size / 2, sizeFlash / 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // PARTÍCULAS
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

      // FIN
      const faded = particles.every((p) => p.opacity <= 0);
      if (faded && frame > flashDuration) {
        onComplete && onComplete();
        return;
      }

      requestAnimationFrame(animate);
    }

    animate();

    /* ────────────────────────────────────────────────
       MANEJO DE CLICK & HOLD
    ───────────────────────────────────────────────── */

    const onPress = () => {
      if (!released) setPressed(true);
    };

    const onRelease = () => {
      if (!released) {
        setPressed(false);
        setReleased(true); 
      }
    };

    canvas.addEventListener("mousedown", onPress);
    canvas.addEventListener("mouseup", onRelease);
    canvas.addEventListener("mouseleave", onRelease);

    canvas.addEventListener("touchstart", onPress);
    canvas.addEventListener("touchend", onRelease);

    return () => {
      canvas.removeEventListener("mousedown", onPress);
      canvas.removeEventListener("mouseup", onRelease);
      canvas.removeEventListener("mouseleave", onRelease);
      canvas.removeEventListener("touchstart", onPress);
      canvas.removeEventListener("touchend", onRelease);
    };
  }, [size, onComplete, pressed, released]);

  return (
    <canvas
      ref={canvasRef}
      width={size}
      height={size}
      style={{
        display: "block",
        margin: "0 auto",
        background: "transparent", // pintamos fondo con ctx.fillRect; mantener transparente evita capas adicionales
        cursor: "pointer",
        border: "none",         // quitar borde
        outline: "none",  
      }}
    ></canvas>
  );
};

export default SupernovaBurstCanvas;
