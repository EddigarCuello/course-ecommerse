import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect } from "react";
import { useAuthStore } from "./hooks/useAuthStore.js";
import Auth from "./pages/Auth.jsx";
import Home from "./pages/Home.jsx";
import Catalog from "./pages/Catalog.jsx";
import MyCourses from "./pages/MyCourses.jsx";
import Profile from "./pages/Profile.jsx";
import Help from "./pages/Help.jsx";
import Layout from "./components/Layout.jsx";
import AdminLayout from "./pages/admin/AdminLayout.jsx";
import AdminDashboard from "./pages/admin/AdminDashboard.jsx";
import AdminCourses from "./pages/admin/AdminCourses.jsx";
import AdminCategories from "./pages/admin/AdminCategories.jsx";
import AdminInstructors from "./pages/admin/AdminInstructors.jsx";
import AdminEnrollments from "./pages/admin/AdminEnrollments.jsx";
import Payments from "./pages/Payments.jsx";

function WithLayout({ children }) {
  return <Layout>{children}</Layout>;
}

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

// Guard admin: solo rol admin (backend Prime: rol enum, seed admin@gmail.com/AdminPassword123)
function AdminRoute({ children }) {
  const user = useAuthStore((s) => s.user);
  if (user?.rol !== "admin") return <Navigate to="/" replace />;
  return children;
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

        <Route path="/" element={<WithLayout><Home /></WithLayout>} />
        <Route path="/catalog" element={<WithLayout><Catalog /></WithLayout>} />
        <Route path="/cursos" element={<Navigate to="/catalog" replace />} />
        <Route path="/dashboard/*" element={<Navigate to="/catalog" replace />} />
        <Route path="/mis-cursos" element={<WithLayout><MyCourses /></WithLayout>} />
        <Route path="/pagos" element={<WithLayout><Payments /></WithLayout>} />
        <Route path="/perfil" element={<WithLayout><Profile /></WithLayout>} />
        <Route path="/ayuda" element={<WithLayout><Help /></WithLayout>} />

        {/* Admin — protegido por rol, layout independiente oscuro */}
        <Route
          path="/admin"
          element={
            <AdminRoute>
              <AdminLayout />
            </AdminRoute>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="courses" element={<AdminCourses />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="instructors" element={<AdminInstructors />} />
          <Route path="enrollments" element={<AdminEnrollments />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
