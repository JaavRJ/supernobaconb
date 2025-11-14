// src/components/LoadingScreen.tsx
import React, { useEffect, useRef, useState, useCallback } from 'react';
import '../assets/styles/LoadingScreen.css';
// Importamos nuestra NUEVA animación de partículas de supernova GSAP
import SupernovaParticleBurst from './animations/SupernovaParticleBurst'; // <-- Asegúrate de que esta ruta sea correcta
import SupernovaBurstCanvas from './animations/SupernovaBurstCanvas'; // <-- Asegúrate de que esta ruta sea correcta
import CircularProgress from '@mui/material/CircularProgress';

interface LoadingScreenProps {
  onAnimationEnd: () => void;
}

// Duraciones para una mejor sincronización
const textVisibleDuration = 2000; // El texto "Cargando..." estará visible por 2 segundos.
const textFadeOutDuration = 500;  // El texto tardará 0.5 segundos en desvanecerse (debe coincidir con CSS).
const delayBeforeAnimation = 200; // Pequeño retardo después de que el texto desaparece antes de que inicie la animación GSAP.

const LoadingScreen: React.FC<LoadingScreenProps> = ({ onAnimationEnd }) => {
  const loadingTextRef = useRef<HTMLParagraphElement>(null);
  const [showText, setShowText] = useState(true);
  const [showGsapAnimation, setShowGsapAnimation] = useState(false);

  useEffect(() => {
    let fadeOutTextTimer: NodeJS.Timeout;
    let startGsapAnimationTimer: NodeJS.Timeout;

    // Fase 1: El texto "Cargando..." es visible de inmediato.

    // Fase 2: Iniciar el desvanecimiento del texto después de 'textVisibleDuration'
    fadeOutTextTimer = setTimeout(() => {
      if (loadingTextRef.current) {
        loadingTextRef.current.classList.add('fade-out');
      }

      // Fase 3: Iniciar la animación GSAP *después* de que el texto se haya desvanecido por completo
      startGsapAnimationTimer = setTimeout(() => {
        setShowText(false); // Ocultar completamente el elemento del texto
        setShowGsapAnimation(true); // Mostrar el componente de la animación GSAP
      }, textFadeOutDuration + delayBeforeAnimation); // Espera a que el texto se desvanezca + un pequeño gap

    }, textVisibleDuration);

    // Limpieza al desmontar el componente
    return () => {
      clearTimeout(fadeOutTextTimer);
      clearTimeout(startGsapAnimationTimer);
    };
  }, []);

  // Esta función será llamada por SupernovaParticleBurst cuando su animación termine
  const handleGsapAnimationComplete = useCallback(() => {
    onAnimationEnd(); // Notificamos al App.tsx que la pantalla de carga ya puede ocultarse
  }, [onAnimationEnd]);

  return (
    <div className="loading-screen">
      <div className="supernova-container">
        {/* Mostramos el texto si showText es true */}
        {showText && (
          <><div ref={loadingTextRef} className="loading-text">
            <CircularProgress color="inherit" />
          <p >Cargando...</p></div></>
        )}
        {/* Mostramos la animación GSAP si showGsapAnimation es true */}
        {showGsapAnimation && (
          <SupernovaBurstCanvas
            size={1000} // Puedes ajustar el tamaño del lienzo de la animación aquí para que se vea más grande
            //duration={3} // Duración total de la animación de explosión
            onComplete={handleGsapAnimationComplete} // Pasamos el callback
          />
        )}
      </div>
    </div>
  );
};

export default LoadingScreen;
