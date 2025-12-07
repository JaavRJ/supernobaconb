import React from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";

import "./App.css";
import "./utils/dataMigration"; // Helper para migrar datos desde consola
import HomeRoute from "./pages/HomeRoute";
import Cuadratico from "./pages/cifrados/Cuadratico";
import PuzzleStars from "./pages/cifrados/PuzzleStars";
import Parte1 from "./pages/parts/Parte1";
import Parte2 from "./pages/parts/Parte2";
import Parte3 from "./pages/parts/Parte3";
import Parte4 from "./pages/parts/Parte4";
import ProtectedRoute from "./components/navigation/ProtectedRoute";

// Admin imports
import AdminProtectedRoute from "./components/admin/AdminProtectedRoute";
import AdminLayout from "./components/admin/AdminLayout";
import AdminDashboard from "./pages/admin/AdminDashboard";
import PartsManager from "./pages/admin/PartsManager";
import ChaptersManager from "./pages/admin/ChaptersManager";
import NotesManager from "./pages/admin/NotesManager";
import PDFManager from "./pages/admin/PDFManager";

function App() {
  return (
    <BrowserRouter>
      <Routes>

        {/* Página principal - SIEMPRE muestra BeforePage */}
        <Route path="/" element={<HomeRoute />} />

        {/* Rutas protegidas para cada parte */}
        <Route
          path="/parte1"
          element={
            <ProtectedRoute partNumber={1}>
              <Parte1 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parte2"
          element={
            <ProtectedRoute partNumber={2}>
              <Parte2 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parte3"
          element={
            <ProtectedRoute partNumber={3}>
              <Parte3 />
            </ProtectedRoute>
          }
        />
        <Route
          path="/parte4"
          element={
            <ProtectedRoute partNumber={4}>
              <Parte4 />
            </ProtectedRoute>
          }
        />

        {/* Ruta de pruebas - siempre accesible */}
        <Route path="/pruebas" element={<Parte1 />} />

        {/* Página de puzzles */}
        <Route path="/0618am" element={<Cuadratico />} />
        <Route path="/0618am/030806" element={<PuzzleStars />} />

        {/* Admin Panel - Protected Routes */}
        <Route
          path="/admin"
          element={
            <AdminProtectedRoute>
              <AdminLayout />
            </AdminProtectedRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="parts" element={<PartsManager />} />
          <Route path="chapters" element={<ChaptersManager />} />
          <Route path="notes" element={<NotesManager />} />
          <Route path="pdfs" element={<PDFManager />} />
        </Route>

      </Routes>
    </BrowserRouter>
  );
}

export default App;
