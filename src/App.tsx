import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import HomeRoute from "./pages/HomeRoute";   // <-- aquí
import PruebasPage from "./components/pruebas/PruebasPage";   // <-- aquí
import Cuadratico from "./pages/cifrados/Cuadratico";
import PuzzleStars from "./pages/cifrados/PuzzleStars";
import Parte1 from "./pages/parts/Parte1";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Página principal con loading */}
        <Route path="/" element={<HomeRoute />} />
        <Route path="/pruebas" element={<Parte1 />} />

        {/* Página de puzzles */}
        <Route path="/0618am" element={<Cuadratico />} />
        <Route path="/0618am/030806" element={<PuzzleStars />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
