import { useEffect, useRef } from "react";
import Timer from "../components/Cronometer";

interface BeforeProps {
  timeLeft: number;
}

export default function BeforePage({ timeLeft }: BeforeProps) {
  const photosRef = useRef<HTMLImageElement[]>([]);

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

    photosRef.current.forEach(img => img && observer.observe(img));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="horizontal-scroll">
      {/* CRONÓMETRO FIJO */}
      <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", color: "white" }}>
      </div>

      <div className="side-text">PRE-LANZAMIENTO</div>
      <div className="side-text-right">BEFORE</div>

      <h1 className="main-title">EL VIAJE<br />COMIENZA PRONTO</h1>

      <div className="column">
      </div>

    </div>
  );
}
