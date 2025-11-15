import React, { useEffect, useRef } from "react";

interface PhotoProps {
  src: string;
  alt?: string;
  style?: React.CSSProperties;

}

export default function Photo({ src, alt, style }: PhotoProps) {
  const imgRef = useRef<HTMLImageElement | null>(null);

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
      style={style}
    />
  );
}
