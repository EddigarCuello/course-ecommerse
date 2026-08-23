import { Link } from "react-router-dom";
import { useAuthStore } from "../hooks/useAuthStore.js";

export default function Home() {
  const { user, isAuthenticated, logout } = useAuthStore();

  return (
    <div style={{ padding: "40px 20px", maxWidth: 900, margin: "0 auto", fontFamily: "system-ui, sans-serif" }}>
      <header style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <h1 style={{ margin: 0, color: "#1e293b" }}>Prime — Course Ecommerce</h1>
        <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
          {isAuthenticated ? (
            <>
              <span style={{ color: "#475569" }}>
                Hola, <strong>{user?.nombre || user?.email}</strong> ({user?.rol})
              </span>
              <button
                onClick={logout}
                style={{
                  padding: "8px 16px",
                  borderRadius: 20,
                  border: "1px solid #e2e8f0",
                  background: "#fff",
                  cursor: "pointer",
                }}
              >
                Cerrar sesión
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              style={{
                padding: "8px 20px",
                borderRadius: 20,
                background: "#16a34a",
                color: "#fff",
                textDecoration: "none",
                fontWeight: 600,
              }}
            >
              Ingresar / Registrarse
            </Link>
          )}
        </div>
      </header>

      <section style={{ background: "#f8fafc", border: "1px solid #e2e8f0", borderRadius: 12, padding: 24 }}>
        <h2 style={{ marginTop: 0, color: "#1e293b" }}>Estado del proyecto</h2>
        <ul style={{ color: "#475569", lineHeight: 1.7 }}>
          <li>Frontend React (Vite) desacoplado de Supabase — 100% backend Prime.</li>
          <li>Auth usa <code>POST /api/auth/register</code> y <code>POST /api/auth/login</code> (MongoDB + bcrypt).</li>
          <li>WAF / verifyWafRequest eliminado por completo.</li>
          <li>Store Zustand con persistencia en localStorage (sin onAuthStateChange de Supabase).</li>
        </ul>
        {!isAuthenticated && (
          <p style={{ color: "#64748b" }}>
            Ve a <Link to="/auth">/auth</Link> para probar registro e inicio de sesión. Backend debe estar corriendo en <code>http://localhost:3000</code> (o configurar <code>VITE_API_URL</code>).
          </p>
        )}
        {isAuthenticated && (
          <pre
            style={{
              background: "#fff",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              padding: 12,
              overflow: "auto",
              fontSize: 13,
            }}
          >
            {JSON.stringify(user, null, 2)}
          </pre>
        )}
      </section>
    </div>
  );
}
