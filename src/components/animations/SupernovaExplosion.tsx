// src/components/animations/SupernovaExplosionGSAP.tsx
import React, { useEffect, useRef, useCallback } from 'react';
import gsap, { Power4 } from 'gsap'; // Importamos GSAP y Power4 para los easeings

interface SupernovaExplosionGSAPProps {
  size?: number; // Tamaño del contenedor de la animación en píxeles (ej. 200)
  duration?: number; // Duración total de la animación en segundos (ej. 3)
  onComplete: () => void; // Callback para cuando la animación termina
}

const SupernovaExplosion: React.FC<SupernovaExplosionGSAPProps> = ({
  size = 500, // Tamaño por defecto si no se especifica
  duration = 3, // Duración por defecto
  onComplete,
}) => {
  // Referencias a los elementos que vamos a animar
  const containerRef = useRef<HTMLDivElement>(null);
  const coreRef = useRef<HTMLDivElement>(null);
  const wave1Ref = useRef<HTMLDivElement>(null);
  const wave2Ref = useRef<HTMLDivElement>(null);
  const wave3Ref = useRef<HTMLDivElement>(null);

  const animateExplosion = useCallback(() => {
    // Verificamos que todas las referencias existan antes de intentar animar
    if (!coreRef.current || !wave1Ref.current || !wave2Ref.current || !wave3Ref.current) return;

    // Creamos una timeline de GSAP para secuenciar nuestras animaciones
    const tl = gsap.timeline({
      onComplete: onComplete, // Llamamos a la función onComplete cuando toda la timeline termina
    });

    // Estado inicial: todos los elementos están invisibles y sin escala
    tl.set([coreRef.current, wave1Ref.current, wave2Ref.current, wave3Ref.current], {
      scale: 0,
      opacity: 0,
      transformOrigin: 'center center', // Aseguramos que la escala sea desde el centro
    });

    // Animación del núcleo de la explosión
    tl.to(coreRef.current, {
      duration: duration * 0.3, // El primer 30% de la duración total
      scale: 1, // Crece a su tamaño normal
      opacity: 1, // Se vuelve completamente visible
      backgroundColor: '#fff', // Color blanco brillante
      boxShadow: '0 0 30px #fff, 0 0 60px #ffeb3b, 0 0 90px #ff9800', // Efecto de brillo
      ease: Power4.easeOut, // Curva de animación suave al inicio
    })
    // El núcleo se expande y desvanece
    .to(coreRef.current, {
      duration: duration * 0.7, // El 70% restante de la duración
      scale: 5, // Se expande 5 veces su tamaño
      opacity: 0, // Se desvanece
      backgroundColor: '#ff4500', // Se vuelve más rojizo al enfriarse
      boxShadow: 'none', // El brillo desaparece
      ease: Power4.easeIn, // Curva de animación más rápida al final
    }, '<'); // El '<' significa que esta animación empieza al mismo tiempo que la anterior

    // Animaciones de las ondas de plasma (para un efecto de capas)
    // Onda 1 (amarillenta)
    tl.to(wave1Ref.current, {
      duration: duration * 0.6,
      scale: 2.5,
      opacity: 0,
      backgroundColor: '#ffeb3b',
      boxShadow: '0 0 15px #ffeb3b',
      ease: Power4.easeOut,
    }, duration * 0.1); // Empieza un 10% después del inicio de la animación principal

    // Onda 2 (naranja)
    tl.to(wave2Ref.current, {
      duration: duration * 0.7,
      scale: 3.5,
      opacity: 0,
      backgroundColor: '#ff9800',
      boxShadow: '0 0 20px #ff9800',
      ease: Power4.easeOut,
    }, duration * 0.2); // Empieza un 20% después

    // Onda 3 (rojiza)
    tl.to(wave3Ref.current, {
      duration: duration * 0.8,
      scale: 4.5,
      opacity: 0,
      backgroundColor: '#ff4500',
      boxShadow: '0 0 25px #ff4500',
      ease: Power4.easeOut,
    }, duration * 0.3); // Empieza un 30% después

  }, [duration, onComplete]); // Regeneramos la animación si la duración o el callback cambian

  // Usamos useEffect para ejecutar la animación cuando el componente se monta
  useEffect(() => {
    animateExplosion();
  }, [animateExplosion]);

  // Estilos del contenedor principal
  const containerStyle: React.CSSProperties = {
    width: size,
    height: size,
    position: 'relative',
    overflow: 'hidden', // Ocultamos cualquier parte de la explosión que se salga del contenedor
  };

  // Estilos comunes para los círculos de la explosión
  const commonCircleStyle: React.CSSProperties = {
    position: 'absolute',
    top: '50%',
    left: '50%',
    transform: 'translate(-50%, -50%) scale(0)', // Centrado y con escala 0 (invisible inicialmente)
    borderRadius: '50%', // Para que sean círculos
    opacity: 0, // Inicialmente invisibles
  };

  // Definimos tamaños relativos para los elementos de la explosión
  const coreSize = size * 0.1;
  const waveSize = size * 0.2;

  return (
    <div ref={containerRef} style={containerStyle} className="supernova-explosion-container">
      {/* Núcleo de la explosión */}
      <div ref={coreRef} style={{ ...commonCircleStyle, width: coreSize, height: coreSize, backgroundColor: '#fff' }}></div>
      {/* Ondas de plasma con diferentes tamaños y colores */}
      <div ref={wave1Ref} style={{ ...commonCircleStyle, width: waveSize, height: waveSize, backgroundColor: '#ffeb3b' }}></div>
      <div ref={wave2Ref} style={{ ...commonCircleStyle, width: waveSize * 1.2, height: waveSize * 1.2, backgroundColor: '#ff9800' }}></div>
      <div ref={wave3Ref} style={{ ...commonCircleStyle, width: waveSize * 1.4, height: waveSize * 1.4, backgroundColor: '#ff4500' }}></div>
    </div>
  );
};

export default SupernovaExplosion;
