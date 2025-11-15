import { useEffect, useRef } from "react";
import Timer from "../components/Cronometer";

interface DuringProps {
  timeLeft: number;
}

export default function DuringPage({ timeLeft }: DuringProps) {
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

    );

    photosRef.current.forEach(img => img && observer.observe(img));
    return () => observer.disconnect();
  }, []);

  return (
    <div className="horizontal-scroll">
      {/* CRONÓMETRO FIJO */}
      <div style={{ position: "fixed", top: "20px", left: "50%", transform: "translateX(-50%)", color: "white" }}>
        <Timer timeLeft={timeLeft} />
      </div>

      <div className="side-text">LANZAMIENTO</div>
      <div className="side-text-right">DURING</div>

      <h1 className="main-title">YA ESTÁ AQUÍ<br />EL MOMENTO</h1>

      <div className="column">
        
      </div>
    </div>
  );
}
