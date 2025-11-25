import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import HomeRoute from "./pages/HomeRoute";   // <-- aquí
import PruebasPage from "./components/pruebas/PruebasPage";   // <-- aquí
import Cuadratico from "./pages/cifrados/Cuadratico";
import PuzzleStars from "./pages/cifrados/PuzzleStars";
import Parte1 from "./pages/parts/Parte1";
import Parte2 from "./pages/parts/Parte2";
import Parte3 from "./pages/parts/Parte3";
import Parte4 from "./pages/parts/Parte4";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Página principal - SIEMPRE muestra BeforePage */}
        <Route path="/" element={<HomeRoute />} />

        {/* Rutas para cada parte */}
        <Route path="/parte1" element={<Parte1 />} />
        <Route path="/parte2" element={<Parte2 />} />
        <Route path="/parte3" element={<Parte3 />} />
        <Route path="/parte4" element={<Parte4 />} />
        <Route path="/pruebas" element={<PruebasPage />} />

        {/* Página de puzzles */}
        <Route path="/0618am" element={<Cuadratico />} />
        <Route path="/0618am/030806" element={<PuzzleStars />} />

      </Routes>
    </BrowserRouter>
  );
}

export default App;
