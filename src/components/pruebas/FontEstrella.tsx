import React from 'react';
import styled from 'styled-components';

// --- Título Contenedor (¡AHORA ES RESPONSIVE!) ---
const TituloContenedor = styled.h1`
  font-family: 'Uncial Antiqua', cursive; 
  font-size: 4.5rem; /* Tamaño base (para pantallas > 800px) */
  font-weight: 400;
  color: #E0E0E0;
  line-height: 1.3;
  text-align: left;
  letter-spacing: 0.05em;
  
  /* --- ¡AQUÍ ESTÁ LA LÓGICA RESPONSIVE! --- */
  @media (max-width: 800px) {
    font-size: 30px;      /* Tu tamaño de fuente para móvil */
    margin-right: 20px;   /* Tu margen para móvil */
    /* Podríamos querer centrarlo en móvil, por ejemplo: */
    /* text-align: ; */ 
  }
`;

// --- OWrapper (SIN CAMBIOS) ---
// (Se ajusta automáticamente porque 1.4em depende del font-size de TituloContenedor)
const OWrapper = styled.span`
  position: relative;
  display: inline-block;
  
  font-size: 1.4em; 
  
  vertical-align: middle; 
  margin: 0 -0.1em; 
`;

// --- EstrellaImagen (Tus cambios respetados) ---
// (SIN CAMBIOS, se ajusta automáticamente porque 80% depende de OWrapper)
const EstrellaImagen = styled.img`
  position: absolute;
  top: 51%; /* Tu ajuste */
  left: 48%; /* Tu ajuste */
  transform: translate(-50%, -50%); 
  
  height: 80%; /* Tu ajuste */
  object-fit: contain;

  z-index: 2; 
  
  filter: 
    brightness(1000%) 
    contrast(1000%) 
    drop-shadow(0 0 0px black) 
    drop-shadow(0 0 0.5px black) 
    drop-shadow(0 0 1px black);
`;

// --- Letra 'O' (Tus cambios respetados) ---
// (SIN CAMBIOS, se ajusta automáticamente)
const LetraO = styled.span`
  position: relative;
  z-index: 1;
  opacity: 1.0;
  vertical-align: middle;
`;

// --- El Componente Final ---

const TituloEstelar: React.FC = () => {
  return (
    <TituloContenedor>
      BRILL
      <OWrapper>
        <LetraO>O</LetraO> 
        <EstrellaImagen src="/logo192.png" alt="Estrella de Brillo" />
      </OWrapper>
      {' '}DE UNA <br/>ESTRELLA MUERTA
    </TituloContenedor>
  );
};

export default TituloEstelar;