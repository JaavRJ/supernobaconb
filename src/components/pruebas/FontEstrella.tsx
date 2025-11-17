import React from 'react';
import styled from 'styled-components';

// --- Título Contenedor (sin cambios) ---
const TituloContenedor = styled.h1`
  font-family: 'Gergia', serif; /* Tu elección de fuente */
  font-size: 3.5rem; /* Tu elección de tamaño */
  font-weight: 400;
  color: #E0E0E0;
  line-height: 1.3;
  letter-spacing: 0.05em;
`;

// --- OWrapper (¡Cambio clave!) ---
const OWrapper = styled.span`
  position: relative;
  display: inline-block;
  
  /* --- ¡CAMBIO CLAVE AQUÍ! --- */
  /* Hacemos el contenedor un 140% más grande que la fuente base */
  font-size: 4.0rem; /* <--- Prueba ajustar este valor (ej. 1.3em, 1.5em) */
  
  /* Esto centra el "medallón" verticalmente con el resto del texto */
  
  /* Ajuste fino para que no se separe tanto de la 'L' */
`;

// --- EstrellaImagen (Sin cambios, se auto-ajusta) ---
const EstrellaImagen = styled.img`
  position: absolute;
  top: 14%; 
  left: 8%;
  
  width: 80%; /* 60% del NUEVO tamaño más grande */
  height: 80%; /* 60% del NUEVO tamaño más grande */
  object-fit: contain;
  
  z-index: 2; 
  filter: drop-shadow(0 0 5px rgba(255, 255, 255, 1)) 
          drop-shadow(0 0 10px rgba(193, 193, 193, 1));
`;

// --- Letra 'O' (¡Cambio clave!) ---
const LetraO = styled.span`
  position: relative;
  z-index: 1;
  opacity: 0.8;
  
  /* --- ¡CAMBIO CLAVE AQUÍ! --- */
  /* Asegura que la 'O' también se alinee bien dentro de su Wrapper */
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
      {' '}DE UNA ESTRELLA MUERTA
    </TituloContenedor>
  );
};

export default TituloEstelar;