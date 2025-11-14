// src/pages/HomePage.tsx
import React from "react";
import "../assets/styles/HomePage.css";

const HomePage: React.FC = () => {
  return (
    <div className="home-container">
      <div className="home-header">
        <h1 className="home-title">Brillo de una Estrella Muerta</h1>
        <p className="home-subtitle">Memorias de una estrella lejana.</p>
      </div>

      <div className="home-card">
        <img
          src="https://via.placeholder.com/300x450.png?text=Portada+de+mi+Libro"
          alt="Portada del Libro"
          className="home-cover"
        />
        <p className="home-description">
          Explora los capítulos, reflexiones y fragmentos que componen esta obra
          llena de simbolismo, emociones profundas y una narrativa íntima.
        </p>
        <button className="home-button">Entrar </button>
      </div>
    </div>
  );
};

export default HomePage;
