import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./hooks/useAuthStore.js";
import Auth from "./pages/Auth.jsx";
import Home from "./pages/Home.jsx";
import Catalog from "./pages/Catalog.jsx";
import Layout from "./components/Layout.jsx";

// Wrapper para páginas con Navbar
function WithLayout({ children }) {
  return <Layout>{children}</Layout>;
}

// Páginas placeholder estáticas (sin lógica) para rutas del sidebar
function Placeholder({ title }) {
  return (
    <div className="p-6 md:p-8 max-w-[800px] w-full">
      <h1 className="text-2xl font-bold text-[#0f172a]">{title}</h1>
      <p className="text-[#64748b] mt-2">Vista estática — pendiente de implementación.</p>
      <div className="mt-6 bg-white rounded-xl p-6 border border-[#e2e8f0] text-sm text-[#94a3b8]">
        Esta ruta es solo UI. Próximamente se conectará al backend Prime.
      </div>
    </div>
  );
}

export default function App() {
  const initialize = useAuthStore((s) => s.initialize);

  useEffect(() => {
    initialize();
  }, [initialize]);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route path="/login" element={<Navigate to="/auth" replace />} />
        <Route path="/register" element={<Navigate to="/auth" replace />} />

        {/* Rutas con Navbar */}
        <Route path="/" element={<WithLayout><Home /></WithLayout>} />
        <Route path="/catalog" element={<WithLayout><Catalog /></WithLayout>} />
        <Route path="/cursos" element={<Navigate to="/catalog" replace />} />
        <Route path="/dashboard/*" element={<Navigate to="/catalog" replace />} />
        <Route path="/mis-cursos" element={<WithLayout><Placeholder title="Mis Cursos" /></WithLayout>} />
        <Route path="/pagos" element={<WithLayout><Placeholder title="Pagos" /></WithLayout>} />
        <Route path="/perfil" element={<WithLayout><Placeholder title="Mi Perfil" /></WithLayout>} />
        <Route path="/ayuda" element={<WithLayout><Placeholder title="Ayuda" /></WithLayout>} />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
