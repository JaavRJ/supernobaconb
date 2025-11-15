import React, { useEffect, useRef } from "react";

interface PhotoProps {
  src: string;
  alt?: string;
}

export default function Photo({ src, alt }: PhotoProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);

  // Crear rotación aleatoria entre -4° y +4°
  const randomRotate = Math.random() * 8 - 4;

  // Crear tamaño escalado entre 0.85 y 1.15
  const randomScale = 0.75 + Math.random() * 0.30;

  // Intersection Observer
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            entry.target.classList.add("visible");
          }
        });
      },
      { threshold: 0.3 }
    );

    if (imgRef.current) observer.observe(imgRef.current);

    return () => observer.disconnect();
  }, []);

  return (
    <img
      ref={imgRef}
      src={src}
      alt={alt}
      className="photo"
      style={{
        transform: `rotate(${randomRotate}deg) scale(${randomScale}) translateY(40px)`,  
      }}
    />
  );
}
