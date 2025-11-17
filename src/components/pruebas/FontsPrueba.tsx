import React from 'react';
import styled from 'styled-components';

// --- Contenedor principal para la prueba ---
const TestWrapper = styled.div`
  padding: 3rem;
  font-family: 'Roboto', sans-serif; /* Fuente base limpia */
  flex-direction: row;
  display: flex;
  gap: 30px;
`;

// --- Componente para cada muestra de fuente ---
const FontSample = styled.div`
  border-bottom: 2px solid #444;
  margin-bottom: 3rem;
`;

// --- Etiqueta para mostrar el nombre de la fuente ---
const FontLabel = styled.p`
  font-size: 1.1rem;
  color: #999;
  font-weight: 300;
  margin: 0;
`;

// --- Título base para todas las fuentes (tamaño) ---
const BaseTitle = styled.h1`
  font-size: 2.5rem; /* Tamaño de fuente base para probar */
  font-weight: 400; /* La mayoría de estas fuentes solo tienen peso 400 */
  color: #EFEFEF;
  margin: 0.5rem 0;
  line-height: 1.3;
`;

// --- 1. Creando un componente H1 para CADA fuente ---

const TitleMetamorphous = styled(BaseTitle)`
  font-family: 'Metamorphous', cursive;
`;

const TitleUncial = styled(BaseTitle)`
  font-family: 'Uncial Antiqua', cursive;
`;

const TitleAkronim = styled(BaseTitle)`
  font-family: 'Akronim', cursive;
`;

const TitleCinzel = styled(BaseTitle)`
  font-family: 'Cinzel Decorative', cursive;
  font-size: 2.5rem; /* Esta es un poco más grande */
`;

const TitleKranky = styled(BaseTitle)`
  font-family: 'Kranky', cursive;
`;

const TitleIMFell = styled(BaseTitle)`
  font-family: 'IM Fell DW Pica', serif;
  font-size: 2.5rem; /* Ligeramente más pequeña */
`;

const TitleCormorant = styled(BaseTitle)`
  font-family: 'Cormorant Garamond', cursive;
  font-size: 2.5rem; /* Esta necesita ser más grande */
`;

const TitleGreat = styled(BaseTitle)`
  font-family: 'Great Vibes', cursive;
  font-size: 2.5rem; /* Esta también es ancha */
`;

const TitleMedieval = styled(BaseTitle)`
  font-family: 'MedievalSharp', cursive;
`;


// --- El Componente Testeador ---

const FontTester: React.FC = () => {
  const title = "Brillo de una Estrella Muerta";

  return (
    <TestWrapper>

      <FontSample>
        <FontLabel>Metamorphous</FontLabel>
        <TitleMetamorphous>{title}</TitleMetamorphous>
      </FontSample>
      
      <FontSample>
        <FontLabel>Kranky</FontLabel>
        <TitleKranky>{title}</TitleKranky>
      </FontSample>

      <FontSample>
        <FontLabel>IM Fell DW Pica (Antigua/Gastada)</FontLabel>
        <TitleIMFell>{title}</TitleIMFell>
      </FontSample>
      
      <FontSample>
        <FontLabel>Uncial Antiqua (Mítica)</FontLabel>
        <TitleUncial>{title}</TitleUncial>
      </FontSample>

      <FontSample>
        <FontLabel>Great Vibes</FontLabel>
        <TitleGreat>{title}</TitleGreat>
      </FontSample>
      
      <FontSample>
        <FontLabel>Cinzel Decorative (Celestial)</FontLabel>
        <TitleCinzel>{title}</TitleCinzel>
      </FontSample>

      <FontSample>
        <FontLabel>MedievalSharp (Medieval)</FontLabel>
        <TitleMedieval>{title}</TitleMedieval>
      </FontSample>

      <FontSample>
        <FontLabel>Cormorant</FontLabel>
        <TitleCormorant>{title}</TitleCormorant>
      </FontSample>

      <FontSample>
        <FontLabel>Akronim</FontLabel>
        <TitleAkronim>{title}</TitleAkronim>
      </FontSample>

    </TestWrapper>
  );
};

export default FontTester;